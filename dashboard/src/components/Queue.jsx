export default function Queue({ people }) {
  if (!people.length) return <p className="muted">No registered people yet.</p>;
  return (
    <div className="queue">
      {people.map((p, i) => (
        <div key={p.id} className={"person" + (p.needs_help ? " urgent" : "")}>
          <div className="rank">{i + 1}</div>
          <div className="person-body">
            <div className="person-top">
              <b>{p.name}</b>
              <span className="muted">{p.ward}</span>
              {p.needs_help && <span className="chip red">NEEDS HELP</span>}
              {p.safe_confirmed && <span className="chip green">Safe</span>}
              {!p.helpers.length && <span className="chip red">UNCOVERED</span>}
            </div>
            {p.health_visible ? (
              <div className="chips">
                {p.reasons.map((r) => <span key={r} className="chip amber">{r}</span>)}
              </div>
            ) : (
              <div className="locked">Health details hidden. They unlock only while an event is active.</div>
            )}
            <div className="meta">
              <span>Helpers: {p.helpers.length ? p.helpers.join(", ") : "none"}</span>
              <span>Shelter: {p.shelter || "not matched"}</span>
            </div>
          </div>
          {p.health_visible && <div className="score" title="Priority score">{p.priority_score}</div>}
        </div>
      ))}
    </div>
  );
}
