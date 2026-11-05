"use client"

import { useState, type FormEvent } from "react"
import useSWR from "swr"
import { LifeBuoy, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog, InlineNotice, PanelHeading } from "@/components/relief/primitives"
import { UnknownEndpointPanel } from "@/components/relief/unknown-endpoint-panel"
import type { ConcernCreatePayload, Language, UserRole } from "@/lib/contracts"
import { apiRequest, ApiError } from "@/lib/api"
import { formatApiError } from "@/lib/format"
import { swrFetcher } from "@/lib/swr-fetcher"
import { t } from "@/lib/i18n"
import type { Notify } from "@/components/relief/types"
import type { useOfflineQueue } from "@/hooks/use-offline-queue"

export function ConcernsScreen({
  language,
  role,
  queue,
  notify,
}: {
  language: Language
  role: UserRole
  queue: ReturnType<typeof useOfflineQueue>
  notify: Notify
}) {
  const coordinator = role === "coordinator"
  const { data, error, isLoading, mutate } = useSWR<unknown>(coordinator ? "/concerns" : null, swrFetcher, { revalidateOnFocus: false })
  const [ward, setWard] = useState("")
  const [message, setMessage] = useState("")
  const [personId, setPersonId] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [formError, setFormError] = useState("")
  const [busy, setBusy] = useState(false)
  const [queued, setQueued] = useState(false)
  const [concernId, setConcernId] = useState("")
  const [resolveError, setResolveError] = useState("")
  const [resolveReview, setResolveReview] = useState(false)

  async function submitConcern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ward.trim() || !message.trim()) {
      setFormError(t(language, "formRequired"))
      return
    }
    const payload: ConcernCreatePayload = {
      ward: ward.trim(),
      message: message.trim(),
      ...(personId.trim() ? { person_id: personId.trim() } : {}),
      anonymous,
    }
    setBusy(true)
    setFormError("")
    setQueued(false)
    try {
      if (queue.online === false) {
        const queuedId = queue.enqueue({ kind: "concern", payload })
        if (!queuedId) {
          setFormError(t(language, "queueNotReady"))
          return
        }
        setQueued(true)
        notify(t(language, "queuedNotConfirmed"), "info")
        setWard("")
        setMessage("")
        setPersonId("")
        setAnonymous(false)
        return
      }
      await apiRequest<unknown>("/concerns", { method: "POST", body: payload, auth: true })
      notify(t(language, "concernSuccess"))
      setWard("")
      setMessage("")
      setPersonId("")
      setAnonymous(false)
      if (coordinator) await mutate()
    } catch (cause) {
      if (cause instanceof ApiError && cause.networkFailure) {
        const queuedId = queue.enqueue({ kind: "concern", payload }, true)
        if (!queuedId) {
          setFormError(t(language, "queueUnavailable"))
          return
        }
        setQueued(true)
        notify(t(language, "queuedNotConfirmed"), "info")
        setWard("")
        setMessage("")
        setPersonId("")
        setAnonymous(false)
      } else {
        setFormError(formatApiError(cause, language))
      }
    } finally {
      setBusy(false)
    }
  }

  async function resolveConcern() {
    const id = concernId.trim()
    if (!id) {
      setResolveError(t(language, "formRequired"))
      setResolveReview(false)
      return
    }
    setBusy(true)
    setResolveError("")
    try {
      await apiRequest<unknown>(`/concerns/${encodeURIComponent(id)}/resolve`, { method: "POST", auth: true })
      notify(t(language, "concernResolved"))
      setConcernId("")
      setResolveReview(false)
      await mutate()
    } catch (cause) {
      setResolveError(formatApiError(cause, language))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen-stack">
      <PanelHeading eyebrow={t(language, "concernsTitle")} title={t(language, "concerns")} description={t(language, "concernsDescription")} />
      <div className="concern-layout">
        <section className="surface-card form-card concern-form-card">
          <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "appDataSource")}</p><h2>{t(language, "concernsTitle")}</h2></div><span className="form-card-mark"><LifeBuoy aria-hidden="true" /></span></div>
          <form className="form-grid" onSubmit={submitConcern}>
            <label className="form-field field-span-2" htmlFor="concern-ward"><span>{t(language, "ward")} <em>*</em></span><input id="concern-ward" className="form-control" value={ward} onChange={(event) => setWard(event.target.value)} required /></label>
            <label className="form-field field-span-2" htmlFor="concern-message"><span>{t(language, "concernMessage")} <em>*</em></span><textarea id="concern-message" className="form-control form-textarea" rows={5} value={message} onChange={(event) => setMessage(event.target.value)} required /></label>
            <label className="form-field field-span-2" htmlFor="concern-person"><span>{t(language, "associatePerson")} <small>{t(language, "optional")}</small></span><input id="concern-person" className="form-control" value={personId} onChange={(event) => setPersonId(event.target.value)} /></label>
            <label className="checkbox-row field-span-2"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} /><span>{t(language, "anonymous")}</span></label>
            {formError ? <p className="form-error field-span-2" role="alert">{formError}</p> : null}
            {queued ? <p className="queued-inline field-span-2" role="status">{t(language, "queuedNotConfirmed")}</p> : null}
            <div className="form-actions field-span-2"><Button size="lg" type="submit" disabled={busy}>{busy ? t(language, "loading") : t(language, "submit")}</Button></div>
          </form>
        </section>
        <aside className="concern-side-panel">
          <span className="concern-side-icon"><ShieldAlert aria-hidden="true" /></span>
          <h2>{t(language, "concerns")}</h2>
          <p>{t(language, "concernQueue")}</p>
          <p className="field-help">{t(language, "localStorageNotice")}</p>
        </aside>
      </div>
      {coordinator ? (
        <section className="surface-card">
          <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "appDataSource")}</p><h2>{t(language, "concerns")}</h2></div></div>
          <UnknownEndpointPanel language={language} data={data} error={error} isLoading={isLoading} message={t(language, "concernsResponseGap")} onRetry={() => void mutate()} />
        </section>
      ) : null}
      {coordinator ? (
        <section className="surface-card manual-action-card">
          <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "concerns")}</p><h2>{t(language, "resolveConcern")}</h2></div></div>
          <form className="manual-action-form" onSubmit={(event) => { event.preventDefault(); setResolveError(""); setResolveReview(true) }}>
            <label className="form-field" htmlFor="concern-resolve-id"><span>{t(language, "concernId")} <em>*</em></span><input id="concern-resolve-id" className="form-control" value={concernId} onChange={(event) => setConcernId(event.target.value)} required /><small className="field-help">{t(language, "concernIdNote")}</small></label>
            <Button type="submit" variant="outline" size="lg">{t(language, "resolveConcern")}</Button>
          </form>
          {resolveError ? <p className="form-error" role="alert">{resolveError}</p> : null}
        </section>
      ) : null}
      <InlineNotice tone="info">{coordinator ? t(language, "queueDescription") : `${t(language, "concernQueue")} ${t(language, "concernDuplicateRisk")}`}</InlineNotice>
      <ConfirmDialog
        open={resolveReview}
        title={t(language, "confirmResolveConcern")}
        description={`${t(language, "resolveConcernWarning")} ${t(language, "concernId")}: ${concernId}`}
        confirmLabel={t(language, "resolveConcern")}
        cancelLabel={t(language, "cancel")}
        busy={busy}
        errorMessage={resolveError}
        destructive
        onCancel={() => setResolveReview(false)}
        onConfirm={() => void resolveConcern()}
      />
    </div>
  )
}
