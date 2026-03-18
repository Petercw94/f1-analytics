import "dotenv/config";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startOpenF1FixtureServer, type FixtureServer } from "./helpers/openf1-fixture-server";

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === "1" ? describe : describe.skip;
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function runPrismaDbPush(): void {
  const result = spawnSync(npxCommand, ["prisma", "db", "push", "--skip-generate"], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
  });

  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  expect(result.status, output).toBe(0);
}

function runIngestScript(year: number, envOverrides: Record<string, string>) {
  const result = spawnSync(npxCommand, ["tsx", "scripts/ingest-historical.ts", `--year=${year}`], {
    cwd: process.cwd(),
    env: { ...process.env, ...envOverrides },
    encoding: "utf8",
  });

  return {
    status: result.status,
    output: `${result.stdout ?? ""}\n${result.stderr ?? ""}`,
  };
}

describeIntegration("ingest-historical fixture integration", () => {
  let prisma: PrismaClient;
  let fixtureServer: FixtureServer;

  beforeAll(async () => {
    expect(process.env.DATABASE_URL, "DATABASE_URL must be set for integration tests").toBeTruthy();
    runPrismaDbPush();

    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();

    const fixturesDir = path.resolve("tests/fixtures/openf1");
    fixtureServer = await startOpenF1FixtureServer(fixturesDir);
  }, 120_000);

  beforeEach(async () => {
    await prisma.lap.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.session.deleteMany();
    await prisma.meeting.deleteMany();
  });

  afterAll(async () => {
    if (fixtureServer) {
      await fixtureServer.close();
    }
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  it("ingests one year end-to-end from fixtures and is idempotent on second run", async () => {
    const envOverrides = {
      OPENF1_BASE_URL: fixtureServer.baseUrl,
      OPENF1_API_VERSION: "v1",
    };

    const firstRun = runIngestScript(2025, envOverrides);
    expect(firstRun.status, firstRun.output).toBe(0);
    expect(firstRun.output).toMatch(/meetings/i);
    expect(firstRun.output).toMatch(/sessions/i);
    expect(firstRun.output).toMatch(/drivers/i);
    expect(firstRun.output).toMatch(/laps/i);
    expect(firstRun.output).toMatch(/meetings\D+1/i);
    expect(firstRun.output).toMatch(/sessions\D+1/i);
    expect(firstRun.output).toMatch(/drivers\D+2/i);
    expect(firstRun.output).toMatch(/laps\D+3/i);

    const countsAfterFirstRun = {
      meetings: await prisma.meeting.count(),
      sessions: await prisma.session.count(),
      drivers: await prisma.driver.count(),
      laps: await prisma.lap.count(),
    };

    expect(countsAfterFirstRun).toEqual({
      meetings: 1,
      sessions: 1,
      drivers: 2,
      laps: 3,
    });

    const secondRun = runIngestScript(2025, envOverrides);
    expect(secondRun.status, secondRun.output).toBe(0);
    expect(secondRun.output).toMatch(/meetings\D+0/i);
    expect(secondRun.output).toMatch(/sessions\D+0/i);
    expect(secondRun.output).toMatch(/drivers\D+0/i);
    expect(secondRun.output).toMatch(/laps\D+0/i);

    const countsAfterSecondRun = {
      meetings: await prisma.meeting.count(),
      sessions: await prisma.session.count(),
      drivers: await prisma.driver.count(),
      laps: await prisma.lap.count(),
    };

    expect(countsAfterSecondRun).toEqual(countsAfterFirstRun);
  }, 120_000);
});
