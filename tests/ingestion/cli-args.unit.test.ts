import { describe, expect, it } from "vitest";

async function loadCliArgsModule() {
  const modulePath = "../../../src/services/ingestion/cli-args";
  try {
    return await import(modulePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Expected module src/services/ingestion/cli-args.ts. ${message}`);
  }
}

describe("parseIngestHistoricalArgs contract", () => {
  it("parses --year=YYYY", async () => {
    const { parseIngestHistoricalArgs } = await loadCliArgsModule();

    expect(parseIngestHistoricalArgs(["--year=2025"])).toEqual({ year: 2025 });
  });

  it("parses --year YYYY", async () => {
    const { parseIngestHistoricalArgs } = await loadCliArgsModule();

    expect(parseIngestHistoricalArgs(["--year", "2025"])).toEqual({ year: 2025 });
  });

  it("throws on missing --year", async () => {
    const { parseIngestHistoricalArgs } = await loadCliArgsModule();

    expect(() => parseIngestHistoricalArgs([])).toThrow(/year/i);
  });

  it("throws on non-integer year", async () => {
    const { parseIngestHistoricalArgs } = await loadCliArgsModule();

    expect(() => parseIngestHistoricalArgs(["--year=20x5"])).toThrow(/year/i);
  });

  it("throws on years outside supported OpenF1 historical range", async () => {
    const { parseIngestHistoricalArgs } = await loadCliArgsModule();

    expect(() => parseIngestHistoricalArgs(["--year=2022"])).toThrow(/2023/i);
  });
});
