"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { ArrowUpRight, Heart, MapPin, Search, ShieldAlert, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog, ContractNotice, EmptyState, ErrorState, LoadingState, PanelHeading, StatusBadge } from "@/components/relief/primitives"
import type { Language, PersonRecord } from "@/lib/contracts"
import { isPersonRecord } from "@/lib/contracts"
import { apiRequest } from "@/lib/api"
import { coordinateIsValid, displayValue, formatApiError } from "@/lib/format"
import { swrFetcher } from "@/lib/swr-fetcher"
import { t } from "@/lib/i18n"
import type { Notify } from "@/components/relief/types"

function recordList(data: unknown): PersonRecord[] | null {
  if (!Array.isArray(data)) return null
  return data.every(isPersonRecord) ? data : null
}

function PersonDetailPanel({
  id,
  language,
  onClose,
  onChanged,
  notify,
}: {
  id: string | number
  language: Language
  onClose: () => void
  onChanged: () => void
  notify: Notify
}) {
  const path = `/people/${encodeURIComponent(String(id))}`
  const { data, error, isLoading, mutate } = useSWR<unknown>(path, swrFetcher, { revalidateOnFocus: false })
  const [confirmation, setConfirmation] = useState<"safe" | "help" | "revoke" | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState("")
  const detailDialogRef = useRef<HTMLDialogElement>(null)
  const person = isPersonRecord(data) ? data : null

  useEffect(() => {
    const dialog = detailDialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  async function runAction() {
    if (!confirmation) return
    setBusy(true)
    setActionError("")
    try {
      if (confirmation === "revoke") {
        await apiRequest<unknown>(`/people/${encodeURIComponent(String(id))}/consent/revoke`, { method: "POST", auth: true })
        notify(t(language, "revokeSuccess"))
        onChanged()
        onClose()
      } else {
        const safe = confirmation === "safe"
        await apiRequest<unknown>(`/people/${encodeURIComponent(String(id))}/reply?safe=${String(safe)}`, { method: "POST", auth: true })
        await mutate()
        onChanged()
        notify(t(language, "replyAccepted"))
        setConfirmation(null)
      }
    } catch (cause) {
      if (confirmation === "revoke" && cause instanceof Error && "networkFailure" in cause && cause.networkFailure) {
        setActionError(t(language, "revokeOutcomeUncertain"))
      } else {
        setActionError(formatApiError(cause, language))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={detailDialogRef}
      className="detail-backdrop"
      aria-labelledby="person-detail-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <aside className="person-detail-panel">
        <div className="detail-panel-header">
          <div>
            <p className="eyebrow">{t(language, "peopleDirectory")}</p>
            <h2 id="person-detail-title">{t(language, "personDetails")}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t(language, "close")}>×</button>
        </div>
        {isLoading ? <LoadingState label={t(language, "loading")} /> : null}
        {error ? <ErrorState message={formatApiError(error, language)} retryLabel={t(language, "retryRequest")} onRetry={() => void mutate()} /> : null}
        {!isLoading && !error && !person ? <ContractNotice language={language} /> : null}
        {person ? (
          <>
            <div className="person-detail-identity">
              <span className="person-detail-avatar"><Users aria-hidden="true" /></span>
              <div><h3>{person.name}</h3><p>{t(language, "ward")}: {person.ward}</p></div>
            </div>
            <div className="detail-status-grid">
              {person.safe_confirmed === true ? <StatusBadge tone="success">{t(language, "confirmedSafe")}</StatusBadge> : null}
              {person.safe_confirmed !== true ? <StatusBadge tone="warning">{t(language, "safetyNotConfirmed")}</StatusBadge> : null}
              {person.needs_help === true ? <StatusBadge tone="danger">{t(language, "needsHelp")}</StatusBadge> : null}
              {person.needs_help === false ? <StatusBadge>{t(language, "assistanceNotReported")}</StatusBadge> : null}
            </div>
            <div className="detail-list">
              <div><span>{t(language, "assignedHelpers")}</span><strong>{person.helpers.length ? person.helpers.join(", ") : t(language, "notReported")}</strong></div>
              <div><span>{t(language, "shelter")}</span><strong>{displayValue(person.shelter, t(language, "notReported"))}</strong></div>
            </div>
            {person.health_visible === true ? (
              <section className="health-visible-panel">
                <p className="eyebrow">{t(language, "healthVisibilityNote")}</p>
                {typeof person.priority_score === "number" ? <div className="detail-list"><div><span>{t(language, "priority")}</span><strong>{String(person.priority_score)}</strong></div></div> : null}
                {Array.isArray(person.reasons) && person.reasons.length ? <div className="reason-list"><strong>{t(language, "reasons")}</strong>{person.reasons.map((reason, index) => <span key={`${reason}-${index}`}>{reason}</span>)}</div> : null}
                {coordinateIsValid(person.lat, -90, 90) && coordinateIsValid(person.lon, -180, 180) ? <p className="detail-coordinate"><MapPin aria-hidden="true" />{person.lat}, {person.lon}</p> : null}
              </section>
            ) : <p className="hidden-health-note"><ShieldAlert aria-hidden="true" />{t(language, "healthHidden")}</p>}
            {actionError ? <p className="form-error" role="alert">{actionError}</p> : null}
            <div className="person-action-stack">
              <div className="person-response-actions">
                <Button size="lg" onClick={() => { setActionError(""); setConfirmation("safe") }}><Heart data-icon="inline-start" aria-hidden="true" />{t(language, "replySafe")}</Button>
                <Button variant="outline" size="lg" onClick={() => { setActionError(""); setConfirmation("help") }}><ShieldAlert data-icon="inline-start" aria-hidden="true" />{t(language, "replyUnsafe")}</Button>
              </div>
              <Button variant="destructive" size="lg" onClick={() => { setActionError(""); setConfirmation("revoke") }}>{t(language, "revokeConsent")}</Button>
            </div>
          </>
        ) : null}
        <ConfirmDialog
          open={confirmation !== null}
          title={t(language, confirmation === "safe" || confirmation === "help" ? "confirmSafety" : "confirmRevoke")}
          description={t(language, confirmation === "revoke" ? "revokeWarning" : "confirmSafetyDescription")}
          confirmLabel={t(language, "confirm")}
          cancelLabel={t(language, "cancel")}
          destructive={confirmation === "revoke"}
          busy={busy}
          errorMessage={actionError}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => void runAction()}
        />
      </aside>
    </dialog>
  )
}

export function PeopleScreen({ language, notify }: { language: Language; notify?: Notify }) {
  const [wardInput, setWardInput] = useState("")
  const [ward, setWard] = useState("")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const path = `/people?ward=${encodeURIComponent(ward)}`
  const { data, error, isLoading, mutate } = useSWR<unknown>(path, swrFetcher, { revalidateOnFocus: false })
  const people = recordList(data)
  const filtered = useMemo(() => {
    if (!people) return []
    const query = search.trim().toLocaleLowerCase()
    if (!query) return people
    return people.filter((person) => [person.name, person.ward, ...person.helpers].some((value) => value.toLocaleLowerCase().includes(query)))
  }, [people, search])

  return (
    <div className="screen-stack">
      <PanelHeading eyebrow={t(language, "peopleDirectory")} title={t(language, "people")} description={t(language, "peopleDescription")} />
      <div className="people-filter-card">
        <form className="filter-row" onSubmit={(event) => { event.preventDefault(); setWard(wardInput.trim()) }}>
          <label className="form-field filter-field" htmlFor="people-ward"><span>{t(language, "filterByWard")}</span><input id="people-ward" className="form-control" value={wardInput} onChange={(event) => setWardInput(event.target.value)} /></label>
          <Button type="submit" size="lg">{t(language, "apply")}</Button>
        </form>
        <label className="search-field" htmlFor="people-search"><Search aria-hidden="true" /><input id="people-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t(language, "search")} /></label>
      </div>
      {error ? <ErrorState message={formatApiError(error, language)} retryLabel={t(language, "retryRequest")} onRetry={() => void mutate()} /> : null}
      {isLoading ? <LoadingState label={t(language, "loading")} /> : null}
      {!isLoading && !error && !people ? <ContractNotice language={language} /> : null}
      {!isLoading && !error && people?.length === 0 ? <EmptyState title={t(language, "noPeople")} icon={<Users />} /> : null}
      {people && people.length > 0 ? (
        <section className="people-list" aria-label={t(language, "peopleDirectory")}>
          {filtered.length === 0 ? <EmptyState title={t(language, "noRecords")} /> : filtered.map((person) => (
            <article className="person-row-card" key={person.id}>
              <div className="person-row-avatar" aria-hidden="true">{person.name.trim().slice(0, 1).toLocaleUpperCase()}</div>
              <div className="person-row-main">
                <div className="person-row-title"><h3>{person.name}</h3><StatusBadge tone={person.needs_help === true ? "danger" : person.safe_confirmed === true ? "success" : "warning"}>{person.needs_help === true ? t(language, "needsHelp") : person.safe_confirmed === true ? t(language, "confirmedSafe") : t(language, "safetyNotConfirmed")}</StatusBadge></div>
                <p className="person-row-meta">{t(language, "ward")} {person.ward} <span aria-hidden="true">·</span> {t(language, "assignedHelpers")} {person.helpers.length ? person.helpers.join(", ") : t(language, "notReported")}</p>
                <div className="person-row-bottom">
                  {person.health_visible ? (
                    <span className="health-visibility-label"><ShieldAlert aria-hidden="true" />{t(language, "healthVisibilityNote")}</span>
                  ) : <span className="health-visibility-label"><ShieldAlert aria-hidden="true" />{t(language, "healthHidden")}</span>}
                  {person.health_visible && typeof person.priority_score === "number" ? <span className="priority-inline">{t(language, "priority")}: {String(person.priority_score)}</span> : null}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedId(person.id)}>
                {t(language, "viewDetails")} <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            </article>
          ))}
        </section>
      ) : null}
      {selectedId !== null ? <PersonDetailPanel id={selectedId} language={language} onClose={() => setSelectedId(null)} onChanged={() => void mutate()} notify={notify ?? (() => undefined)} /> : null}
    </div>
  )
}
