import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import express from "express";
import fs from "node:fs";
import path from "node:path";

const app = express();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const port = Number(process.env.PORT ?? 3000);

app.get("/api/mock/sessions", async (_req, res) => {
  const sessions = await prisma.session.findMany({
    orderBy: { sessionKey: "desc" },
    select: { sessionKey: true, label: true },
  });
  res.json(sessions);
});

app.get("/api/mock/session/:sessionKey/overview", async (req, res) => {
  const sessionKey = Number(req.params.sessionKey);
  if (!Number.isFinite(sessionKey)) {
    res.status(400).json({ message: "Invalid session key." });
    return;
  }

  const session = await prisma.session.findUnique({
    where: { sessionKey },
    include: {
      overview: {
        include: {
          lapSeries: { orderBy: { lap: "asc" } },
          pitStops: { orderBy: { lap: "asc" } },
          stints: { orderBy: { lapFrom: "asc" } },
        },
      },
    },
  });

  if (!session?.overview) {
    res.status(404).json({ message: "Session not found." });
    return;
  }

  res.json({
    summary: {
      winner: session.overview.winner,
      totalLaps: session.overview.totalLaps,
      overtakes: session.overview.overtakes,
      avgPitStop: session.overview.avgPitStop,
    },
    lapSeries: session.overview.lapSeries.map((row: { lap: number; norris: number; leclerc: number }) => ({
      lap: row.lap,
      norris: row.norris,
      leclerc: row.leclerc,
    })),
    pitStops: session.overview.pitStops,
    stints: session.overview.stints.map((row: { driver: string; lapFrom: number; lapTo: number; tyre: string }) => ({
      driver: row.driver,
      from: row.lapFrom,
      to: row.lapTo,
      tyre: row.tyre,
    })),
  });
});

app.get("/api/mock/compare", async (_req, res) => {
  const snapshot = await prisma.compareSnapshot.findUnique({ where: { id: 1 } });
  if (!snapshot) {
    res.status(404).json({ message: "Compare snapshot not found." });
    return;
  }

  res.json({
    drivers: snapshot.drivers,
    metrics: snapshot.metrics,
    deltaSeries: snapshot.deltaSeries,
    telemetry: snapshot.telemetry,
  });
});

app.get("/api/mock/live", async (_req, res) => {
  const snapshot = await prisma.liveSnapshot.findUnique({ where: { id: 1 } });
  if (!snapshot) {
    res.status(404).json({ message: "Live snapshot not found." });
    return;
  }

  res.json({
    lap: snapshot.lap,
    positions: snapshot.positions,
    events: snapshot.events,
  });
});

const distPath = path.resolve("dist");
const indexPath = path.join(distPath, "index.html");
if (fs.existsSync(indexPath)) {
  app.use(express.static(distPath));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(indexPath);
  });
}

app.listen(port, () => {
  console.log(`F1 API server running at http://localhost:${port}`);
});
