"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type CSSProperties, type FormEvent } from "react"
import { ArrowLeft, ArrowRight, Check, Copy, Eye, EyeOff, Map } from "lucide-react"
import { RoleIcon } from "@/components/role-icon"
import { apiRequest, isLoginResponse, saveAccessToken } from "@/lib/api"
import type { UserRole } from "@/lib/contracts"
import { DEMO_ACCOUNTS, DEMO_MODE } from "@/lib/demo"
import { formatApiError } from "@/lib/format"
import { ROLE_META, ROLE_ORDER } from "@/lib/roles"
import "./auth.css"

type Errors = { username?: string; password?: string; form?: string }

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const area = document.createElement("textarea")
      area.value = text
      document.body.appendChild(area)
      area.select()
      document.execCommand("copy")
      area.remove()
    }
    setDone(true)
    window.setTimeout(() => setDone(false), 1600)
  }
  return (
    <button type="button" className={`copy-btn ${done ? "done" : ""}`} onClick={() => void copy()} aria-label={`Copy ${label}`}>
      {done ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span>{done ? "Copied" : "Copy"}</span>
    </button>
  )
}

export function RoleLogin({ role }: { role: UserRole }) {
  const meta = ROLE_META[role]
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Errors = {}
    if (username.trim().length < 3) next.username = "Enter your username (at least 3 characters)."
    if (!password) next.password = "Enter your password."
    setErrors(next)
    if (next.username || next.password) return
    setPending(true)
    try {
      const response = await apiRequest<unknown>("/auth/login", {
        method: "POST",
        body: { username: username.trim(), password, role },
        auth: false,
      })
      if (!isLoginResponse(response) || response.role !== role) throw new Error("Unexpected response from the sign-in service.")
      saveAccessToken(response.access_token)
      window.sessionStorage.setItem("sahaara.role", role)
      router.replace(`/${role}`)
    } catch (cause) {
      setErrors({ form: formatApiError(cause, "en") })
      setPending(false)
    }
  }

  return (
    <main className="lg" style={{ "--acc": meta.accent, "--soft": meta.soft, "--bright": meta.bright } as unknown as CSSProperties}>
      <section className="lg-art">
        <div className="lg-rings" aria-hidden="true"><span /><span /><span /></div>
        <Link href="/" className="rs-brand light"><span className="rs-mark"><img src="/logo.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "inherit", background: "#fff" }} /></span>Sahaara</Link>
        <div className="lg-art-copy">
          <span className="lg-icon"><RoleIcon name={meta.icon} /></span>
          <p className="rs-eyebrow">{meta.label} sign-in</p>
          <h1>{meta.portal}</h1>
          <p>{meta.tagline}</p>
          <ul>{meta.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      </section>

      <section className="lg-form">
        <div className="lg-inner">
          <Link href="/login" className="rs-back dark"><ArrowLeft aria-hidden="true" /> Choose another role</Link>
          <h2>Sign in as {meta.label.toLowerCase()}</h2>
          <p className="muted">Use the account your coordinator created for you. Only {meta.label.toLowerCase()} accounts can enter this portal.</p>

          <form onSubmit={submit} noValidate>
            <label htmlFor="lg-user">Username</label>
            <input id="lg-user" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} aria-invalid={Boolean(errors.username)} autoFocus />
            {errors.username ? <small className="err">{errors.username}</small> : null}
            <label htmlFor="lg-pass">Password</label>
            <span className="pw">
              <input id="lg-pass" type={visible ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(errors.password)} />
              <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button>
            </span>
            {errors.password ? <small className="err">{errors.password}</small> : null}
            {errors.form ? <p className="err form-err" role="alert">{errors.form}</p> : null}
            <button className="lg-submit" disabled={pending}>{pending ? <span className="spin" aria-hidden="true" /> : null}{pending ? "Signing in…" : "Sign in"}{pending ? null : <ArrowRight aria-hidden="true" />}</button>
          </form>
          {role === "coordinator" ? <p className="muted small">First time here? <Link href="/setup">Create the first coordinator account</Link></p> : null}

          {DEMO_MODE ? (
            <div className="demo">
              <h3>Explore with Demo Credentials</h3>
              <p className="muted small">Demo accounts for a demonstration database only. Create them with <code>python create_demo_accounts.py</code>.</p>
              {ROLE_ORDER.map((r) => {
                const acc = DEMO_ACCOUNTS[r]
                const m = ROLE_META[r]
                return (
                  <div key={r} className={`demo-row ${r === role ? "current" : ""}`} style={{ "--acc": m.accent } as unknown as CSSProperties}>
                    <strong>{m.label}</strong>
                    <div><code>{acc.username}</code><CopyButton text={acc.username} label={`${m.label} username`} /></div>
                    <div><code>{acc.password}</code><CopyButton text={acc.password} label={`${m.label} password`} /></div>
                    {r === role
                      ? <button type="button" className="fill" onClick={() => { setUsername(acc.username); setPassword(acc.password); setErrors({}) }}>Fill form</button>
                      : <Link className="fill" href={`/login/${r}`}>Open sign-in</Link>}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
