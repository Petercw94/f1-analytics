import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { CompareRoute } from "./routes/CompareRoute";
import { HomeRoute } from "./routes/HomeRoute";
import { LiveRoute } from "./routes/LiveRoute";
import { SessionRoute } from "./routes/SessionRoute";

export function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="kicker">Portfolio MVP Mock</p>
          <h1>F1 Data Lab</h1>
        </div>
        <nav className="tabs">
          <NavLink to="/" className={({ isActive }) => (isActive ? "tab active" : "tab")}>Overview</NavLink>
          <NavLink to="/compare" className={({ isActive }) => (isActive ? "tab active" : "tab")}>Compare</NavLink>
          <NavLink to="/live" className={({ isActive }) => (isActive ? "tab active" : "tab")}>Live</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/sessions/:sessionId" element={<SessionRoute />} />
        <Route path="/compare" element={<CompareRoute />} />
        <Route path="/live" element={<LiveRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}
