import { useEffect, useState } from "react";
import { api, fmtTime } from "../api.js";

export function Helpers({ helpers }) {
  return (
    <div className="rows">
      {helpers.map((h) => (
        <div key={h.id} className="row">
          <b>{h.name}</b>
          <span className={"chip " + (h.status === "unreachable" ? "red" : "green")}>{h.status}</span>
          {h.skills && <span className="chip gray">{h.skills}</span>}
          {h.women_led && <span className="chip gray">women-led</span>}
        </div>
      ))}
    </div>
  );
}

export function Reassignments({ log, helpers, people }) {
  const hName = (id) => (id ? helpers.find((h) => h.id === id)?.name || `Helper ${id}` : "NOBODY");
  const pName = (id) => people.find((p) => p.id === id)?.name || `Person ${id}`;
  if (!log.length) return <p className="muted">No re-assignments yet.</p>;
  return (
    <div className="rows">
      {log.map((l, i) => (
        <div key={i} className="row">
          <span className="muted">{fmtTime(l.time)}</span>
          <b>{pName(l.person_id)}</b>
          <span>{l.from_helper ? hName(l.from_helper) : "new"} → <b className={l.to_helper ? "" : "bad"}>{hName(l.to_helper)}</b></span>
          <span className="muted">{l.reason}</span>
        </div>
      ))}
    </div>
  );
}

export function Audit({ audit }) {
  if (!audit) return <p className="muted">Fairness audit is available to coordinators.</p>;
  const rows = Object.entries(audit).sort(([a], [b]) => a.localeCompare(b));
  if (!rows.length) return <p className="muted">No data yet.</p>;
  const label = (k) => k.replace("gender:", "Gender: ").replace("age:", "Age: ");
  const bar = (v) => <div className="bar"><div style={{ width: `${v}%` }} /><span>{v}%</span></div>;
  return (
    <table className="table">
      <thead><tr><th>Group</th><th>People</th><th>Avg score</th><th>With helper</th><th>With shelter</th></tr></thead>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td>{label(k)}</td><td>{v.count}</td><td>{v.avg_priority_score}</td>
            <td>{bar(v.pct_with_helper)}</td><td>{bar(v.pct_with_shelter)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Rules() {
  const [rules, setRules] = useState(null);
  useEffect(() => { api.rules().then(setRules).catch(() => {}); }, []);
  if (!rules) return <p className="muted">Loading rules...</p>;
  return (
    <div>
      <div className="chips">
        {Object.values(rules.weights).map((w) => <span key={w.label} className="chip gray">{w.label} +{w.points}</span>)}
        <span className="chip gray">Age {rules.age_rule.min_age}+ +{rules.age_rule.points}</span>
      </div>
      <p className="muted small">Never used as input: {rules.never_used_as_input.join(", ")}. {rules.note}</p>
    </div>
  );
}
