"use client"

import Link from "next/link"
import { Fragment, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react"
import { Activity, ArrowRight, HandHeart, House, LifeBuoy, Map, Radio, ShieldAlert, ShieldCheck } from "lucide-react"
import { RoleIcon } from "@/components/role-icon"
import { ACCESS_TOKEN_KEY, isUserRole } from "@/lib/api"
import { ROLE_META, ROLE_ORDER } from "@/lib/roles"
import type { UserRole } from "@/lib/contracts"
import "./landing.css"

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
const vars = (o: Record<string, string | number>) => o as unknown as CSSProperties

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced() || typeof IntersectionObserver === "undefined") { setShown(true); return }
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setShown(true); io.disconnect() } }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} style={vars({ "--d": `${delay}ms` })}>{children}</div>
}

function spot(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - r.left
  const y = e.clientY - r.top
  const s = e.currentTarget.style
  s.setProperty("--x", `${x}px`)
  s.setProperty("--y", `${y}px`)
  s.setProperty("--rx", `${(y / r.height - 0.5) * -7}deg`)
  s.setProperty("--ry", `${(x / r.width - 0.5) * 7}deg`)
}
function unspot(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--rx", "0deg")
  e.currentTarget.style.setProperty("--ry", "0deg")
}

const STEPS = [
  { key: "report", title: "Report", Icon: LifeBuoy, text: "Volunteers register people in person, with consent.", bullets: ["Role-based access", "Health data protected"] },
  { key: "coordinate", title: "Coordinate", Icon: ShieldAlert, text: "Everyone is ranked by need, with reasons shown.", bullets: ["Explainable score", "Gender is never used"] },
  { key: "mobilize", title: "Mobilize", Icon: HandHeart, text: "The best helpers are assigned and warned.", bullets: ["A silent helper is replaced automatically", "Voice and SMS alerts (simulated)"] },
  { key: "respond", title: "Respond", Icon: ShieldCheck, text: "Rescue teams see who needs what, and where.", bullets: ["On my way, reached, need backup", "Needs-matched shelters"] },
]

const FEATURES = [
  { Icon: Radio, title: "Events and alerts", text: "Warn a whole ward in one tap." },
  { Icon: ShieldAlert, title: "Priority queue", text: "Transparent score, visible reasons." },
  { Icon: HandHeart, title: "Helper coordination", text: "Best-fit helpers with live check-ins." },
  { Icon: Activity, title: "Live re-assignment", text: "Silent helper? The next one is assigned." },
  { Icon: House, title: "Shelter matching", text: "Accessible shelters with free space." },
  { Icon: Map, title: "Monitoring and audit", text: "Live map, fairness audit, access log." },
]

const PILLARS = [
  { name: "Reach", text: "People reached before the deadline." },
  { name: "Continuity", text: "Time to replace a failed helper." },
  { name: "Fairness", text: "Equal outcomes across groups." },
  { name: "Safety", text: "People placed in safe shelters." },
]

const TEAM = ["Gunjan","Shorya"]
const HEADLINE = "When every second matters, coordination saves lives."

function RadarArt() {
  return (
    <svg className="radar" viewBox="0 0 420 420" role="img" aria-label="A helper goes silent and the next helper is assigned automatically">
      <g className="radar-rings"><circle cx="210" cy="210" r="60" /><circle cx="210" cy="210" r="115" /><circle cx="210" cy="210" r="170" /></g>
      <circle className="pulse" cx="210" cy="210" r="30" />
      <circle className="pulse p2" cx="210" cy="210" r="30" />
      <path className="ln ln-a" d="M92 122 L210 210" />
      <path className="ln ln-b" pathLength="1" d="M330 112 L210 210" />
      <path className="ln ln-s" d="M210 210 L92 322" />
      <g className="nd nd-a"><circle cx="92" cy="122" r="15" /><text x="92" y="127" textAnchor="middle">A</text></g>
      <g className="nd nd-b"><circle cx="330" cy="112" r="15" /><text x="330" y="117" textAnchor="middle">B</text></g>
      <g className="nd nd-c"><circle cx="340" cy="322" r="15" /><text x="340" y="327" textAnchor="middle">C</text></g>
      <g className="nd nd-s"><rect x="78" y="308" width="28" height="28" rx="7" /><text x="92" y="327" textAnchor="middle">S</text></g>
      <g className="nd-p"><circle cx="210" cy="210" r="17" /><circle cx="210" cy="210" r="6" /></g>
      <text className="cap cap-1" x="92" y="92" textAnchor="middle">helper silent</text>
      <text className="cap cap-2" x="330" y="82" textAnchor="middle">re-assigned</text>
    </svg>
  )
}

function Workflow() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused || reduced()) return
    const id = window.setInterval(() => setActive((a) => (a + 1) % STEPS.length), 4800)
    return () => window.clearInterval(id)
  }, [paused])
  const step = STEPS[active]
  return (
    <div className="flow" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="flow-track" style={vars({ "--p": active / (STEPS.length - 1) })}>
        <span className="flow-line"><span className="flow-fill" /></span>
        <span className="flow-dot" aria-hidden="true" />
        {STEPS.map((s, i) => (
          <button key={s.key} type="button" className={`flow-node ${i <= active ? "done" : ""} ${i === active ? "on" : ""}`} onClick={() => setActive(i)} aria-pressed={i === active}>
            <span className="flow-ring"><s.Icon aria-hidden="true" /></span>
            <b>{`0${i + 1}`}</b>
            <span>{s.title}</span>
          </button>
        ))}
      </div>
      <div className="flow-card" key={active}>
        <h3>{step.title}</h3>
        <p>{step.text}</p>
        <ul>{step.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
      </div>
    </div>
  )
}

function Network() {
  const [still, setStill] = useState(false)
  useEffect(() => setStill(reduced()), [])
  const edges = [
    { d: "M320 56 Q190 96 112 226", t: "M112 226 Q190 96 320 56", label: "assigns and re-assigns" },
    { d: "M320 56 Q450 96 528 226", t: "M320 56 Q450 96 528 226", label: "needs-ranked queue" },
    { d: "M122 238 Q320 296 518 238", t: "M122 238 Q320 296 518 238", label: "helper status on scene" },
  ]
  return (
    <div className="net">
      <svg viewBox="0 0 640 300" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        {edges.map((e, i) => (
          <g key={e.label}>
            <path className="edge-base" d={e.d} />
            <path className="edge-flow" d={e.d} />
            {still ? null : <circle r="4.5" className="packet"><animateMotion dur="3.2s" repeatCount="indefinite" path={e.d} /></circle>}
                        <path id={`edge-t${i}`} d={e.t} fill="none" />
            <text className="edge-label" dy={-7}><textPath href={`#edge-t${i}`} startOffset="50%" textAnchor="middle">{e.label}</textPath></text>
          </g>
        ))}
      </svg>
      {ROLE_ORDER.map((r, i) => (
        <a key={r} href={`#role-${r}`} className="net-node" style={vars({ "--acc": ROLE_META[r].bright, "--l": ["50%", "17%", "83%"][i], "--t": ["19%", "78%", "78%"][i] })}>
          <RoleIcon name={ROLE_META[r].icon} /><span>{ROLE_META[r].label}</span>
        </a>
      ))}
    </div>
  )
}

export function LandingPage() {
  const root = useRef<HTMLDivElement>(null)
  const [portal, setPortal] = useState<UserRole | null>(null)

  useEffect(() => {
    const role = window.sessionStorage.getItem("sahaara.role")
    if (role && isUserRole(role) && window.sessionStorage.getItem(ACCESS_TOKEN_KEY)) setPortal(role)
  }, [])

  useEffect(() => {
    const el = root.current
    if (!el || reduced()) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      el.style.setProperty("--sy", String(window.scrollY))
      el.style.setProperty("--progress", String(max > 0 ? window.scrollY / max : 0))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="lp" ref={root}>
      <div className="lp-progress" aria-hidden="true" />
       <header className="lp-header">
        <Link href="/" className="lp-brand"><img src="/logo.png" alt="" className="lp-logo" />Sahaara</Link>
        <Link href={portal ? `/${portal}` : "/login"} className="lp-btn ghost">{portal ? "Open portal" : "Sign in"}</Link>
      </header>
      <aside className="lp-side" aria-label="Sections">
        <a href="#how"><Activity aria-hidden="true" /><span>How it works</span></a>
        <a href="#roles"><LifeBuoy aria-hidden="true" /><span>Roles</span></a>
        <a href="#features"><Radio aria-hidden="true" /><span>Features</span></a>
        <a href="#why"><ShieldCheck aria-hidden="true" /><span>Why Sahaara</span></a>
      </aside>

      <section className="hero">
        <div className="layer l1" aria-hidden="true"><svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"><path d="M0 420 C160 300 300 480 460 360 S700 300 800 380" /><path d="M0 470 C180 350 320 520 480 410 S720 350 800 430" /><path d="M0 520 C200 410 340 560 500 460 S740 400 800 480" /></svg></div>
        <div className="layer l2" aria-hidden="true"><span style={vars({ "--x": "12%", "--y": "28%" })} /><span style={vars({ "--x": "74%", "--y": "18%" })} /><span style={vars({ "--x": "88%", "--y": "62%" })} /><span style={vars({ "--x": "30%", "--y": "74%" })} /></div>
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="kicker">Disaster response coordination</p>
            <h1>{HEADLINE.split(" ").map((w, i) => (<Fragment key={i}><span className={`word ${i >= 5 ? "hl" : ""}`}><span style={vars({ "--i": i })}>{w}</span></span>{" "}</Fragment>))}</h1>
            <p className="sub">Sahaara connects coordinators, volunteers and rescue teams so the people warned last, the elderly, bedridden and disabled, are reached first.</p>
            <div className="cta">
              <a href="#roles" className="lp-btn solid">Get started <ArrowRight aria-hidden="true" /></a>
              <Link href="/login" className="lp-btn ghost">Sign in</Link>
            </div>
            <p className="note">Proposed design, prototype stage. Voice and SMS delivery are simulated.</p>
          </div>
          <div className="hero-art layer l3"><RadarArt /></div>
        </div>
        <a href="#how" className="scroll-cue" aria-label="Scroll to how it works"><span /></a>
      </section>

      <section id="how" className="sec">
        <Reveal><p className="eyebrow">How it works</p><h2>Report. Coordinate. Mobilize. Respond.</h2><p className="lead">Four steps from a registration to a person reached. Select a step to see what happens.</p></Reveal>
        <Reveal delay={120}><Workflow /></Reveal>
      </section>

      <section id="roles" className="sec dark">
        <Reveal><p className="eyebrow">Three roles, one network</p><h2>Everyone sees what they need to act.</h2><p className="lead">Each role has its own portal, permissions and view of the response.</p></Reveal>
        <Reveal delay={100}><Network /></Reveal>
        <div className="roles">
          {ROLE_ORDER.map((r, i) => {
            const m = ROLE_META[r]
            return (
              <Reveal key={r} delay={i * 120}>
                <article id={`role-${r}`} className="role-card" style={vars({ "--acc": m.bright })} onPointerMove={spot} onPointerLeave={unspot}>
                  <span className="role-icon"><RoleIcon name={m.icon} /></span>
                  <h3>{m.label}</h3>
                  <strong>{m.portal}</strong>
                  <p>{m.blurb}</p>
                  <ul>{(m.points ?? []).map((p) => <li key={p}>{p}</li>)}</ul>
                  <Link href={`/login/${r}`} className="role-cta">{m.label} portal <ArrowRight aria-hidden="true" /></Link>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section id="features" className="sec">
        <Reveal><p className="eyebrow">Features</p><h2>What works today.</h2><p className="lead">Everything below is built and running in the prototype.</p></Reveal>
        <div className="features">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <article className="feature" onPointerMove={spot} onPointerLeave={unspot}>
                <span className="feature-icon"><f.Icon aria-hidden="true" /></span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="why" className="sec why">
        <Reveal>
          <p className="eyebrow">Why Sahaara</p>
          <h2>Alerts reach devices. Sahaara reaches people.</h2>
          <p className="lead">When towers fail and demand spikes, the person who cannot move on their own is the hardest to reach. Sahaara is designed around that person: consent first, the least health data necessary, transparent triage, and a helper network that closes gaps by itself.</p>
        </Reveal>
        <div className="pillars">
          {PILLARS.map((p, i) => (
            <Reveal key={p.name} delay={i * 90}>
              <div className="pillar"><b>{p.name}</b><p>{p.text}</p></div>
            </Reveal>
          ))}
        </div>
        <Reveal><p className="fine">These are pilot targets, not results. The first drill sets the baseline.</p></Reveal>
      </section>

      <footer className="lp-footer">
        <div>
          <Link href="/" className="lp-brand"><img src="/logo.png" alt="" className="lp-logo" />Sahaara</Link>
          <p>Proposed design, prototype stage. Demo data only.</p>
        </div>
        <nav aria-label="Footer"><b>Explore</b><a href="#how">How it works</a><a href="#roles">Roles</a><a href="#features">Features</a><a href="#why">Why Sahaara</a></nav>
        <nav aria-label="Portals"><b>Portals</b>{ROLE_ORDER.map((r) => <Link key={r} href={`/login/${r}`}>{ROLE_META[r].label}</Link>)}<Link href="/login">Sign in</Link></nav>
        <div className="team">
          <b className="team-title">Team Nirvana</b>
          <ul>{TEAM.map((n) => <li key={n}>{n}</li>)}</ul>
        </div>
      </footer>
    </div>
  )
}
