"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, Check, Copy, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { API_BASE_URL, API_URL_CONFIGURED } from "@/lib/api"
import type { Language } from "@/lib/contracts"
import { formatApiError } from "@/lib/format"
import { t } from "@/lib/i18n"

export function LoginScreen({
  language,
  onLanguageChange,
  onLogin,
  onSetup,
}: {
  language: Language
  onLanguageChange: (language: Language) => void
  onLogin: (username: string, password: string) => Promise<void>
  onSetup?: () => void
}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState("")

  const demoAccounts = [
    { role: "Coordinator", user: "coord", pass: "Coord@12345" },
    { role: "Rescue", user: "rescue", pass: "Rescue@12345" },
    { role: "Volunteer", user: "volunteer1", pass: "Volunteer@12345" },
  ]

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
      setError(t(language, "formRequired"))
      return
    }
    setError("")
    setPending(true)
    try {
      await onLogin(username.trim(), password)
    } catch (cause) {
      setError(formatApiError(cause, language))
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="auth-page" lang={language}>
      <section className="auth-art-panel" aria-label={t(language, "mission")}>
        <div className="auth-art-grain" aria-hidden="true" />
        <div className="auth-art-topline">
          <a className="brand-lockup brand-lockup-light" href="/" aria-label={t(language, "appName")}>
            <span className="brand-symbol brand-symbol-logo"><img src="/logo.png" alt="" /></span>
            <span className="brand-wordmark">{t(language, "appName")}</span>
          </a>
          <div className="language-toggle" role="group" aria-label={t(language, "language")}>
            <button type="button" onClick={() => onLanguageChange("en")} aria-pressed={language === "en"}>EN</button>
            <button type="button" onClick={() => onLanguageChange("hi")} aria-pressed={language === "hi"}>हि</button>
          </div>
        </div>

        <div className="auth-art-content">
          <span className="auth-kicker"><span className="signal-dot" /> {t(language, "productLabel")}</span>
          <h1>{t(language, "loginHeading")}</h1>
          <p>{t(language, "loginDescription")}</p>
          <div className="contour-art" aria-hidden="true">
            <svg viewBox="0 0 680 420" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-18 312C71 254 105 295 170 261C248 221 234 156 320 150C405 143 402 208 474 198C554 186 560 116 705 97" />
              <path d="M-23 346C66 288 109 327 178 295C263 256 249 190 326 184C405 177 419 243 483 230C557 215 576 149 705 132" />
              <path d="M-31 380C58 323 118 361 191 329C277 291 265 226 333 219C408 211 433 277 492 263C562 247 590 184 704 167" />
              <path d="M-12 280C69 225 99 265 160 228C228 186 215 121 311 116C397 112 384 173 465 164C548 155 548 84 702 64" />
              <path d="M14 415C101 361 150 390 211 367C292 337 297 279 351 269C424 256 448 316 506 300C570 281 609 223 702 204" />
              <path d="M45 246C108 204 132 230 185 194C245 154 242 91 321 84C390 77 387 135 465 131C535 128 558 57 699 35" />
              <path d="M58 430C139 380 173 406 239 380C314 350 324 304 373 292C438 277 467 337 526 324C579 312 629 252 695 239" />
              <path d="M102 210C158 176 175 197 222 162C274 124 266 66 335 56C401 45 403 102 473 98C543 94 578 31 693 9" />
              <path d="M-28 205C31 173 64 190 111 159C166 124 161 70 227 48" />
              <path d="M-35 166C20 139 57 152 94 124C137 93 147 49 185 31" />
            </svg>
            <span className="contour-marker marker-one" />
            <span className="contour-marker marker-two" />
            <span className="contour-marker marker-three" />
          </div>
        </div>

        <div className="auth-art-footer">
          <div className="secure-mark"><ShieldCheck aria-hidden="true" /><span>{t(language, "reachabilityNote")}</span></div>
          <span className="auth-version">{t(language, "appDataSource")}</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-mobile-brand">
          <a className="brand-lockup" href="/" aria-label={t(language, "appName")}>
            <span className="brand-symbol brand-symbol-logo"><img src="/logo.png" alt="" /></span>
            <span className="brand-wordmark">{t(language, "appName")}</span>
          </a>
          <div className="language-toggle language-toggle-light" role="group" aria-label={t(language, "language")}>
            <button type="button" onClick={() => onLanguageChange("en")} aria-pressed={language === "en"}>EN</button>
            <button type="button" onClick={() => onLanguageChange("hi")} aria-pressed={language === "hi"}>हि</button>
          </div>
        </div>
        <div className="auth-form-inner">
          <div className="auth-form-heading">
            <span className="auth-form-icon"><ShieldCheck aria-hidden="true" /></span>
            <p className="eyebrow">{t(language, "appName")} · {t(language, "productLabel")}</p>
            <h2>{t(language, "loginPanelTitle")}</h2>
            <p>{t(language, "loginPanelDescription")}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="form-field" htmlFor="username">
              <span>{t(language, "username")}</span>
              <input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoFocus
              />
            </label>
            <label className="form-field" htmlFor="password">
              <span>{t(language, "password")}</span>
              <span className="password-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  className="password-visibility"
                  type="button"
                  onClick={() => setVisible((current) => !current)}
                  aria-label={t(language, visible ? "hidePassword" : "showPassword")}
                >
                  {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </span>
            </label>

            {error ? <p className="form-error" role="alert">{error}</p> : null}

            <Button className="auth-submit" type="submit" size="lg" disabled={pending}>
              {pending ? t(language, "signingIn") : t(language, "signIn")}
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </form>

          {process.env.NODE_ENV !== "production" ? (
            <div style={{ marginTop: 14, fontSize: 12, lineHeight: 1.7, color: "#315b48" }}>
              {demoAccounts.map((a) => (
                <div key={a.user} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{a.role}: <code>{a.user}</code> / <code>{a.pass}</code></span>
                  <button
                    type="button"
                    onClick={() => copyText(a.user, a.pass)}
                    aria-label={`Copy ${a.role} password`}
                    style={{ border: 0, background: "none", cursor: "pointer", padding: 0, display: "inline-flex" }}
                  >
                    {copied === a.user ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="setup-note">
            <strong>{t(language, "setupNote")}</strong>
            <p>{t(language, "setupDetail")}</p>
            {onSetup ? <button type="button" className="text-button setup-link" onClick={onSetup}>{t(language, "firstTimeSetup")}</button> : null}
          </div>
        </div>
        <footer className="auth-footer">
          <span>{t(language, "serviceDetail")}</span>
          <code>{API_BASE_URL}</code>
          {!API_URL_CONFIGURED ? <small className="api-config-note">{t(language, "apiNotConfigured")}</small> : null}
        </footer>
      </section>
    </main>
  )
}