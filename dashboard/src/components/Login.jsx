import { useState } from "react";
import { api, setToken } from "../api.js";

export default function Login({ onLoggedIn }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await api.login(u, p);
      setToken(r.access_token);
      await onLoggedIn();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="brand">SAATHI-EVAC</div>
        <h1>Rescue dashboard</h1>
        <p className="muted">Proposed design, prototype stage. Demo data only.</p>
        <label>Username</label>
        <input value={u} onChange={(e) => setU(e.target.value)} autoFocus />
        <label>Password</label>
        <input type="password" value={p} onChange={(e) => setP(e.target.value)} />
        {err && <div className="error">{err}</div>}
        <button className="btn primary" disabled={busy || !u || !p}>{busy ? "Signing in..." : "Sign in"}</button>
        <div className="demo-fill">
          <span className="muted">Demo logins:</span>
          <button type="button" className="link" onClick={() => { setU("coord"); setP("Coord@12345"); }}>Coordinator</button>
          <button type="button" className="link" onClick={() => { setU("rescue"); setP("Rescue@12345"); }}>Rescue team</button>
        </div>
      </form>
    </div>
  );
}
