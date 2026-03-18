import type { PrismaClient } from "@prisma/client";
import type { SessionInsertRow, SessionRepositoryLike } from "../services/ingestion/types";

export function createSessionRepository(_prisma: PrismaClient): SessionRepositoryLike {
  return {
    insertMany: async (_rows: SessionInsertRow[]) => {
      throw new Error("Not implemented: createSessionRepository.insertMany");
    },
  };
}
