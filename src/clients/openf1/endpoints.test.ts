import { describe, expect, it, vi } from "vitest";
import { createOpenF1Client } from "./client";

describe("openf1 endpoint wrappers contract", () => {
  it("getMeetings hits /v1/meetings with serialized query params", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    const client = createOpenF1Client(
      {
        baseUrl: "https://api.openf1.org",
        apiVersion: "v1",
        timeoutMs: 500,
        maxRetryAttempts: 0,
        backoffBaseMs: 1,
        backoffMaxMs: 1,
      },
      {
        fetch: fetchMock as typeof fetch,
        sleep: async () => {},
        random: () => 0,
      },
    );

    await client.getMeetings({ year: 2025, country_name: "Italy" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [firstArg] = fetchMock.mock.calls[0];
    const url = firstArg as URL;
    expect(url.toString()).toBe("https://api.openf1.org/v1/meetings?year=2025&country_name=Italy");
  });

  it("getDrivers serializes required session_key parameter", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    const client = createOpenF1Client(
      {
        baseUrl: "https://api.openf1.org",
        apiVersion: "v1",
        timeoutMs: 500,
        maxRetryAttempts: 0,
        backoffBaseMs: 1,
        backoffMaxMs: 1,
      },
      {
        fetch: fetchMock as typeof fetch,
        sleep: async () => {},
        random: () => 0,
      },
    );

    await client.getDrivers({ session_key: "latest", driver_number: 81 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [firstArg] = fetchMock.mock.calls[0];
    const url = firstArg as URL;
    expect(url.pathname).toBe("/v1/drivers");
    expect(url.searchParams.get("session_key")).toBe("latest");
    expect(url.searchParams.get("driver_number")).toBe("81");
  });
});
