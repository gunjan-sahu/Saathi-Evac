import { useCallback, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api.js";
import Login from "./components/Login.jsx";
import Queue from "./components/Queue.jsx";
import MapView from "./components/MapView.jsx";
import FieldApp from "./components/FieldApp.jsx";
import { Helpers, Reassignments, Audit, Rules } from "./components/Panels.jsx";

const EMPTY = { queue: [], helpers: [], shelters: [], reassignments: [], events: [], audit: null };

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(!!getToken());
  const [data, setData] = useState(EMPTY);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [ward, setWard] = useState("ward-7");
  const [helperId, setHelperId] = useState("");
  const [minutes, setMinutes] = useState(0);
  const [field, setField] = useState(false);

  const logout = useCallback(() => { setToken(null); setUser(null); setData(EMPTY); setMsg(""); setField(false); }, []);
  const startSession = useCallback(async () => {
    try { setUser(await api.me()); } catch { logout(); } finally { setChecking(false); }
  }, [logout]);
  useEffect(() => { if (getToken()) startSession(); }, [startSession]);

  const load = useCallback(async () => {
    if (!user || user.role === "volunteer") return;
    try {
      const calls = [api.queue(), api.helpers(), api.shelters(), api.reassignments(), api.events()];
      if (user.role === "coordinator") calls.push(api.audit());
      const [queue, helpers, shelters, reassignments, events, audit] = await Promise.all(calls);
      setData({ queue, helpers, shelters, reassignments, events, audit: audit || null });
      setError("");
    } catch (e) {
      if (e.message === "SESSION") logout(); else setError(e.message);
    }
  }, [user, logout]);
  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  async function act(fn, ok) {
    try { const r = await fn(); setMsg(ok(r)); await load(); }
    catch (e) { if (e.message === "SESSION") logout(); else setMsg("Error: " + e.message); }
  }

  if (checking) return <div className="center muted">Loading...</div>;
  if (!user) return <Login onLoggedIn={startSession} />;

  const active = data.events.filter((e) => e.status === "active");
  const wardEvent = active.find((e) => e.ward === ward);
  const isCoord = user.role === "coordinator";
  const showField = user.role === "volunteer" || field;

  return (
    <div className="app">
      <header className="top">
        <div>
          <div className="brand">SAATHI-EVAC</div>
          <div className="muted small">{showField ? "Field app" : "Rescue dashboard"} · proposed design, prototype stage</div>
        </div>
        {user.role !== "volunteer" && (
          <div className={"badge " + (active.length ? "live" : "idle")}>
            {active.length ? `EVENT ACTIVE: ${active.map((e) => e.ward).join(", ")}` : "No active event: health details hidden"}
          </div>
        )}
        <div className="who">
          <span>{user.full_name || user.username} · {user.role}</span>
          {isCoord && <button className="btn" onClick={() => setField(!field)}>{field ? "Dashboard" : "Field app"}</button>}
          <button className="btn" onClick={logout}>Log out</button>
        </div>
      </header>

      {showField ? (
        <FieldApp user={user} refreshUser={startSession} />
      ) : (
        <>
          {error && <div className="error">{error}</div>}
          {isCoord && (
            <section className="card controls">
              <div className="ctl">
                <label>Ward</label>
                <input value={ward} onChange={(e) => setWard(e.target.value)} />
                <button className="btn danger" onClick={() => act(() => api.alert(ward), (r) => `Alert sent. ${r.people_warned} people warned.`)}>Trigger alert</button>
                <button className="btn" disabled={!wardEvent} onClick={() => act(() => api.endEvent(wardEvent.id), () => "Event ended. Health details are hidden again.")}>End event</button>
              </div>
              <div className="ctl">
                <label>Helper</label>
                <select value={helperId} onChange={(e) => setHelperId(e.target.value)}>
                  <option value="">Choose helper</option>
                  {data.helpers.map((h) => <option key={h.id} value={h.id}>{h.name} ({h.status})</option>)}
                </select>
                <button className="btn primary" disabled={!helperId} onClick={() => act(() => api.missed(helperId), (r) => `Missed check-in: ${r.length} people re-assigned.`)}>Simulate missed check-in</button>
                <button className="btn" disabled={!helperId} onClick={() => act(() => api.heartbeat(helperId), () => "Helper restored to available.")}>Restore helper</button>
              </div>
              <div className="ctl">
                <label>Silent for (min)</label>
                <input className="narrow" type="number" min="0" value={minutes} onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))} />
                <button className="btn" onClick={() => act(() => api.sweep(minutes), (r) => `Sweep done: ${r.helpers_marked_unreachable.length} silent helpers, ${r.reassignments.length} re-assignments.`)}>Sweep silent helpers</button>
              </div>
              {msg && <div className="msg">{msg}</div>}
            </section>
          )}

          <div className="grid">
            <section className="card">
              <h2>Priority queue <span className="muted small">needs-ranked, with reasons</span></h2>
              <Queue people={data.queue} />
            </section>
            <section className="card">
              <h2>Live map</h2>
              <MapView people={data.queue} helpers={data.helpers} shelters={data.shelters} />
            </section>
            <section className="card">
              <h2>Re-assignment log</h2>
              <Reassignments log={data.reassignments} helpers={data.helpers} people={data.queue} />
            </section>
            <section className="card">
              <h2>Helpers</h2>
              <Helpers helpers={data.helpers} />
            </section>
            <section className="card wide">
              <h2>Fairness audit <span className="muted small">outcomes by gender and age, aggregates only</span></h2>
              <Audit audit={data.audit} />
            </section>
            <section className="card wide">
              <h2>Published scoring rules <span className="muted small">gender is never an input</span></h2>
              <Rules />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
