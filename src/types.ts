export type SessionItem = {
  sessionKey: number;
  label: string;
};

export type OverviewPayload = {
  summary: {
    winner: string;
    totalLaps: number;
    overtakes: number;
    avgPitStop: number;
  };
  lapSeries: Array<{ lap: number; norris: number; leclerc: number }>;
  pitStops: Array<{
    driver: string;
    lap: number;
    stop: number;
    compoundOut: string;
  }>;
  stints: Array<{ driver: string; from: number; to: number; tyre: string }>;
};

export type ComparePayload = {
  drivers: string[];
  metrics: {
    avgLapA: number;
    avgLapB: number;
    bestLapA: number;
    bestLapB: number;
    sectorWinsA: number;
    sectorWinsB: number;
    topSpeedA: number;
    topSpeedB: number;
  };
  deltaSeries: Array<{ lap: number; delta: number }>;
  telemetry: {
    speedA: number[];
    speedB: number[];
    throttleA: number[];
    throttleB: number[];
    brakeA: number[];
    brakeB: number[];
  };
};

export type LivePayload = {
  lap: number;
  positions: Array<{ position: number; driver: string; gap: string }>;
  events: string[];
};
