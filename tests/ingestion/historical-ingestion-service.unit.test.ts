import { describe, expect, it, vi } from "vitest";

async function loadServiceModule() {
  const modulePath = "../../../src/services/ingestion/historical-ingestion-service";
  try {
    return await import(modulePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Expected module src/services/ingestion/historical-ingestion-service.ts. ${message}`,
    );
  }
}

describe("ingestHistoricalYear contract", () => {
  it("ingests entities in strict order and returns inserted counts", async () => {
    const { ingestHistoricalYear } = await loadServiceModule();
    const order: string[] = [];

    const openF1 = {
      getMeetings: vi.fn(async () => [{ meeting_key: 925001, meeting_name: "Test GP" }]),
      getSessions: vi.fn(async () => [{ session_key: 935001, session_name: "Race", meeting_key: 925001 }]),
      getDrivers: vi.fn(async () => [
        {
          meeting_key: 925001,
          session_key: 935001,
          driver_number: 4,
          broadcast_name: "L NORRIS",
          first_name: "Lando",
          last_name: "Norris",
          full_name: "Lando NORRIS",
          name_acronym: "NOR",
          headshot_url: "https://example.com/nor.png",
        },
      ]),
      getLaps: vi.fn(async () => [
        {
          meeting_key: 925001,
          session_key: 935001,
          driver_number: 4,
          lap_number: 1,
          date_start: "2025-07-13T12:01:00+00:00",
          duration_sector_1: 20.1,
          duration_sector_2: 33.2,
          duration_sector_3: 29.3,
          i1_speed: 280,
          i2_speed: 295,
          is_pit_out_lap: false,
          lap_duration: 82.6,
          segments_sector_1: [2048],
          segments_sector_2: [2049],
          segments_sector_3: [2050],
          st_speed: 314,
        },
      ]),
    };

    const repositories = {
      meetings: {
        insertMany: vi.fn(async () => {
          order.push("meetings");
          return 1;
        }),
      },
      sessions: {
        insertMany: vi.fn(async () => {
          order.push("sessions");
          return 1;
        }),
      },
      drivers: {
        insertMany: vi.fn(async () => {
          order.push("drivers");
          return 1;
        }),
      },
      laps: {
        insertMany: vi.fn(async () => {
          order.push("laps");
          return 1;
        }),
      },
    };

    const counts = await ingestHistoricalYear({ year: 2025, openF1, repositories });

    expect(order).toEqual(["meetings", "sessions", "drivers", "laps"]);
    expect(counts).toEqual({ meetings: 1, sessions: 1, drivers: 1, laps: 1 });
    expect(openF1.getMeetings).toHaveBeenCalledWith({ year: 2025 });
    expect(openF1.getSessions).toHaveBeenCalledWith({ year: 2025 });
    expect(openF1.getDrivers).toHaveBeenCalledWith({ session_key: 935001 });
    expect(openF1.getLaps).toHaveBeenCalledWith({ session_key: 935001 });
  });

  it("deduplicates drivers and laps before repository writes", async () => {
    const { ingestHistoricalYear } = await loadServiceModule();

    const openF1 = {
      getMeetings: vi.fn(async () => [{ meeting_key: 925001, meeting_name: "Test GP" }]),
      getSessions: vi.fn(async () => [{ session_key: 935001, session_name: "Race", meeting_key: 925001 }]),
      getDrivers: vi.fn(async () => [
        {
          meeting_key: 925001,
          session_key: 935001,
          driver_number: 4,
          broadcast_name: "L NORRIS",
          first_name: "Lando",
          last_name: "Norris",
          full_name: "Lando NORRIS",
          name_acronym: "NOR",
          headshot_url: "https://example.com/nor.png",
        },
        {
          meeting_key: 925001,
          session_key: 935001,
          driver_number: 4,
          broadcast_name: "L NORRIS",
          first_name: "Lando",
          last_name: "Norris",
          full_name: "Lando NORRIS",
          name_acronym: "NOR",
          headshot_url: "https://example.com/nor.png",
        },
      ]),
      getLaps: vi.fn(async () => [
        {
          meeting_key: 925001,
          session_key: 935001,
          driver_number: 4,
          lap_number: 1,
          date_start: "2025-07-13T12:01:00+00:00",
          duration_sector_1: 20.1,
          duration_sector_2: 33.2,
          duration_sector_3: 29.3,
          i1_speed: 280,
          i2_speed: 295,
          is_pit_out_lap: false,
          lap_duration: 82.6,
          segments_sector_1: [2048],
          segments_sector_2: [2049],
          segments_sector_3: [2050],
          st_speed: 314,
        },
        {
          meeting_key: 925001,
          session_key: 935001,
          driver_number: 4,
          lap_number: 1,
          date_start: "2025-07-13T12:01:00+00:00",
          duration_sector_1: 20.1,
          duration_sector_2: 33.2,
          duration_sector_3: 29.3,
          i1_speed: 280,
          i2_speed: 295,
          is_pit_out_lap: false,
          lap_duration: 82.6,
          segments_sector_1: [2048],
          segments_sector_2: [2049],
          segments_sector_3: [2050],
          st_speed: 314,
        },
      ]),
    };

    const repositories = {
      meetings: { insertMany: vi.fn(async () => 1) },
      sessions: { insertMany: vi.fn(async () => 1) },
      drivers: { insertMany: vi.fn(async () => 1) },
      laps: { insertMany: vi.fn(async () => 1) },
    };

    await ingestHistoricalYear({ year: 2025, openF1, repositories });

    expect(repositories.drivers.insertMany).toHaveBeenCalledTimes(1);
    expect(repositories.drivers.insertMany).toHaveBeenCalledWith(expect.any(Array));
    expect((repositories.drivers.insertMany as any).mock.calls[0][0]).toHaveLength(1);

    expect(repositories.laps.insertMany).toHaveBeenCalledTimes(1);
    expect(repositories.laps.insertMany).toHaveBeenCalledWith(expect.any(Array));
    expect((repositories.laps.insertMany as any).mock.calls[0][0]).toHaveLength(1);
  });

  it("annotates thrown errors with failing entity step", async () => {
    const { ingestHistoricalYear } = await loadServiceModule();

    const openF1 = {
      getMeetings: vi.fn(async () => [{ meeting_key: 925001, meeting_name: "Test GP" }]),
      getSessions: vi.fn(async () => [{ session_key: 935001, session_name: "Race", meeting_key: 925001 }]),
      getDrivers: vi.fn(async () => {
        throw new Error("openf1 unavailable");
      }),
      getLaps: vi.fn(async () => []),
    };

    const repositories = {
      meetings: { insertMany: vi.fn(async () => 1) },
      sessions: { insertMany: vi.fn(async () => 1) },
      drivers: { insertMany: vi.fn(async () => 0) },
      laps: { insertMany: vi.fn(async () => 0) },
    };

    await expect(ingestHistoricalYear({ year: 2025, openF1, repositories })).rejects.toThrow(/drivers/i);
  });
});
