import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSessions } from "../api";
import type { SessionItem } from "../types";

export function HomeRoute() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions()
      .then((data) => setSessions(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <section className="card">Loading sessions...</section>;
  }

  if (sessions.length === 0) {
    return <section className="card">No mock sessions found.</section>;
  }

  return (
    <section className="card">
      <h2>Choose a Session</h2>
      <p className="muted">Use this route structure as the base Remix/React Router information architecture.</p>
      <div className="session-grid">
        {sessions.map((session) => (
          <Link key={session.sessionKey} className="session-link" to={`/sessions/${session.sessionKey}`}>
            {session.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
