export type OpenF1Meeting = {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  country_flag: string;
  circuit_key: number;
  circuit_short_name: string;
  circuit_type: string;
  circuit_info_url: string;
  circuit_image: string;
  gmt_offset: string;
  date_start: string;
  date_end: string;
  year: number;
};

export type OpenF1Session = {
  session_key: number;
  session_name: string;
  session_type?: string;
  date_start?: string;
  date_end?: string;
  meeting_key: number;
};

export type OpenF1Driver = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  broadcast_name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  name_acronym: string;
  headshot_url: string | null;
};

export type OpenF1Lap = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  lap_number: number;
  date_start: string;
  duration_sector_1: number;
  duration_sector_2: number;
  duration_sector_3: number;
  i1_speed: number;
  i2_speed: number;
  is_pit_out_lap: boolean;
  lap_duration: number;
  segments_sector_1: number[];
  segments_sector_2: number[];
  segments_sector_3: number[];
  st_speed: number;
};

export type MeetingInsertRow = {
  circuitKey: number;
  circuitImage: string;
  circuitInfoURL: string;
  circuitShortName: string;
  circuitType: string;
  countryCode: string;
  countryFlag: string;
  countryKey: number;
  countryName: string;
  dateEnd: Date;
  dateStart: Date;
  gmtOffset: number;
  location: string;
  meetingKey: number;
  meetingName: string;
  meetingOfficialName: string;
  year: number;
};

export type SessionInsertRow = {
  sessionKey: number;
  label: string;
};

export type DriverInsertRow = {
  broadcastName: string;
  driverNumber: number;
  firstName: string;
  fullName: string;
  headshotURL: string;
  lastName: string;
  meetingKey: number;
  nameAcronym: string;
  sessionKey: number;
};

export type LapInsertRow = {
  dateStart: Date;
  driverNumber: number;
  durationSector1: number;
  durationSector2: number;
  durationSector3: number;
  i1Speed: number;
  i2Speed: number;
  isPitOutLap: boolean;
  lapDuration: number;
  lapNumber: number;
  meetingKey: number;
  segmentsSector1: number[];
  segmentsSector2: number[];
  segmentsSector3: number[];
  sessionKey: number;
  stSpeed: number;
};

export type OpenF1ClientLike = {
  getMeetings: (_params: { year: number }) => Promise<OpenF1Meeting[]>;
  getSessions: (_params: { year: number }) => Promise<OpenF1Session[]>;
  getDrivers: (_params: { session_key: number }) => Promise<OpenF1Driver[]>;
  getLaps: (_params: { session_key: number }) => Promise<OpenF1Lap[]>;
};

export type MeetingRepositoryLike = {
  insertMany: (_rows: MeetingInsertRow[]) => Promise<number>;
};

export type SessionRepositoryLike = {
  insertMany: (_rows: SessionInsertRow[]) => Promise<number>;
};

export type DriverRepositoryLike = {
  insertMany: (_rows: DriverInsertRow[]) => Promise<number>;
};

export type LapRepositoryLike = {
  insertMany: (_rows: LapInsertRow[]) => Promise<number>;
};

export type IngestionRepositories = {
  meetings: MeetingRepositoryLike;
  sessions: SessionRepositoryLike;
  drivers: DriverRepositoryLike;
  laps: LapRepositoryLike;
};

export type IngestionCounts = {
  meetings: number;
  sessions: number;
  drivers: number;
  laps: number;
};
