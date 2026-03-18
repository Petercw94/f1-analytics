import type {
  IngestionCounts,
  IngestionRepositories,
  OpenF1ClientLike,
} from "./types";

export type IngestHistoricalYearInput = {
  year: number;
  openF1: OpenF1ClientLike;
  repositories: IngestionRepositories;
};

export async function ingestHistoricalYear(_input: IngestHistoricalYearInput): Promise<IngestionCounts> {
  throw new Error("Not implemented: ingestHistoricalYear");
}
