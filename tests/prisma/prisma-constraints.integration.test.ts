import "dotenv/config";
import { spawnSync } from "node:child_process";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === "1" ? describe : describe.skip;
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

type UniqueIndexRow = {
  index_name: string;
  columns: string[] | string;
};

function normalizeColumns(value: string[] | string): string[] {
  if (Array.isArray(value)) {
    return value;
  }

  const trimmed = value.replace(/^\{/, "").replace(/\}$/, "").trim();
  if (!trimmed) {
    return [];
  }

  return trimmed.split(",").map((column) => column.trim().replace(/^"|"$/g, ""));
}

function runPrismaDbPush(): void {
  const result = spawnSync(npxCommand, ["prisma", "db", "push"], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
  });

  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  expect(result.status, output).toBe(0);
}

describeIntegration("Prisma unique constraints integration", () => {
  let client: Client;

  beforeAll(async () => {
    expect(process.env.DATABASE_URL, "DATABASE_URL must be set for integration tests").toBeTruthy();

    runPrismaDbPush();

    client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
  }, 120_000);

  afterAll(async () => {
    if (client) {
      await client.end();
    }
  });

  async function expectUniqueIndex(tableName: string, expectedColumns: string[]): Promise<void> {
    const queryResult = await client.query<UniqueIndexRow>(
      `
      SELECT
        idx.relname AS index_name,
        array_agg(att.attname ORDER BY ord.ordinality) AS columns
      FROM pg_class tbl
      JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
      JOIN pg_index ind ON ind.indrelid = tbl.oid
      JOIN pg_class idx ON idx.oid = ind.indexrelid
      JOIN unnest(ind.indkey) WITH ORDINALITY AS ord(attnum, ordinality) ON true
      JOIN pg_attribute att ON att.attrelid = tbl.oid AND att.attnum = ord.attnum
      WHERE ns.nspname = 'public'
        AND tbl.relname = $1
        AND ind.indisunique = true
      GROUP BY idx.relname
      `,
      [tableName],
    );

    const hasExpectedUnique = queryResult.rows.some((row) => {
      const columns = normalizeColumns(row.columns);
      return columns.length === expectedColumns.length
        && columns.every((columnName, idx) => columnName === expectedColumns[idx]);
    });

    expect(
      hasExpectedUnique,
      `Expected unique index on ${tableName}(${expectedColumns.join(", ")}). Found: ${JSON.stringify(queryResult.rows)}`,
    ).toBe(true);
  }

  it("has unique index for Meeting.meetingKey", async () => {
    await expectUniqueIndex("Meeting", ["meetingKey"]);
  });

  it("has unique index for Session.sessionKey", async () => {
    await expectUniqueIndex("Session", ["sessionKey"]);
  });

  it("has unique index for Driver(sessionKey, driverNumber)", async () => {
    await expectUniqueIndex("Driver", ["sessionKey", "driverNumber"]);
  });

  it("has unique index for Lap(sessionKey, driverNumber, lapNumber)", async () => {
    await expectUniqueIndex("Lap", ["sessionKey", "driverNumber", "lapNumber"]);
  });
});
