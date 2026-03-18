import type { PrismaClient } from "@prisma/client";
import type { DriverInsertRow, DriverRepositoryLike } from "../services/ingestion/types";

export function createDriverRepository(_prisma: PrismaClient): DriverRepositoryLike {
  return {
    insertMany: async (_rows: DriverInsertRow[]) => {
      throw new Error("Not implemented: createDriverRepository.insertMany");
    },
  };
}
