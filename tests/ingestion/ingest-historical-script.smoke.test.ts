import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function runIngestScript(args: string[]) {
  const result = spawnSync(npxCommand, ["tsx", "scripts/ingest-historical.ts", ...args], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
  });

  return {
    status: result.status,
    output: `${result.stdout ?? ""}\n${result.stderr ?? ""}`,
  };
}

describe("ingest-historical CLI smoke", () => {
  it("fails when --year is missing", () => {
    const result = runIngestScript([]);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toMatch(/year/i);
  }, 120_000);

  it("fails when --year is invalid", () => {
    const result = runIngestScript(["--year=not-a-year"]);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toMatch(/year/i);
  }, 120_000);
});
