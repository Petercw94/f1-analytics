import type { PrismaClient } from "@prisma/client";
import type { LapInsertRow, LapRepositoryLike } from "../services/ingestion/types";

export function createLapRepository(_prisma: PrismaClient): LapRepositoryLike {
  return {
    insertMany: async (_rows: LapInsertRow[]) => {
      throw new Error("Not implemented: createLapRepository.insertMany");
    },
  };
}
