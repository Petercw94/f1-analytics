import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSessionOverview, fetchSessions } from "../api";
import { LineChart } from "../components/LineChart";
import type { OverviewPayload, SessionItem } from "../types";

export function SessionRoute() {
  const params = useParams();
  const sessionKey = Number(params.sessionId);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [overview, setOverview] = useState<OverviewPayload | null>(null);

  useEffect(() => {
    fetchSessions().then(setSessions);
  }, []);

  useEffect(() => {
    if (!Number.isFinite(sessionKey)) return;
    fetchSessionOverview(sessionKey).then(setOverview);
  }, [sessionKey]);

  const selectedLabel = useMemo(
    () => sessions.find((session) => session.sessionKey === sessionKey)?.label,
    [sessionKey, sessions],
  );

  if (!overview) {
    return <section className="card">Loading session...</section>;
  }

  const stintMap = overview.stints.reduce<Record<string, typeof overview.stints>>((acc, stint) => {
    if (!acc[stint.driver]) acc[stint.driver] = [];
    acc[stint.driver].push(stint);
    return acc;
  }, {});

  return (
    <section>
      <div className="panel-head">
        <h2>{selectedLabel ?? `Session ${sessionKey}`}</h2>
        <Link className="tab" to="/">
          Back to sessions
        </Link>
      </div>

      <div className="cards">
        <article className="metric"><p>Winner</p><h4>{overview.summary.winner}</h4></article>
        <article className="metric"><p>Total Laps</p><h4>{overview.summary.totalLaps}</h4></article>
        <article className="metric"><p>Overtakes</p><h4>{overview.summary.overtakes}</h4></article>
        <article className="metric"><p>Avg Pit</p><h4>{overview.summary.avgPitStop.toFixed(2)}s</h4></article>
      </div>

      <div className="grid two">
        <article className="card">
          <h3>Lap Trend (NOR vs LEC)</h3>
          <LineChart
            data={overview.lapSeries}
            xKey="lap"
            aKey="norris"
            bKey="leclerc"
            aColor="#ff9700"
            bColor="#ff2f2f"
          />
        </article>
        <article className="card">
          <h3>Stints</h3>
          <div className="stints">
            {Object.entries(stintMap).map(([driver, entries]) => {
              const total = entries.reduce((sum, row) => sum + (row.to - row.from + 1), 0);
              return (
                <div className="stint-row" key={driver}>
                  <strong>{driver}</strong>
                  <div className="stint-track">
                    {entries.map((row) => {
                      const width = ((row.to - row.from + 1) / total) * 100;
                      const style = {
                        width: `${width}%`,
                        background: row.tyre === "MED" ? "#ffd54a" : "#f5f5f5",
                      };
                      return (
                        <span className="stint-chip" style={style} key={`${driver}-${row.from}`}>
                          {row.tyre} {row.from}-{row.to}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <article className="card">
        <h3>Pit Stop Battle</h3>
        <table>
          <thead>
            <tr>
              <th>Driver</th>
              <th>Lap</th>
              <th>Stop (s)</th>
              <th>Tyre Out</th>
            </tr>
          </thead>
          <tbody>
            {overview.pitStops.map((row) => (
              <tr key={`${row.driver}-${row.lap}`}>
                <td>{row.driver}</td>
                <td>{row.lap}</td>
                <td>{row.stop.toFixed(2)}</td>
                <td>{row.compoundOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
