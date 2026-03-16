import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

type CommandResult = {
  status: number | null;
  output: string;
};

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function runPrismaCommand(args: string[]): CommandResult {
  const result = spawnSync(npxCommand, ["prisma", ...args], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
  });

  return {
    status: result.status,
    output: `${result.stdout ?? ""}\n${result.stderr ?? ""}`,
  };
}

describe("Prisma CLI smoke", () => {
  it("prisma validate succeeds", () => {
    const result = runPrismaCommand(["validate"]);
    expect(result.status, result.output).toBe(0);
  }, 120_000);

  it("prisma generate succeeds", () => {
    const result = runPrismaCommand(["generate"]);
    expect(result.status, result.output).toBe(0);
  }, 120_000);
});
