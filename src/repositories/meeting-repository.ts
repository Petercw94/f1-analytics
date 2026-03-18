import type { PrismaClient } from "@prisma/client";
import type { MeetingInsertRow, MeetingRepositoryLike } from "../services/ingestion/types";

export function createMeetingRepository(_prisma: PrismaClient): MeetingRepositoryLike {
  return {
    insertMany: async (_rows: MeetingInsertRow[]) => {
      throw new Error("Not implemented: createMeetingRepository.insertMany");
    },
  };
}
