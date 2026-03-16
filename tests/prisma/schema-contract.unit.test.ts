import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const schemaPath = path.resolve("prisma/schema.prisma");

function readSchema(): string {
  return fs.readFileSync(schemaPath, "utf8");
}

function getModelBlock(schema: string, modelName: string): string {
  const escapedModelName = modelName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const modelPattern = new RegExp(`model\\s+${escapedModelName}\\s*\\{([\\s\\S]*?)\\n\\}`, "m");
  const match = schema.match(modelPattern);

  expect(match, `Expected model ${modelName} to exist in prisma/schema.prisma`).not.toBeNull();
  return match![1];
}

describe("Prisma ingestion schema contract", () => {
  it("defines Meeting, Session, Driver, and Lap models", () => {
    const schema = readSchema();

    expect(schema).toMatch(/model\s+Meeting\s*\{/m);
    expect(schema).toMatch(/model\s+Session\s*\{/m);
    expect(schema).toMatch(/model\s+Driver\s*\{/m);
    expect(schema).toMatch(/model\s+Lap\s*\{/m);
  });

  it("enforces unique Meeting.meetingKey", () => {
    const schema = readSchema();
    const meetingModel = getModelBlock(schema, "Meeting");

    expect(meetingModel).toMatch(/meetingKey\s+\w+(?:\?|\[\])?\s+@unique/m);
  });

  it("enforces unique Session.sessionKey", () => {
    const schema = readSchema();
    const sessionModel = getModelBlock(schema, "Session");

    expect(sessionModel).toMatch(/sessionKey\s+\w+(?:\?|\[\])?\s+@unique/m);
  });

  it("enforces compound unique Driver(sessionKey, driverNumber)", () => {
    const schema = readSchema();
    const driverModel = getModelBlock(schema, "Driver");

    expect(driverModel).toMatch(/@@unique\(\[\s*sessionKey\s*,\s*driverNumber\s*\]\)/m);
  });

  it("enforces compound unique Lap(sessionKey, driverNumber, lapNumber)", () => {
    const schema = readSchema();
    const lapModel = getModelBlock(schema, "Lap");

    expect(lapModel).toMatch(
      /@@unique\(\[\s*sessionKey\s*,\s*driverNumber\s*,\s*lapNumber\s*\]\)/m,
    );
  });
});
