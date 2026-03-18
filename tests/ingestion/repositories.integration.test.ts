import "dotenv/config";
import { spawnSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

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

async function loadRepositoriesModule() {
  const modulePath = "../../../src/repositories";
  try {
    return await import(modulePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      "Expected module src/repositories/index.ts exporting createMeetingRepository/createSessionRepository/createDriverRepository/createLapRepository. "
      + message,
    );
  }
}

describeIntegration("Ingestion repositories idempotency", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    expect(process.env.DATABASE_URL, "DATABASE_URL must be set for integration tests").toBeTruthy();
    runPrismaDbPush();

    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();
  }, 120_000);

  beforeEach(async () => {
    await prisma.lap.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.session.deleteMany();
    await prisma.meeting.deleteMany();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  it("insertMany uses skipDuplicates semantics for all ingestion entities", async () => {
    const {
      createMeetingRepository,
      createSessionRepository,
      createDriverRepository,
      createLapRepository,
    } = await loadRepositoriesModule();

    const meetingRepository = createMeetingRepository(prisma);
    const sessionRepository = createSessionRepository(prisma);
    const driverRepository = createDriverRepository(prisma);
    const lapRepository = createLapRepository(prisma);

    const meetings = [
      {
        meetingKey: 925001,
        meetingName: "Test Grand Prix",
        meetingOfficialName: "FORMULA 1 TEST GRAND PRIX 2025",
        location: "Test City",
        countryKey: 999,
        countryCode: "TST",
        countryName: "Testland",
        countryFlag: "https://example.com/flag.png",
        circuitKey: 555,
        circuitShortName: "Test Circuit",
        circuitType: "Permanent",
        circuitInfoURL: "https://example.com/circuit-info",
        circuitImage: "https://example.com/circuit.png",
        gmtOffset: 10800,
        dateStart: new Date("2025-07-11T10:00:00+00:00"),
        dateEnd: new Date("2025-07-13T14:00:00+00:00"),
        year: 2025,
      },
    ];

    const sessions = [
      {
        sessionKey: 935001,
        label: "Test Grand Prix - Race",
      },
    ];

    const drivers = [
      {
        meetingKey: 925001,
        sessionKey: 935001,
        driverNumber: 4,
        broadcastName: "L NORRIS",
        firstName: "Lando",
        lastName: "Norris",
        fullName: "Lando NORRIS",
        nameAcronym: "NOR",
        headshotURL: "https://example.com/norris.png",
      },
      {
        meetingKey: 925001,
        sessionKey: 935001,
        driverNumber: 16,
        broadcastName: "C LECLERC",
        firstName: "Charles",
        lastName: "Leclerc",
        fullName: "Charles LECLERC",
        nameAcronym: "LEC",
        headshotURL: "https://example.com/leclerc.png",
      },
    ];

    const laps = [
      {
        dateStart: new Date("2025-07-13T12:01:00+00:00"),
        driverNumber: 4,
        durationSector1: 20.101,
        durationSector2: 33.202,
        durationSector3: 29.303,
        i1Speed: 280,
        i2Speed: 295,
        isPitOutLap: false,
        lapDuration: 82.606,
        lapNumber: 1,
        meetingKey: 925001,
        segmentsSector1: [2048, 2049, 2049],
        segmentsSector2: [2049, 2051, 2049],
        segmentsSector3: [2049, 2049, 2048],
        sessionKey: 935001,
        stSpeed: 314,
      },
      {
        dateStart: new Date("2025-07-13T12:01:03+00:00"),
        driverNumber: 16,
        durationSector1: 20.221,
        durationSector2: 33.412,
        durationSector3: 29.512,
        i1Speed: 279,
        i2Speed: 293,
        isPitOutLap: false,
        lapDuration: 83.145,
        lapNumber: 1,
        meetingKey: 925001,
        segmentsSector1: [2049, 2048, 2049],
        segmentsSector2: [2049, 2049, 2049],
        segmentsSector3: [2048, 2049, 2049],
        sessionKey: 935001,
        stSpeed: 312,
      },
    ];

    expect(await meetingRepository.insertMany(meetings)).toBe(1);
    expect(await sessionRepository.insertMany(sessions)).toBe(1);
    expect(await driverRepository.insertMany(drivers)).toBe(2);
    expect(await lapRepository.insertMany(laps)).toBe(2);

    expect(await meetingRepository.insertMany(meetings)).toBe(0);
    expect(await sessionRepository.insertMany(sessions)).toBe(0);
    expect(await driverRepository.insertMany(drivers)).toBe(0);
    expect(await lapRepository.insertMany(laps)).toBe(0);

    expect(await prisma.meeting.count()).toBe(1);
    expect(await prisma.session.count()).toBe(1);
    expect(await prisma.driver.count()).toBe(2);
    expect(await prisma.lap.count()).toBe(2);
  }, 120_000);
});
