import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  // Prisma CLI requires datasource url for `prisma db push`.
  // @ts-expect-error Prisma 7 runtime accepts datasource config.
  datasource: {
    url: process.env.DATABASE_URL,
  },
  adapter: async () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }

    return new PrismaPg({ connectionString });
  },
});
