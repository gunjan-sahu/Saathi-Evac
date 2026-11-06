"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, Map } from "lucide-react"
import { RoleIcon } from "@/components/role-icon"
import { ROLE_META, ROLE_ORDER } from "@/lib/roles"
import type { CSSProperties } from "react"
import "./auth.css"

export function RoleSelect() {
  return (
    <main className="rs">
      <div className="rs-glow" aria-hidden="true" />
      <header className="rs-top">
        <Link href="/" className="rs-brand"><span className="rs-mark"><img src="/logo.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "inherit", background: "#fff" }} /></span>Sahaara</Link>
        <Link href="/" className="rs-back"><ArrowLeft aria-hidden="true" /> Back to home</Link>
      </header>
      <section className="rs-body">
        <p className="rs-eyebrow">Sign in</p>
        <h1>Choose how you work</h1>
        <p className="rs-lead">Each role has its own portal and its own permissions. Pick yours to continue.</p>
        <div className="rs-grid">
          {ROLE_ORDER.map((role, i) => {
            const m = ROLE_META[role]
            return (
              <Link key={role} href={`/login/${role}`} className="rs-card" style={{ "--acc": m.accent, "--soft": m.soft, "--i": i } as unknown as CSSProperties}>
                <span className="rs-icon"><RoleIcon name={m.icon} /></span>
                <h2>{m.label}</h2>
                <strong>{m.portal}</strong>
                <p>{m.blurb}</p>
                <span className="rs-go">Continue <ArrowRight aria-hidden="true" /></span>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
