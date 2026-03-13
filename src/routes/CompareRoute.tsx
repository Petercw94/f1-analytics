import { useEffect, useMemo, useState } from "react";
import { fetchCompare } from "../api";
import { LineChart } from "../components/LineChart";
import type { ComparePayload } from "../types";

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function CompareRoute() {
  const [payload, setPayload] = useState<ComparePayload | null>(null);
  const [driverA, setDriverA] = useState("NOR");
  const [driverB, setDriverB] = useState("LEC");

  useEffect(() => {
    fetchCompare().then((data) => {
      setPayload(data);
      setDriverA(data.drivers[0] ?? "NOR");
      setDriverB(data.drivers[1] ?? "LEC");
    });
  }, []);

  const telemetry = useMemo(() => {
    if (!payload) return [];
    return [
      ["Speed", average(payload.telemetry.speedA), 340],
      ["Throttle", average(payload.telemetry.throttleA), 100],
      ["Brake", average(payload.telemetry.brakeA), 100],
    ] as const;
  }, [payload]);

  if (!payload) {
    return <section className="card">Loading comparison...</section>;
  }

  return (
    <section>
      <div className="panel-head">
        <h2>Driver vs Driver</h2>
        <div className="inline-controls">
          <select value={driverA} onChange={(event) => setDriverA(event.target.value)}>
            {payload.drivers.map((driver) => (
              <option key={driver}>{driver}</option>
            ))}
          </select>
          <select value={driverB} onChange={(event) => setDriverB(event.target.value)}>
            {payload.drivers.map((driver) => (
              <option key={driver}>{driver}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="cards">
        <article className="metric"><p>Avg Lap A</p><h4>{payload.metrics.avgLapA}</h4></article>
        <article className="metric"><p>Avg Lap B</p><h4>{payload.metrics.avgLapB}</h4></article>
        <article className="metric"><p>Sector Wins A</p><h4>{payload.metrics.sectorWinsA}</h4></article>
        <article className="metric"><p>Top Speed B</p><h4>{payload.metrics.topSpeedB} km/h</h4></article>
      </div>

      <article className="card">
        <p className="muted">Comparing {driverA} vs {driverB}</p>
        <h3>Lap Delta (A-B)</h3>
        <LineChart
          data={payload.deltaSeries.map((row) => ({ ...row, zero: 0 }))}
          xKey="lap"
          aKey="delta"
          bKey="zero"
          aColor="#00d2be"
          bColor="#2a3444"
        />
      </article>

      <article className="card telemetry">
        <h3>Telemetry Snapshot</h3>
        {telemetry.map(([label, value, max]) => (
          <div className="row" key={label}>
            <small>
              {label} A: {value.toFixed(1)}
            </small>
            <div className="bar">
              <span style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </article>
    </section>
  );
}
