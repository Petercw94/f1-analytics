import { describe, expect, it } from "vitest";

async function loadMappersModule() {
  const modulePath = "../../../src/services/ingestion/mappers";
  try {
    return await import(modulePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Expected module src/services/ingestion/mappers.ts. ${message}`);
  }
}

describe("OpenF1 ingestion mappers contract", () => {
  it("maps meeting payload into database row with signed gmtOffset", async () => {
    const { mapMeetingFromOpenF1 } = await loadMappersModule();

    const mapped = mapMeetingFromOpenF1({
      meeting_key: 925001,
      meeting_name: "Test Grand Prix",
      meeting_official_name: "FORMULA 1 TEST GRAND PRIX 2025",
      location: "Test City",
      country_key: 999,
      country_code: "TST",
      country_name: "Testland",
      country_flag: "https://example.com/flag.png",
      circuit_key: 555,
      circuit_short_name: "Test Circuit",
      circuit_type: "Permanent",
      circuit_info_url: "https://example.com/circuit-info",
      circuit_image: "https://example.com/circuit.png",
      gmt_offset: "-04:00:00",
      date_start: "2025-07-11T10:00:00+00:00",
      date_end: "2025-07-13T14:00:00+00:00",
      year: 2025,
    });

    expect(mapped).toMatchObject({
      meetingKey: 925001,
      meetingName: "Test Grand Prix",
      meetingOfficialName: "FORMULA 1 TEST GRAND PRIX 2025",
      circuitShortName: "Test Circuit",
      gmtOffset: -14400,
      year: 2025,
    });
    expect(mapped.dateStart).toBeInstanceOf(Date);
    expect(mapped.dateEnd).toBeInstanceOf(Date);
  });

  it("maps session payload into database row", async () => {
    const { mapSessionFromOpenF1 } = await loadMappersModule();

    const mapped = mapSessionFromOpenF1({
      session_key: 935001,
      session_name: "Race",
      meeting_key: 925001,
    });

    expect(mapped).toEqual({
      sessionKey: 935001,
      label: "Test Grand Prix - Race",
    });
  });

  it("maps driver payload and normalizes nullable headshot_url", async () => {
    const { mapDriverFromOpenF1 } = await loadMappersModule();

    const mapped = mapDriverFromOpenF1({
      meeting_key: 925001,
      session_key: 935001,
      driver_number: 43,
      broadcast_name: "F COLAPINTO",
      first_name: "Franco",
      last_name: "Colapinto",
      full_name: "Franco COLAPINTO",
      name_acronym: "COL",
      headshot_url: null,
    });

    expect(mapped).toEqual({
      meetingKey: 925001,
      sessionKey: 935001,
      driverNumber: 43,
      broadcastName: "F COLAPINTO",
      firstName: "Franco",
      lastName: "Colapinto",
      fullName: "Franco COLAPINTO",
      nameAcronym: "COL",
      headshotURL: "",
    });
  });

  it("maps lap payload including int[] segment arrays", async () => {
    const { mapLapFromOpenF1 } = await loadMappersModule();

    const mapped = mapLapFromOpenF1({
      meeting_key: 925001,
      session_key: 935001,
      driver_number: 4,
      lap_number: 1,
      date_start: "2025-07-13T12:01:00+00:00",
      duration_sector_1: 20.101,
      duration_sector_2: 33.202,
      duration_sector_3: 29.303,
      i1_speed: 280,
      i2_speed: 295,
      is_pit_out_lap: false,
      lap_duration: 82.606,
      segments_sector_1: [2048, 2049, 2049],
      segments_sector_2: [2049, 2051, 2049],
      segments_sector_3: [2049, 2049, 2048],
      st_speed: 314,
    });

    expect(mapped).toMatchObject({
      meetingKey: 925001,
      sessionKey: 935001,
      driverNumber: 4,
      lapNumber: 1,
      durationSector1: 20.101,
      durationSector2: 33.202,
      durationSector3: 29.303,
      segmentsSector1: [2048, 2049, 2049],
      segmentsSector2: [2049, 2051, 2049],
      segmentsSector3: [2049, 2049, 2048],
    });
    expect(mapped.dateStart).toBeInstanceOf(Date);
  });
});
