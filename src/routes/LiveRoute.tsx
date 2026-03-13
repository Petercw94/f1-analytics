import { useEffect, useRef, useState } from "react";
import { fetchLive } from "../api";
import type { LivePayload } from "../types";

export function LiveRoute() {
  const [live, setLive] = useState<LivePayload | null>(null);
  const [running, setRunning] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    fetchLive().then(setLive);
  }, []);

  useEffect(() => {
    if (!running || !live) return;

    timerRef.current = window.setInterval(() => {
      setLive((prev) => {
        if (!prev) return prev;
        const positions = [...prev.positions];
        const second = { ...positions[1] };
        const gap = Number(second.gap.replace("+", "")) + (Math.random() - 0.45) * 0.3;
        second.gap = `+${Math.max(1.1, gap).toFixed(3)}`;
        positions[1] = second;
        const events = [...prev.events];
        const nextEvent = events.pop();
        if (nextEvent) events.unshift(nextEvent);
        return { ...prev, lap: prev.lap + 1, positions, events };
      });
    }, 2500);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [live, running]);

  if (!live) {
    return <section className="card">Loading live dashboard...</section>;
  }

  return (
    <section>
      <div className="panel-head">
        <h2>Live Race Dashboard</h2>
        <div className="inline-controls">
          <button onClick={() => setRunning((value) => !value)}>{running ? "Pause" : "Resume"}</button>
          <span className="badge">Lap {live.lap}</span>
        </div>
      </div>

      <div className="grid two">
        <article className="card">
          <h3>Position Ladder</h3>
          <ol className="positions">
            {live.positions.map((entry) => (
              <li key={entry.position}>
                <strong>
                  P{entry.position} {entry.driver}
                </strong>{" "}
                <span>{entry.gap}</span>
              </li>
            ))}
          </ol>
        </article>
        <article className="card">
          <h3>Race Control and Events</h3>
          <ul className="feed">
            {live.events.slice(0, 5).map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
