import { describe, expect, it } from "vitest";

async function loadOffsetModule() {
  const modulePath = "../../../src/services/ingestion/offset";
  try {
    return await import(modulePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Expected module src/services/ingestion/offset.ts exporting parseGmtOffsetToSeconds. ${message}`,
    );
  }
}

describe("parseGmtOffsetToSeconds contract", () => {
  it("parses positive offsets into signed seconds", async () => {
    const { parseGmtOffsetToSeconds } = await loadOffsetModule();

    expect(parseGmtOffsetToSeconds("+03:00:00")).toBe(10800);
    expect(parseGmtOffsetToSeconds("02:30:00")).toBe(9000);
  });

  it("parses negative offsets into signed seconds", async () => {
    const { parseGmtOffsetToSeconds } = await loadOffsetModule();

    expect(parseGmtOffsetToSeconds("-04:00:00")).toBe(-14400);
    expect(parseGmtOffsetToSeconds("-00:30:00")).toBe(-1800);
  });

  it("handles zero offset", async () => {
    const { parseGmtOffsetToSeconds } = await loadOffsetModule();

    expect(parseGmtOffsetToSeconds("+00:00:00")).toBe(0);
    expect(parseGmtOffsetToSeconds("00:00:00")).toBe(0);
  });

  it("throws on malformed offsets", async () => {
    const { parseGmtOffsetToSeconds } = await loadOffsetModule();

    expect(() => parseGmtOffsetToSeconds("3:00")).toThrow(/offset/i);
    expect(() => parseGmtOffsetToSeconds("abc")).toThrow(/offset/i);
    expect(() => parseGmtOffsetToSeconds("+25:00:00")).toThrow(/offset/i);
  });
});
