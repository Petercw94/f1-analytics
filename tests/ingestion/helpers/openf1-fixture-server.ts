import fs from "node:fs";
import path from "node:path";
import { createServer } from "node:http";

type OpenF1Fixtures = {
  meetings: any[];
  sessions: any[];
  drivers: any[];
  laps: any[];
};

export type FixtureServer = {
  baseUrl: string;
  close: () => Promise<void>;
};

function readFixtureArray(filePath: string): any[] {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as any[];
}

function loadFixtures(fixturesDir: string): OpenF1Fixtures {
  return {
    meetings: readFixtureArray(path.join(fixturesDir, "meetings.json")),
    sessions: readFixtureArray(path.join(fixturesDir, "sessions.json")),
    drivers: readFixtureArray(path.join(fixturesDir, "drivers.json")),
    laps: readFixtureArray(path.join(fixturesDir, "laps.json")),
  };
}

function matchByQuery(data: any[], query: URLSearchParams): any[] {
  return data.filter((row) => {
    for (const [key, value] of query.entries()) {
      if (key === "lap_number<=") {
        const lap = Number(row.lap_number);
        if (!Number.isFinite(lap) || lap > Number(value)) {
          return false;
        }
        continue;
      }

      if (`${row[key]}` !== value) {
        return false;
      }
    }

    return true;
  });
}

export async function startOpenF1FixtureServer(fixturesDir: string): Promise<FixtureServer> {
  const fixtures = loadFixtures(fixturesDir);

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname;

    const payloadByPath: Record<string, any[]> = {
      "/v1/meetings": fixtures.meetings,
      "/v1/sessions": fixtures.sessions,
      "/v1/drivers": fixtures.drivers,
      "/v1/laps": fixtures.laps,
    };

    const payload = payloadByPath[pathname];
    if (!payload) {
      res.statusCode = 404;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ message: `No fixture route for ${pathname}` }));
      return;
    }

    const filtered = matchByQuery(payload, url.searchParams);
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(filtered));
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to start fixture server");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    }),
  };
}
