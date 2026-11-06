"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, type CSSProperties, type FormEvent } from "react"
import { ArrowLeft, ArrowRight, Check, Copy, Eye, EyeOff, Languages, Lock, WifiOff } from "lucide-react"
import { RoleIcon } from "@/components/role-icon"
import { apiRequest, isLoginResponse, saveAccessToken } from "@/lib/api"
import { LANG_KEY, ROLE_HI, UI, type Lang } from "@/lib/auth-copy"
import type { UserRole } from "@/lib/contracts"
import { DEMO_ACCOUNTS, DEMO_MODE } from "@/lib/demo"
import { formatApiError } from "@/lib/format"
import { ROLE_META } from "@/lib/roles"
import "./auth.css"

type Errors = { username?: string; password?: string; form?: string }

function CopyButton({ text, label, copyText, doneText }: { text: string; label: string; copyText: string; doneText: string }) {
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
    <button type="button" className={`copy-btn ${done ? "done" : ""}`} onClick={() => void copy()} aria-label={`${copyText} ${label}`}>
      {done ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span>{done ? doneText : copyText}</span>
    </button>
  )
}

export function RoleLogin({ role }: { role: UserRole }) {
  const meta = ROLE_META[role]
  const router = useRouter()
  const [lang, setLang] = useState<Lang>("en")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANG_KEY)
      if (saved === "hi" || saved === "en") setLang(saved)
    } catch {}
  }, [])

  function chooseLang(next: Lang) {
    setLang(next)
    try { window.localStorage.setItem(LANG_KEY, next) } catch {}
  }

  const ui = UI[lang]
  const text = lang === "hi" ? ROLE_HI[role] : { label: meta.label, portal: meta.portal, tagline: meta.tagline, points: meta.points }
  const demo = DEMO_ACCOUNTS[role]

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Errors = {}
    if (username.trim().length < 3) next.username = ui.errUser
    if (!password) next.password = ui.errPass
    setErrors(next)
    if (next.username || next.password) return
    setPending(true)
    try {
      const response = await apiRequest<unknown>("/auth/login", {
        method: "POST",
        body: { username: username.trim(), password, role },
        auth: false,
      })
      if (!isLoginResponse(response) || response.role !== role) throw new Error(ui.badResponse)
      saveAccessToken(response.access_token)
      window.sessionStorage.setItem("sahaara.role", role)
      router.replace(`/${role}`)
    } catch (cause) {
      const base = formatApiError(cause, lang)
      const hint = DEMO_MODE && username.trim().toLowerCase() !== demo.username ? ` Demo username is ${demo.username}. Use "Fill form" below.` : ""
      setErrors({ form: base + hint })
      setPending(false)
    }
  }

  return (
    <main className="lg" lang={lang} style={{ "--acc": meta.accent, "--soft": meta.soft, "--bright": meta.bright } as unknown as CSSProperties}>
      <div className="lg-lang" role="group" aria-label="Language">
        <Languages aria-hidden="true" />
        <button type="button" aria-pressed={lang === "en"} onClick={() => chooseLang("en")}>EN</button>
        <button type="button" aria-pressed={lang === "hi"} onClick={() => chooseLang("hi")}>हि</button>
      </div>

      <section className="lg-art">
        <div className="lg-rings" aria-hidden="true"><span /><span /><span /></div>
        <div className="lg-watermark" aria-hidden="true"><RoleIcon name={meta.icon} /></div>
        <Link href="/" className="rs-brand light"><span className="rs-mark"><img src="/logo.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "inherit", background: "#fff" }} /></span>Sahaara</Link>
        <div className="lg-art-copy">
          <span className="lg-icon"><RoleIcon name={meta.icon} /></span>
          <p className="rs-eyebrow">{ui.signInEyebrow(text.label)}</p>
          <h1>{text.portal}</h1>
          <p>{text.tagline}</p>
          <ul className="lg-points">{text.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
        <div className="lg-chips">
          <span><WifiOff aria-hidden="true" />{ui.chips[0]}</span>
          <span><Languages aria-hidden="true" />{ui.chips[1]}</span>
          <span><Lock aria-hidden="true" />{ui.chips[2]}</span>
        </div>
      </section>

      <section className="lg-form">
        <div className="lg-inner">
          <Link href="/login" className="rs-back dark"><ArrowLeft aria-hidden="true" /> {ui.back}</Link>
          <h2>{ui.signInAs(text.label)}</h2>
          <p className="muted">{ui.desc(text.label)}</p>

          <form onSubmit={submit} noValidate>
            <label htmlFor="lg-user">{ui.username}</label>
            <input id="lg-user" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} aria-invalid={Boolean(errors.username)} autoFocus />
            {errors.username ? <small className="err">{errors.username}</small> : null}
            <label htmlFor="lg-pass">{ui.password}</label>
            <span className="pw">
              <input id="lg-pass" type={visible ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(errors.password)} />
              <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? ui.hide : ui.show}>{visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button>
            </span>
            {errors.password ? <small className="err">{errors.password}</small> : null}
            {errors.form ? <p className="err form-err" role="alert">{errors.form}</p> : null}
            <button className="lg-submit" disabled={pending}>{pending ? <span className="spin" aria-hidden="true" /> : null}{pending ? ui.signingIn : ui.signIn}{pending ? null : <ArrowRight aria-hidden="true" />}</button>
          </form>
          {role === "coordinator" ? <p className="muted small">{ui.firstTime} <Link href="/setup">{ui.createCoord}</Link></p> : null}

          {DEMO_MODE ? (
            <div className="demo">
              <h3>{ui.demoTitle}</h3>
              <p className="muted small">{ui.demoNote}</p>
              <div className="demo-row current">
                <div><span className="demo-k">{ui.username}</span><code>{demo.username}</code><CopyButton text={demo.username} label={ui.username} copyText={ui.copy} doneText={ui.copied} /></div>
                <div><span className="demo-k">{ui.password}</span><code>{demo.password}</code><CopyButton text={demo.password} label={ui.password} copyText={ui.copy} doneText={ui.copied} /></div>
                <button type="button" className="fill" onClick={() => { setUsername(demo.username); setPassword(demo.password); setErrors({}) }}>{ui.fill}</button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}