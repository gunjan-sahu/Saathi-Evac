"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  ArrowRight,
  HeartHandshake,
  Lock,
  PhoneCall,
  Scale,
  Siren,
  WifiOff,
} from "lucide-react"

/* ---------- small helpers ---------- */

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`lp-reveal ${shown ? "lp-reveal-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ---------- demo data (matches backend/seed.py scoring) ---------- */

const people = [
  { name: "Demo Person 1", score: 80, tags: ["Bedridden", "Oxygen", "Lives alone"] },
  { name: "Demo Person 3", score: 28, tags: ["Hearing", "Lives alone"] },
  { name: "Demo Person 2", score: 15, tags: ["Mobility aid"] },
]

const steps = [
  {
    icon: HeartHandshake,
    title: "Register",
    text: "Volunteers sign people up at home, even with no signal.",
  },
  {
    icon: PhoneCall,
    title: "Warn",
    text: "A voice call in their own language asks: safe or need help?",
  },
  {
    icon: Siren,
    title: "Rescue",
    text: "Rescuers get a fair, ranked list. Silent helpers are replaced.",
  },
]

const promises = [
  { icon: WifiOff, title: "Works offline", text: "Saved on the phone, synced later." },
  { icon: Scale, title: "Fair by design", text: "Gender is never used to rank." },
  { icon: Lock, title: "Private", text: "Health details show only during an event." },
]

/* ---------- page ---------- */

export default function LandingPage() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setActive((i) => (i + 1) % people.length), 2800)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="lp min-h-screen overflow-x-hidden bg-[#faf9f5] text-[#183d35]">
      <style>{`
        .lp { font-family: var(--font-interface); }
        @keyframes lp-rise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
        @keyframes lp-ring { 0% { transform: translate(-50%, -50%) scale(.3); opacity: .55; } 100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; } }
        @keyframes lp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes lp-shine { to { background-position: 200% center; } }
        @keyframes lp-blink { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
        .lp-in { opacity: 0; animation: lp-rise .9s cubic-bezier(.22, 1, .36, 1) forwards; }
        .lp-d1 { animation-delay: .1s; } .lp-d2 { animation-delay: .25s; }
        .lp-d3 { animation-delay: .4s; } .lp-d4 { animation-delay: .55s; }
        .lp-ring { position: absolute; left: 50%; top: 50%; border-radius: 9999px; border: 1px solid rgba(169, 197, 174, .5); animation: lp-ring 7s ease-out infinite; }
        .lp-float { animation: lp-float 6s ease-in-out infinite; }
        .lp-shine { background: linear-gradient(90deg, #a9c5ae, #ffffff, #e7b45b, #a9c5ae); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: lp-shine 6s linear infinite; }
        .lp-live { animation: lp-blink 1.6s ease-in-out infinite; }
        .lp-reveal { opacity: 0; transform: translateY(30px); transition: opacity .8s cubic-bezier(.22, 1, .36, 1), transform .8s cubic-bezier(.22, 1, .36, 1); }
        .lp-reveal-in { opacity: 1; transform: none; }
        .lp-card { transition: transform .35s cubic-bezier(.22, 1, .36, 1), box-shadow .35s ease, border-color .25s ease; }
        .lp-card:hover { transform: translateY(-6px); box-shadow: 0 22px 44px -22px rgba(24, 61, 53, .35); border-color: #a9c5ae; }
        .lp-bar { transition: width 1s cubic-bezier(.22, 1, .36, 1); }
        .lp-item { transition: transform .6s cubic-bezier(.22, 1, .36, 1), opacity .6s ease, background-color .4s ease, border-color .4s ease; }
        @media (prefers-reduced-motion: reduce) {
          .lp *, .lp *::before, .lp *::after { animation: none !important; transition: none !important; }
          .lp-in, .lp-reveal { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* ============ HERO (header is part of it, not sticky) ============ */}
      <section className="relative isolate overflow-hidden bg-[#143329] text-white">
        {/* animated radar */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-[-10%] top-[40%] h-[900px] w-[900px] lg:right-[8%]">
            <span className="lp-ring h-full w-full" />
            <span className="lp-ring h-full w-full" style={{ animationDelay: "2.3s" }} />
            <span className="lp-ring h-full w-full" style={{ animationDelay: "4.6s" }} />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_40%,rgba(91,135,110,.35),transparent_70%)]" />
          <span className="lp-float absolute left-[12%] top-[62%] h-2.5 w-2.5 rounded-full bg-[#e7b45b] shadow-[0_0_0_8px_rgba(231,180,91,.15)]" />
          <span className="lp-float absolute left-[46%] top-[22%] h-2 w-2 rounded-full bg-[#a9c5ae] shadow-[0_0_0_8px_rgba(169,197,174,.15)]" style={{ animationDelay: "1.5s" }} />
          <span className="lp-float absolute right-[14%] top-[78%] h-2 w-2 rounded-full bg-[#9fbed0] shadow-[0_0_0_8px_rgba(159,190,208,.15)]" style={{ animationDelay: "3s" }} />
        </div>

        <header className="lp-in mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1">
              <img src="/logo.png" alt="" className="h-full w-full object-contain" />
            </span>
            <span className="text-lg font-bold tracking-tight">Saathi-Evac</span>
          </Link>
          <Link
            href="/app"
            className="rounded-full border border-white/25 px-5 py-2 text-sm font-semibold transition-colors hover:bg-white hover:text-[#143329]"
          >
            Sign in
          </Link>
        </header>

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-14 lg:grid-cols-2 lg:pb-32 lg:pt-20">
          <div>
            <p className="lp-in lp-d1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a9c5ae]">
              <span className="lp-live h-2 w-2 rounded-full bg-[#e7b45b]" />
              Evacuation for those who can&apos;t leave alone
            </p>
            <h1 className="lp-in lp-d2 mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              No one left <span className="lp-shine">behind.</span>
            </h1>
            <p className="lp-in lp-d3 mt-6 max-w-md text-lg leading-relaxed text-[#dbe8dc]">
              Find, warn and reach the people floods forget first.
            </p>
            <div className="lp-in lp-d4 mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/app"
                className="group inline-flex items-center gap-2 rounded-full bg-[#a9c5ae] px-7 py-4 text-sm font-bold text-[#143329] transition-all hover:bg-white hover:shadow-[0_14px_34px_-12px_rgba(169,197,174,.8)]"
              >
                Open the app
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#how" className="text-sm font-semibold text-[#a9c5ae] underline-offset-4 hover:underline">
                How it works
              </a>
            </div>
          </div>

          {/* live demo queue */}
          <div className="lp-in lp-d4 mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#a9c5ae]">Rescue queue</span>
                <span className="flex items-center gap-2 text-xs font-semibold text-[#e7b45b]">
                  <span className="lp-live h-2 w-2 rounded-full bg-[#e7b45b]" />
                  Event active
                </span>
              </div>
              <div className="space-y-3">
                {people.map((p, i) => {
                  const on = i === active
                  return (
                    <div
                      key={p.name}
                      className={`lp-item rounded-2xl border p-4 ${
                        on ? "scale-[1.03] border-[#a9c5ae]/60 bg-white/15" : "border-white/10 bg-white/5 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-bold">{i + 1}</span>
                          <span className="text-sm font-bold">{p.name}</span>
                        </div>
                        <span className="text-2xl font-extrabold text-[#e7b45b]">{p.score}</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="lp-bar h-full rounded-full bg-gradient-to-r from-[#a9c5ae] to-[#e7b45b]" style={{ width: on ? `${p.score}%` : "0%" }} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <span key={t} className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-[#dbe8dc]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <Reveal>
          <h2 className="max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl">Three steps. One goal.</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 120}>
              <div className="lp-card relative h-full overflow-hidden rounded-3xl border border-[#dfe6df] bg-white p-8">
                <span className="absolute -right-3 -top-6 select-none text-[120px] font-black leading-none text-[#e8f0ea]">{i + 1}</span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#183d35] text-white">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="relative mt-8 text-2xl font-bold">{s.title}</h3>
                <p className="relative mt-3 text-[15px] leading-relaxed text-[#52635d]">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ PROMISES ============ */}
      <section className="bg-[#eef1ec] py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-3">
          {promises.map((p, i) => (
            <Reveal key={p.title} delay={i * 120}>
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#28594b] shadow-sm">
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#52635d]">{p.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative isolate overflow-hidden bg-[#143329] py-24 text-center text-white sm:py-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px]">
            <span className="lp-ring h-full w-full" />
            <span className="lp-ring h-full w-full" style={{ animationDelay: "3.5s" }} />
          </div>
        </div>
        <Reveal>
          <h2 className="mx-auto max-w-2xl px-6 text-4xl font-extrabold tracking-tight sm:text-5xl">Be ready before the water rises.</h2>
          <Link
            href="/app"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-[#a9c5ae] px-8 py-4 text-sm font-bold text-[#143329] transition-all hover:bg-white"
          >
            Open the app
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#0f261f] px-6 py-8 text-center text-xs text-[#a9c5ae]">
        Saathi-Evac · Prototype with demo data · Voice and SMS are simulated
      </footer>
    </div>
  )
}