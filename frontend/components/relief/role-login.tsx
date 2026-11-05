"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type CSSProperties, type FormEvent } from "react"
import { ArrowLeft, ArrowRight, Check, Copy, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest, isLoginResponse, saveAccessToken } from "@/lib/api"
import type { UserRole } from "@/lib/contracts"
import { formatApiError } from "@/lib/format"
import { t } from "@/lib/i18n"
import { ROLE_ICON, ROLE_META } from "@/lib/roles"

const SHOW_DEMO = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_DEMO === "true"

export function RoleLogin({ role }: { role: UserRole }) {
  const router = useRouter()
  const meta = ROLE_META[role]
  const Icon = ROLE_ICON[role]
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState("")

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(""), 1500)
    } catch {
      setCopied("")
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError(t("en", "formRequired"))
      return
    }
    setError("")
    setPending(true)
    try {
      const response = await apiRequest<unknown>("/auth/login", {
        method: "POST",
        body: { username: username.trim(), password },
        auth: false,
      })
      if (!isLoginResponse(response)) throw new Error(t("en", "loginResponseGap"))
      if (response.role !== role) {
        setError(`This account is not a ${meta.label} account. Please use the correct sign-in.`)
        return
      }
      saveAccessToken(response.access_token)
      router.push("/portal")
    } catch (cause) {
      setError(formatApiError(cause, "en"))
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="auth-page role-login" lang="en" style={{ "--role-accent": meta.accent } as CSSProperties}>
      <section className="auth-art-panel" aria-label={meta.label}>
        <div className="auth-art-grain" aria-hidden="true" />
        <div className="auth-art-topline">
          <a className="brand-lockup brand-lockup-light" href="/" aria-label="Sahaara">
            <span className="brand-symbol brand-symbol-logo"><img src="/logo.png" alt="" /></span>
            <span className="brand-wordmark">{t("en", "appName")}</span>
          </a>
        </div>
        <div className="auth-art-content">
          <span className="role-card-icon"><Icon aria-hidden="true" /></span>
          <h1>{meta.label}</h1>
          <p>{meta.description}</p>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-inner">
          <Link className="role-back" href="/login"><ArrowLeft aria-hidden="true" /> Choose a different role</Link>
          <div className="auth-form-heading">
            <span className="auth-form-icon" style={{ background: meta.accent, color: "#fff" }}><Icon aria-hidden="true" /></span>
            <p className="eyebrow">{meta.label}</p>
            <h2>{meta.heading}</h2>
            <p>{meta.description}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="form-field" htmlFor="username">
              <span>{t("en", "username")}</span>
              <input id="username" name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
            </label>
            <label className="form-field" htmlFor="password">
              <span>{t("en", "password")}</span>
              <span className="password-input-wrap">
                <input id="password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button className="password-visibility" type="button" onClick={() => setVisible((v) => !v)} aria-label={t("en", visible ? "hidePassword" : "showPassword")}>
                  {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </span>
            </label>

            {error ? <p className="form-error" role="alert">{error}</p> : null}

            <Button className="auth-submit" type="submit" size="lg" disabled={pending}>
              {pending ? t("en", "signingIn") : `Sign in as ${meta.label}`}
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </form>

          {SHOW_DEMO ? (
            <div className="role-demo">
              <strong>Explore with Demo Credentials</strong>
              <div className="role-demo-row">
                <span>Username</span><code>{meta.demoUser}</code>
                <button type="button" aria-label="Copy username" onClick={() => copyText("u", meta.demoUser)}>
                  {copied === "u" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                </button>
              </div>
              <div className="role-demo-row">
                <span>Password</span><code>{meta.demoPass}</code>
                <button type="button" aria-label="Copy password" onClick={() => copyText("p", meta.demoPass)}>
                  {copied === "p" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}