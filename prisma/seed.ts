import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sessions = [
  {
    sessionKey: 9839,
    label: "Abu Dhabi 2025 - Race",
    summary: { winner: "Lando Norris", totalLaps: 58, overtakes: 44, avgPitStop: 2.41 },
    lapSeries: [
      { lap: 1, norris: 95.2, leclerc: 95.5 },
      { lap: 8, norris: 92.4, leclerc: 92.8 },
      { lap: 16, norris: 91.8, leclerc: 92.1 },
      { lap: 24, norris: 92.7, leclerc: 92.3 },
      { lap: 34, norris: 92.5, leclerc: 92.9 },
      { lap: 42, norris: 93.1, leclerc: 93.4 },
      { lap: 50, norris: 92.9, leclerc: 93.2 },
      { lap: 58, norris: 93.6, leclerc: 94.1 },
    ],
    pitStops: [
      { driver: "NOR", lap: 18, stop: 2.22, compoundOut: "HARD" },
      { driver: "LEC", lap: 19, stop: 2.45, compoundOut: "HARD" },
      { driver: "PIA", lap: 20, stop: 2.38, compoundOut: "HARD" },
      { driver: "VER", lap: 21, stop: 2.56, compoundOut: "MED" },
    ],
    stints: [
      { driver: "NOR", lapFrom: 1, lapTo: 18, tyre: "MED" },
      { driver: "NOR", lapFrom: 19, lapTo: 58, tyre: "HARD" },
      { driver: "LEC", lapFrom: 1, lapTo: 19, tyre: "MED" },
      { driver: "LEC", lapFrom: 20, lapTo: 58, tyre: "HARD" },
    ],
  },
  {
    sessionKey: 9771,
    label: "Monza 2025 - Race",
    summary: { winner: "Charles Leclerc", totalLaps: 53, overtakes: 31, avgPitStop: 2.34 },
    lapSeries: [
      { lap: 1, norris: 84.9, leclerc: 84.5 },
      { lap: 10, norris: 81.8, leclerc: 81.6 },
      { lap: 20, norris: 81.2, leclerc: 81.0 },
      { lap: 30, norris: 81.7, leclerc: 81.2 },
      { lap: 40, norris: 82.1, leclerc: 81.8 },
      { lap: 53, norris: 82.9, leclerc: 82.6 },
    ],
    pitStops: [
      { driver: "LEC", lap: 17, stop: 2.17, compoundOut: "HARD" },
      { driver: "NOR", lap: 18, stop: 2.29, compoundOut: "HARD" },
      { driver: "HAM", lap: 19, stop: 2.31, compoundOut: "HARD" },
    ],
    stints: [
      { driver: "LEC", lapFrom: 1, lapTo: 17, tyre: "MED" },
      { driver: "LEC", lapFrom: 18, lapTo: 53, tyre: "HARD" },
      { driver: "NOR", lapFrom: 1, lapTo: 18, tyre: "MED" },
      { driver: "NOR", lapFrom: 19, lapTo: 53, tyre: "HARD" },
    ],
  },
  {
    sessionKey: 9710,
    label: "Silverstone 2025 - Race",
    summary: { winner: "Max Verstappen", totalLaps: 52, overtakes: 39, avgPitStop: 2.48 },
    lapSeries: [
      { lap: 1, norris: 92.1, leclerc: 92.8 },
      { lap: 10, norris: 89.7, leclerc: 90.3 },
      { lap: 20, norris: 89.4, leclerc: 89.9 },
      { lap: 30, norris: 90.1, leclerc: 90.4 },
      { lap: 40, norris: 90.8, leclerc: 90.9 },
      { lap: 52, norris: 91.3, leclerc: 91.7 },
    ],
    pitStops: [
      { driver: "VER", lap: 14, stop: 2.39, compoundOut: "HARD" },
      { driver: "NOR", lap: 15, stop: 2.42, compoundOut: "HARD" },
      { driver: "RUS", lap: 16, stop: 2.61, compoundOut: "HARD" },
    ],
    stints: [
      { driver: "VER", lapFrom: 1, lapTo: 14, tyre: "MED" },
      { driver: "VER", lapFrom: 15, lapTo: 52, tyre: "HARD" },
      { driver: "NOR", lapFrom: 1, lapTo: 15, tyre: "MED" },
      { driver: "NOR", lapFrom: 16, lapTo: 52, tyre: "HARD" },
    ],
  },
];

const comparePayload = {
  id: 1,
  drivers: ["NOR", "LEC", "VER", "HAM"],
  metrics: {
    avgLapA: 92.34,
    avgLapB: 92.72,
    bestLapA: 91.63,
    bestLapB: 91.88,
    sectorWinsA: 31,
    sectorWinsB: 27,
    topSpeedA: 333,
    topSpeedB: 336,
  },
  deltaSeries: [
    { lap: 5, delta: -0.18 },
    { lap: 10, delta: -0.31 },
    { lap: 15, delta: -0.47 },
    { lap: 20, delta: -0.22 },
    { lap: 25, delta: -0.09 },
    { lap: 30, delta: -0.28 },
    { lap: 35, delta: -0.41 },
    { lap: 40, delta: -0.17 },
    { lap: 45, delta: 0.02 },
    { lap: 50, delta: -0.14 },
  ],
  telemetry: {
    speedA: [285, 300, 316, 330, 322, 305, 292, 298],
    speedB: [281, 297, 312, 334, 324, 307, 291, 294],
    throttleA: [82, 91, 98, 100, 76, 62, 88, 96],
    throttleB: [78, 89, 96, 100, 74, 58, 84, 93],
    brakeA: [8, 0, 0, 0, 32, 46, 11, 2],
    brakeB: [10, 0, 0, 0, 35, 49, 13, 4],
  },
};

const livePayload = {
  id: 1,
  lap: 27,
  positions: [
    { position: 1, driver: "NOR", gap: "LEADER" },
    { position: 2, driver: "VER", gap: "+1.942" },
    { position: 3, driver: "LEC", gap: "+4.219" },
    { position: 4, driver: "PIA", gap: "+5.782" },
    { position: 5, driver: "RUS", gap: "+8.141" },
  ],
  events: [
    "Race control: YELLOW FLAG - Sector 2",
    "Pit: LEC completed stop in 2.31s",
    "Overtake: PIA passed RUS for P4",
    "Race control: GREEN FLAG - Track clear",
    "Fastest lap: VER 1:33.104",
  ],
};

async function main() {
  await prisma.lapPoint.deleteMany();
  await prisma.pitStop.deleteMany();
  await prisma.stint.deleteMany();
  await prisma.sessionOverview.deleteMany();
  await prisma.session.deleteMany();

  for (const sessionData of sessions) {
    const session = await prisma.session.create({
      data: {
        sessionKey: sessionData.sessionKey,
        label: sessionData.label,
      },
    });

    await prisma.sessionOverview.create({
      data: {
        sessionId: session.id,
        winner: sessionData.summary.winner,
        totalLaps: sessionData.summary.totalLaps,
        overtakes: sessionData.summary.overtakes,
        avgPitStop: sessionData.summary.avgPitStop,
        lapSeries: { create: sessionData.lapSeries },
        pitStops: { create: sessionData.pitStops },
        stints: { create: sessionData.stints },
      },
    });
  }

  await prisma.compareSnapshot.upsert({
    where: { id: comparePayload.id },
    create: comparePayload,
    update: comparePayload,
  });

  await prisma.liveSnapshot.upsert({
    where: { id: livePayload.id },
    create: livePayload,
    update: livePayload,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Mock data seeded.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
