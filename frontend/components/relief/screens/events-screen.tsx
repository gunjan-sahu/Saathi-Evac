"use client"

import { useState, type FormEvent } from "react"
import useSWR from "swr"
import { AlertTriangle, Bell, CalendarDays, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog, PanelHeading } from "@/components/relief/primitives"
import { UnknownEndpointPanel } from "@/components/relief/unknown-endpoint-panel"
import type { AuthUser, Language } from "@/lib/contracts"
import { apiRequest } from "@/lib/api"
import { formatApiError } from "@/lib/format"
import { swrFetcher } from "@/lib/swr-fetcher"
import { t } from "@/lib/i18n"
import type { Notify } from "@/components/relief/types"

export function EventsScreen({ language, user, notify }: { language: Language; user: AuthUser; notify: Notify }) {
  const { data, error, isLoading, mutate } = useSWR<unknown>("/events", swrFetcher, { revalidateOnFocus: false })
  const [ward, setWard] = useState("")
  const [eventName, setEventName] = useState("")
  const [alertWard, setAlertWard] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const [alertReview, setAlertReview] = useState(false)
  const [eventId, setEventId] = useState("")
  const [endReview, setEndReview] = useState(false)
  const [busy, setBusy] = useState(false)
  const [eventError, setEventError] = useState("")
  const [alertError, setAlertError] = useState("")
  const [endError, setEndError] = useState("")
  const coordinator = user.role === "coordinator"

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ward.trim() || !eventName.trim()) {
      setEventError(t(language, "formRequired"))
      return
    }
    setBusy(true)
    setEventError("")
    try {
      await apiRequest<unknown>("/events", { method: "POST", body: { ward: ward.trim(), name: eventName.trim() }, auth: true })
      notify(t(language, "eventSuccess"))
      setWard("")
      setEventName("")
      await mutate()
    } catch (cause) {
      setEventError(formatApiError(cause, language))
    } finally {
      setBusy(false)
    }
  }

  async function broadcastAlert() {
    if (!alertWard.trim()) {
      setAlertError(t(language, "formRequired"))
      setAlertReview(false)
      return
    }
    setBusy(true)
    setAlertError("")
    try {
      const body = alertMessage.trim() ? { ward: alertWard.trim(), message: alertMessage.trim() } : { ward: alertWard.trim() }
      await apiRequest<unknown>("/alerts", { method: "POST", body, auth: true })
      notify(t(language, "alertSuccess"))
      setAlertWard("")
      setAlertMessage("")
      setAlertReview(false)
      await mutate()
    } catch (cause) {
      setAlertError(formatApiError(cause, language))
    } finally {
      setBusy(false)
    }
  }

  async function endEvent() {
    const id = eventId.trim()
    if (!id) {
      setEndError(t(language, "formRequired"))
      setEndReview(false)
      return
    }
    setBusy(true)
    setEndError("")
    try {
      await apiRequest<unknown>(`/events/${encodeURIComponent(id)}/end`, { method: "POST", auth: true })
      notify(t(language, "eventEnded"))
      setEventId("")
      setEndReview(false)
      await mutate()
    } catch (cause) {
      setEndError(formatApiError(cause, language))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen-stack">
      <PanelHeading eyebrow={t(language, "operationalChannels")} title={t(language, "eventsTitle")} description={t(language, "eventsDescription")} />
      {coordinator ? (
        <div className="event-form-grid">
          <section className="surface-card form-card event-form-card">
            <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "events")}</p><h2>{t(language, "createEvent")}</h2></div><span className="form-card-mark"><CalendarDays aria-hidden="true" /></span></div>
            <form className="form-grid" onSubmit={createEvent}>
              <label className="form-field field-span-2" htmlFor="event-name"><span>{t(language, "eventName")} <em>*</em></span><input id="event-name" className="form-control" value={eventName} onChange={(event) => setEventName(event.target.value)} required /></label>
              <label className="form-field field-span-2" htmlFor="event-ward"><span>{t(language, "ward")} <em>*</em></span><input id="event-ward" className="form-control" value={ward} onChange={(event) => setWard(event.target.value)} required /></label>
              {eventError ? <p className="form-error field-span-2" role="alert">{eventError}</p> : null}
              <div className="form-actions field-span-2"><Button type="submit" size="lg" disabled={busy}><CalendarDays data-icon="inline-start" aria-hidden="true" />{busy ? t(language, "loading") : t(language, "createEvent")}</Button></div>
            </form>
          </section>

          <section className="alert-composer-card">
            <div className="alert-composer-header"><span className="alert-icon"><Bell aria-hidden="true" /></span><div><p className="eyebrow">{t(language, "events")}</p><h2>{t(language, "broadcastAlert")}</h2></div></div>
            <form className="form-grid" onSubmit={(event) => { event.preventDefault(); setAlertError(""); setAlertReview(true) }}>
              <label className="form-field field-span-2" htmlFor="alert-ward"><span>{t(language, "ward")} <em>*</em></span><input id="alert-ward" className="form-control" value={alertWard} onChange={(event) => setAlertWard(event.target.value)} required /></label>
              <label className="form-field field-span-2" htmlFor="alert-message"><span>{t(language, "alertMessage")}</span><textarea id="alert-message" className="form-control form-textarea" value={alertMessage} onChange={(event) => setAlertMessage(event.target.value)} rows={4} /></label>
              {alertError ? <p className="form-error field-span-2" role="alert">{alertError}</p> : null}
              <div className="form-actions field-span-2"><Button type="submit" size="lg"><AlertTriangle data-icon="inline-start" aria-hidden="true" />{t(language, "sendAlert")}</Button></div>
            </form>
            <p className="alert-safety-note"><AlertTriangle aria-hidden="true" />{t(language, "alertConfirmDescription")}</p>
          </section>
        </div>
      ) : null}

      {coordinator ? (
        <section className="surface-card manual-action-card">
          <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "events")}</p><h2>{t(language, "endEvent")}</h2></div></div>
          <form className="manual-action-form" onSubmit={(event) => { event.preventDefault(); setEndError(""); setEndReview(true) }}>
            <label className="form-field" htmlFor="event-end-id"><span>{t(language, "eventId")} <em>*</em></span><input id="event-end-id" className="form-control" value={eventId} onChange={(event) => setEventId(event.target.value)} required /><small className="field-help">{t(language, "eventIdNote")}</small></label>
            <Button type="submit" variant="destructive" size="lg">{t(language, "endEvent")}</Button>
          </form>
          {endError ? <p className="form-error" role="alert">{endError}</p> : null}
        </section>
      ) : null}
      <section className="surface-card event-history-card">
        <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "appDataSource")}</p><h2>{t(language, "eventsTitle")}</h2></div><span className="queue-card-icon"><Radio aria-hidden="true" /></span></div>
        <UnknownEndpointPanel language={language} data={data} error={error} isLoading={isLoading} message={t(language, "eventResponseGap")} onRetry={() => void mutate()} />
      </section>
      <ConfirmDialog
        open={endReview}
        title={t(language, "confirmEndEvent")}
        description={`${t(language, "endEventWarning")} ${t(language, "eventId")}: ${eventId}`}
        confirmLabel={t(language, "endEvent")}
        cancelLabel={t(language, "cancel")}
        busy={busy}
        errorMessage={endError}
        destructive
        onCancel={() => setEndReview(false)}
        onConfirm={() => void endEvent()}
      />
      <ConfirmDialog
        open={alertReview}
        title={t(language, "alertConfirmTitle")}
        description={`${t(language, "alertConfirmDescription")} ${alertWard}`}
        confirmLabel={t(language, "confirm")}
        cancelLabel={t(language, "cancel")}
        busy={busy}
        errorMessage={alertError}
        destructive
        onCancel={() => setAlertReview(false)}
        onConfirm={() => void broadcastAlert()}
      />
    </div>
  )
}
