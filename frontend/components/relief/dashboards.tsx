"use client"

import useSWR from "swr"
import type { CSSProperties, ReactNode } from "react"
import type { AuthUser, HelperRecord, PersonRecord } from "@/lib/contracts"
import type { PageId } from "@/components/relief/operations-shell"
import { swrFetcher } from "@/lib/swr-fetcher"
import "./dashboards.css"

type Nav = (page: PageId) => void
type Props = { user: AuthUser; onNavigate: Nav }
type Shelter = { id: string | number; name: string; capacity: number; occupancy: number; lat?: number; lon?: number; accessible?: boolean }
type EventRow = { id: string | number; ward: string; name: string; status: string }
type Reassign = { person_id: string | number; from_helper: number | null; to_helper: number | null; reason: string; time: string }
type Assignment = { assignment_id: string | number; status: string; person: PersonRecord }

function useList<T>(path: string | null) {
  const { data, error, isLoading } = useSWR<T[]>(path, (p: string) => swrFetcher<T[]>(p), { refreshInterval: 8000 })
  return { list: Array.isArray(data) ? data : ([] as T[]), error: error as unknown, loading: isLoading }
}

const critical = (p: PersonRecord) => Boolean(p.needs_help) || (p.priority_score ?? 0) >= 60
const firstName = (u: AuthUser) => u.full_name.split(" ")[0] || u.username
const initials = (u: AuthUser) => u.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"
const errText = (e: unknown) => (e instanceof Error ? e.message : "Could not load data.")
function when(t: string) {
  const d = new Date(/Z$|[+-]\d\d:?\d\d$/.test(t) ? t : `${t}Z`)
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function Kpi({ label, value, hint, tone = "" }: { label: string; value: string | number; hint?: string; tone?: string }) {
  return <div className={`kpi ${tone}`}><span>{label}</span><b>{value}</b>{hint ? <small>{hint}</small> : null}</div>
}
function Panel({ title, hint, action, onAction, children, className = "" }: { title: string; hint?: string; action?: string; onAction?: () => void; children: ReactNode; className?: string }) {
  return (
    <section className={`dpanel ${className}`}>
      <header><div><h3>{title}</h3>{hint ? <p>{hint}</p> : null}</div>{action ? <button type="button" className="dlink" onClick={onAction}>{action} →</button> : null}</header>
      {children}
    </section>
  )
}
const Empty = ({ children }: { children: ReactNode }) => <p className="dempty">{children}</p>
const Meter = ({ value, max, tone = "" }: { value: number; max: number; tone?: string }) => (
  <span className={`meter ${tone}`}><i style={{ width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%` }} /></span>
)
const ErrorLine = ({ error }: { error: unknown }) => (error ? <p className="derror" role="alert">{errText(error)}</p> : null)

/* ---------- Coordinator: Emergency Command Centre ---------- */
export function CommandCentre({ user, onNavigate }: Props) {
  const queue = useList<PersonRecord>("/dispatch/queue")
  const helpers = useList<HelperRecord>("/helpers")
  const shelters = useList<Shelter>("/dispatch/shelters")
  const events = useList<EventRow>("/events")
  const log = useList<Reassign>("/dispatch/reassignments")
  const active = events.list.filter((e) => e.status === "active")
  const crit = queue.list.filter(critical)
  const uncovered = queue.list.filter((p) => p.helpers.length === 0)
  const free = helpers.list.filter((h) => h.status !== "unreachable")
  const hName = (id: number | null) => (id == null ? "nobody" : helpers.list.find((h) => Number(h.id) === Number(id))?.name ?? `Helper ${id}`)
  const pName = (id: string | number) => queue.list.find((p) => Number(p.id) === Number(id))?.name ?? `Person ${id}`

  return (
    <div className="dash cmd screen-stack">
      <header className="cmd-hero">
        <div>
          <p className="deyebrow">Command centre · {firstName(user)}</p>
          <h2>Emergency Command Centre</h2>
          <p>One view of every person, helper and shelter in your wards.</p>
        </div>
        <div className={`cmd-live ${active.length ? "on" : ""}`}><span className="ldot" />{active.length ? `Event active: ${active.map((e) => e.ward).join(", ")}` : "No active event"}</div>
        <div className="cmd-actions">
          <button type="button" className="dbtn danger" onClick={() => onNavigate("events")}>Trigger alert</button>
          <button type="button" className="dbtn" onClick={() => onNavigate("helpers")}>Sweep helpers</button>
          <button type="button" className="dbtn" onClick={() => onNavigate("dispatch")}>Open dispatch</button>
        </div>
      </header>
      <ErrorLine error={queue.error || helpers.error} />
      <div className="kpi-strip">
        <Kpi label="Active events" value={active.length} hint={active.length ? "health details visible" : "health details hidden"} />
        <Kpi label="Critical incidents" value={crit.length} hint="need help now or high score" tone={crit.length ? "alert" : ""} />
        <Kpi label="Uncovered people" value={uncovered.length} hint="no helper assigned" tone={uncovered.length ? "warn" : ""} />
        <Kpi label="Helpers available" value={`${free.length}/${helpers.list.length}`} hint="not marked unreachable" />
      </div>
      <div className="cmd-grid">
        <Panel title="Incident board" hint="Highest need first" action="Open dispatch" onAction={() => onNavigate("dispatch")}>
          {queue.list.length === 0 ? <Empty>No people registered yet.</Empty> : queue.list.slice(0, 6).map((p, i) => (
            <div key={String(p.id)} className={`row-line ${p.needs_help ? "hot" : ""}`}>
              <span className="rank">{i + 1}</span>
              <div><b>{p.name}</b><small>{p.ward} · {p.helpers.length ? p.helpers.join(", ") : "no helper"}</small></div>
              {p.health_visible ? <span className="score">{p.priority_score ?? 0}</span> : <span className="pill muted">hidden</span>}
              {p.needs_help ? <span className="pill red">needs help</span> : null}
            </div>
          ))}
        </Panel>
        <div className="dstack">
          <Panel title="Resource allocation" hint="Shelter occupancy and helper availability" action="Shelters" onAction={() => onNavigate("shelters")}>
            {shelters.list.length === 0 ? <Empty>No shelters yet.</Empty> : shelters.list.map((s) => (
              <div key={String(s.id)} className="res"><span>{s.name}</span><Meter value={s.occupancy} max={s.capacity} tone={s.occupancy >= s.capacity ? "red" : ""} /><small>{s.occupancy}/{s.capacity}</small></div>
            ))}
            <div className="res"><span>Helpers available</span><Meter value={free.length} max={helpers.list.length} /><small>{free.length}/{helpers.list.length}</small></div>
          </Panel>
          <Panel title="Pending assignments" hint="People without a helper" action="Helpers" onAction={() => onNavigate("helpers")}>
            {uncovered.length === 0 ? <Empty>Everyone has a helper.</Empty> : uncovered.slice(0, 5).map((p) => <div key={String(p.id)} className="row-line"><div><b>{p.name}</b><small>{p.ward}</small></div><span className="pill red">uncovered</span></div>)}
          </Panel>
        </div>
      </div>
      <Panel title="Recent re-assignments" hint="Silent helpers replaced automatically" action="Dispatch log" onAction={() => onNavigate("dispatch")}>
        {log.list.length === 0 ? <Empty>No re-assignments yet.</Empty> : log.list.slice(0, 5).map((l, i) => (
          <div key={i} className="row-line"><small>{when(l.time)}</small><div><b>{pName(l.person_id)}</b><small>{hName(l.from_helper)} → {hName(l.to_helper)}</small></div><span className={`pill ${l.to_helper ? "" : "red"}`}>{l.reason}</span></div>
        ))}
      </Panel>
    </div>
  )
}

/* ---------- Volunteer: Community Hub ---------- */
export function CommunityHub({ user, onNavigate }: Props) {
  const hasHelper = user.helper_id !== null
  const tasks = useList<Assignment>(hasHelper ? "/helpers/me/assignments" : null)
  const mine = useList<PersonRecord>("/people")
  const open = tasks.list.filter((a) => a.status !== "reached")
  const done = tasks.list.filter((a) => a.status === "reached")
  const fresh = tasks.list.filter((a) => a.status === "assigned")
  const backup = tasks.list.filter((a) => a.status === "need_backup")
  const label: Record<string, string> = { assigned: "Assigned", on_my_way: "On my way", reached: "Reached", need_backup: "Backup requested" }

  return (
    <div className="dash hub screen-stack">
      <header className="hub-hero">
        <span className="avatar">{initials(user)}</span>
        <div>
          <p className="deyebrow">Community hub</p>
          <h2>Welcome, {firstName(user)}</h2>
          <p>{hasHelper ? "Thank you for being someone a neighbour can count on." : "Create your helper profile to start receiving assignments."}</p>
        </div>
        <div className="cmd-actions">
          <button type="button" className="dbtn solid" onClick={() => onNavigate("register")}>Register someone</button>
          <button type="button" className="dbtn" onClick={() => onNavigate(hasHelper ? "tasks" : "helpers")}>{hasHelper ? "My tasks" : "Become a helper"}</button>
        </div>
      </header>
      <ErrorLine error={tasks.error || mine.error} />
      <div className="hub-grid">
        <Panel title="My profile">
          <dl className="profile">
            <div><dt>Name</dt><dd>{user.full_name}</dd></div>
            <div><dt>Username</dt><dd>{user.username}</dd></div>
            <div><dt>Role</dt><dd>Volunteer</dd></div>
            <div><dt>Helper profile</dt><dd>{hasHelper ? <span className="pill green">active</span> : <span className="pill red">not created</span>}</dd></div>
          </dl>
          {!hasHelper ? <button type="button" className="dbtn solid wide" onClick={() => onNavigate("helpers")}>Create helper profile</button> : null}
        </Panel>
        <Panel title="My assignments" hint={`${open.length} open`} action="Open tasks" onAction={() => onNavigate("tasks")} className="span-2">
          {!hasHelper ? <Empty>Assignments appear here once you have a helper profile.</Empty> : open.length === 0 ? <Empty>Nothing assigned right now. Thank you for being ready.</Empty> : open.map((a) => (
            <div key={String(a.assignment_id)} className="row-line">
              <span className="rank">{String(a.person.name).slice(0, 1)}</span>
              <div><b>{a.person.name}</b><small>{a.person.ward}{a.person.shelter ? ` · shelter: ${String(a.person.shelter)}` : ""}</small></div>
              <span className={`pill ${a.status === "need_backup" ? "red" : a.status === "on_my_way" ? "amber" : ""}`}>{label[a.status] ?? a.status}</span>
            </div>
          ))}
        </Panel>
        <Panel title="Upcoming tasks" hint="Waiting for your check-in">
          {fresh.length === 0 ? <Empty>No new tasks.</Empty> : fresh.map((a) => <div key={String(a.assignment_id)} className="row-line"><div><b>Check on {a.person.name}</b><small>Tap Open tasks and mark “on my way”.</small></div></div>)}
        </Panel>
        <Panel title="Notifications">
          {!hasHelper ? <div className="note-line">Create your helper profile to receive assignments.</div> : null}
          {fresh.map((a) => <div key={`n${String(a.assignment_id)}`} className="note-line">New assignment: {a.person.name}</div>)}
          {backup.map((a) => <div key={`b${String(a.assignment_id)}`} className="note-line warn">Backup requested for {a.person.name}</div>)}
          {hasHelper && fresh.length === 0 && backup.length === 0 ? <Empty>You are all caught up.</Empty> : null}
        </Panel>
        <Panel title="Contribution history">
          <div className="contrib">
            <Kpi label="People registered" value={mine.list.length} />
            <Kpi label="Check-ins completed" value={done.length} />
            <Kpi label="Open now" value={open.length} />
          </div>
          {done.slice(0, 4).map((a) => <div key={String(a.assignment_id)} className="row-line"><div><b>{a.person.name}</b><small>{a.person.ward}</small></div><span className="pill green">reached</span></div>)}
        </Panel>
      </div>
    </div>
  )
}

/* ---------- Rescue: Field Operations ---------- */
const NOTES: Record<string, string> = {
  Bedridden: "Bring a stretcher and a two-person carry team.",
  "Oxygen dependent": "Carry portable oxygen. Do not interrupt the supply.",
  "Needs dialysis": "Arrange transport to a dialysis-capable facility.",
  "Uses mobility aid": "Bring a wheelchair or assist for the walk.",
  "Infant or pregnancy": "Prioritise a medical check and gentle transport.",
  "Hearing limitation": "Use visual signals and face the person when speaking.",
  "Vision limitation": "Give clear spoken guidance and offer an arm.",
  "Lives alone": "No family on site: confirm who to notify.",
}
const noteFor = (reason: string) => NOTES[reason.replace(/\s*\(\+\d+\)$/, "")]

export function FieldOperations({ user, onNavigate }: Props) {
  const queue = useList<PersonRecord>("/dispatch/queue")
  const helpers = useList<HelperRecord>("/helpers")
  const shelters = useList<Shelter>("/dispatch/shelters")
  const events = useList<EventRow>("/events")
  const active = events.list.filter((e) => e.status === "active")
  const safe = queue.list.filter((p) => p.safe_confirmed).length
  const urgent = queue.list.filter((p) => p.needs_help).length
  const pct = queue.list.length ? Math.round((safe / queue.list.length) * 100) : 0
  const free = helpers.list.filter((h) => h.status !== "unreachable")

  return (
    <div className="dash field screen-stack">
      <header className="field-hero">
        <div>
          <p className="deyebrow">Field operations · {firstName(user)}</p>
          <h2>Field Operations</h2>
          <p>{active.length ? `Event active in ${active.map((e) => e.ward).join(", ")}. Details are unlocked.` : "No active event. Health details stay hidden until one starts."}</p>
        </div>
        <div className="stripe" aria-hidden="true" />
        <div className="cmd-actions">
          <button type="button" className="dbtn solid" onClick={() => onNavigate("dispatch")}>Open map and queue</button>
          <button type="button" className="dbtn" onClick={() => onNavigate("shelters")}>Shelters</button>
        </div>
      </header>
      <ErrorLine error={queue.error || helpers.error} />
      <div className="field-grid">
        <Panel title="Active missions" hint={`${queue.list.length} assigned incidents · ${urgent} need help now`} action="Dispatch" onAction={() => onNavigate("dispatch")} className="missions">
          {queue.list.length === 0 ? <Empty>No incidents yet.</Empty> : queue.list.slice(0, 8).map((p, i) => {
            const notes = (p.reasons ?? []).map(noteFor).filter((n): n is string => Boolean(n))
            const hasLoc = typeof p.lat === "number" && typeof p.lon === "number" && p.lat !== 0
            return (
              <article key={String(p.id)} className={`mission ${p.needs_help ? "hot" : critical(p) ? "high" : ""}`}>
                <div className="mission-head">
                  <span className="rank">{i + 1}</span>
                  <div><b>{p.name}</b><small>{p.ward}</small></div>
                  {p.health_visible ? <span className="score">{p.priority_score ?? 0}<i>priority</i></span> : <span className="pill muted">priority hidden</span>}
                </div>
                <div className="mission-meta">
                  <span className={`pill ${p.needs_help ? "red" : p.safe_confirmed ? "green" : "amber"}`}>{p.needs_help ? "needs help now" : p.safe_confirmed ? "confirmed safe" : "awaiting contact"}</span>
                  {hasLoc ? <a className="dlink" href={`https://www.google.com/maps?q=${p.lat},${p.lon}`} target="_blank" rel="noopener noreferrer">{(p.lat as number).toFixed(4)}, {(p.lon as number).toFixed(4)} ↗</a> : <span className="pill muted">location hidden</span>}
                  <span>On scene: {p.helpers.length ? p.helpers.join(", ") : "nobody yet"}</span>
                  <span>Destination: {p.shelter ? String(p.shelter) : "not matched"}</span>
                </div>
                {notes.length ? <ul className="notes">{notes.map((n) => <li key={n}>{n}</li>)}</ul> : <p className="dempty">{p.health_visible ? "No special instructions from listed needs." : "Instructions unlock when an event is active."}</p>}
              </article>
            )
          })}
        </Panel>
        <div className="dstack">
          <Panel title="Rescue progress" hint="Confirmed safe through phone replies">
            <div className="ring" style={{ "--pct": `${pct}%` } as CSSProperties}><b>{pct}%</b><small>{safe} of {queue.list.length} safe</small></div>
          </Panel>
          <Panel title="Team availability" hint={`${free.length} of ${helpers.list.length} helpers reachable`}>
            {helpers.list.length === 0 ? <Empty>No helpers registered.</Empty> : helpers.list.map((h) => (
              <div key={String(h.id)} className="row-line"><div><b>{h.name}</b><small>{h.skills || "general"}</small></div><span className={`pill ${h.status === "unreachable" ? "red" : "green"}`}>{h.status}</span></div>
            ))}
          </Panel>
          <Panel title="Shelter capacity" action="Shelters" onAction={() => onNavigate("shelters")}>
            {shelters.list.length === 0 ? <Empty>No shelters yet.</Empty> : shelters.list.map((s) => (
              <div key={String(s.id)} className="res"><span>{s.name}</span><Meter value={s.occupancy} max={s.capacity} tone={s.occupancy >= s.capacity ? "red" : ""} /><small>{s.occupancy}/{s.capacity}</small></div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  )
}
