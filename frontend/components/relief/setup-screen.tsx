"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, Check, Map, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api"
import type { Language } from "@/lib/contracts"
import { formatApiError } from "@/lib/format"
import { t } from "@/lib/i18n"

export function SetupScreen({
  language,
  onLanguageChange,
  onDone,
}: {
  language: Language
  onLanguageChange: (language: Language) => void
  onDone: () => void
}) {
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!fullName.trim() || username.trim().length < 3) {
      setError(t(language, "formRequired"))
      return
    }
    if (password.length < 8) {
      setError(t(language, "passwordRule"))
      return
    }
    if (password !== confirm) {
      setError(t(language, "passwordMismatch"))
      return
    }
    setError("")
    setPending(true)
    try {
      await apiRequest<unknown>("/auth/bootstrap", {
        method: "POST",
        body: { username: username.trim(), password, full_name: fullName.trim() },
        auth: false,
      })
      setCreated(true)
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
          <span className="brand-lockup brand-lockup-light">
            <span className="brand-symbol"><Map aria-hidden="true" /></span>
            <span className="brand-wordmark">{t(language, "appName")}</span>
          </span>
          <div className="language-toggle" role="group" aria-label={t(language, "language")}>
            <button type="button" onClick={() => onLanguageChange("en")} aria-pressed={language === "en"}>EN</button>
            <button type="button" onClick={() => onLanguageChange("hi")} aria-pressed={language === "hi"}>हि</button>
          </div>
        </div>
        <div className="auth-art-content">
          <span className="auth-kicker"><span className="signal-dot" /> {t(language, "productLabel")}</span>
          <h1>{t(language, "createFirstCoordinator")}</h1>
          <p>{t(language, "setupHelp")}</p>
        </div>
        <div className="auth-art-footer">
          <div className="secure-mark"><ShieldCheck aria-hidden="true" /><span>{t(language, "reachabilityNote")}</span></div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-form-heading">
            <span className="auth-form-icon">{created ? <Check aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}</span>
            <p className="eyebrow">{t(language, "appName")} · {t(language, "firstTimeSetup")}</p>
            <h2>{t(language, "createFirstCoordinator")}</h2>
            <p>{created ? t(language, "setupSuccess") : t(language, "setupHelp")}</p>
          </div>

          {created ? (
            <Button className="auth-submit" size="lg" onClick={onDone}>{t(language, "backToSignIn")}<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label className="form-field" htmlFor="setup-full-name"><span>{t(language, "fullName")}</span>
                <input id="setup-full-name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required autoFocus /></label>
              <label className="form-field" htmlFor="setup-username"><span>{t(language, "username")}</span>
                <input id="setup-username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
              <label className="form-field" htmlFor="setup-password"><span>{t(language, "password")}</span>
                <input id="setup-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
              <label className="form-field" htmlFor="setup-confirm"><span>{t(language, "confirmPassword")}</span>
                <input id="setup-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required /></label>
              {error ? <p className="form-error" role="alert">{error}</p> : null}
              <Button className="auth-submit" type="submit" size="lg" disabled={pending}>
                {pending ? t(language, "loading") : t(language, "createFirstCoordinator")}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Button>
              <button type="button" className="text-button setup-link" onClick={onDone}>{t(language, "backToSignIn")}</button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
