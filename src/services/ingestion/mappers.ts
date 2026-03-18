import type {
  DriverInsertRow,
  LapInsertRow,
  MeetingInsertRow,
  OpenF1Driver,
  OpenF1Lap,
  OpenF1Meeting,
  OpenF1Session,
  SessionInsertRow,
} from "./types";

export function mapMeetingFromOpenF1(_input: OpenF1Meeting): MeetingInsertRow {
  throw new Error("Not implemented: mapMeetingFromOpenF1");
}

export function mapSessionFromOpenF1(_input: OpenF1Session): SessionInsertRow {
  throw new Error("Not implemented: mapSessionFromOpenF1");
}

export function mapDriverFromOpenF1(_input: OpenF1Driver): DriverInsertRow {
  throw new Error("Not implemented: mapDriverFromOpenF1");
}

export function mapLapFromOpenF1(_input: OpenF1Lap): LapInsertRow {
  throw new Error("Not implemented: mapLapFromOpenF1");
}
