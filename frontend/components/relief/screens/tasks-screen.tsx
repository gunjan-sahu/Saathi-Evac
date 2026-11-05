"use client"

import { useState } from "react"
import useSWR from "swr"
import { CheckCircle2, Clock, HeartHandshake, Navigation, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContractNotice, EmptyState, ErrorState, LoadingState, PanelHeading, StatusBadge } from "@/components/relief/primitives"
import type { AssignmentRecord, AuthUser, Language } from "@/lib/contracts"
import type { PageId } from "@/components/relief/operations-shell"
import { isAssignmentRecord } from "@/lib/contracts"
import { apiRequest } from "@/lib/api"
import { formatApiError } from "@/lib/format"
import { swrFetcher } from "@/lib/swr-fetcher"
import { t } from "@/lib/i18n"
import type { Notify } from "@/components/relief/types"

function assignmentList(data: unknown): AssignmentRecord[] | null {
  if (!Array.isArray(data)) return null
  return data.every(isAssignmentRecord) ? data : null
}

export function TasksScreen({ user, language, notify, onNavigate }: { user: AuthUser; language: Language; notify: Notify; onNavigate: (page: PageId) => void }) {
  const hasHelperProfile = user.helper_id !== null
  const { data, error, isLoading, mutate } = useSWR<unknown>(hasHelperProfile ? "/helpers/me/assignments" : null, swrFetcher, { revalidateOnFocus: false })
  const assignments = assignmentList(data)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")

  async function updateStatus(assignment: AssignmentRecord, status: "on_my_way" | "reached" | "need_backup") {
    const key = String(assignment.assignment_id)
    setBusyKey(key)
    setActionError("")
    try {
      await apiRequest<unknown>(`/helpers/assignments/${encodeURIComponent(key)}/status?status=${status}`, { method: "POST", auth: true })
      await mutate()
      const label = status === "on_my_way" ? t(language, "onMyWay") : status === "reached" ? t(language, "reached") : t(language, "needBackup")
      notify(`${t(language, "taskStatus")}: ${label}`)
    } catch (cause) {
      setActionError(formatApiError(cause, language))
    } finally {
      setBusyKey(null)
    }
  }

  async function heartbeat() {
    if (user.helper_id === null) return
    setBusyKey("heartbeat")
    setActionError("")
    try {
      await apiRequest<unknown>(`/helpers/${encodeURIComponent(String(user.helper_id))}/heartbeat`, { method: "POST", auth: true })
      notify(t(language, "heartbeatAccepted"))
    } catch (cause) {
      setActionError(formatApiError(cause, language))
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="screen-stack">
      <PanelHeading eyebrow={t(language, "helpers")} title={t(language, "myTasks")} description={t(language, "assignmentsDescription")} />
      {user.helper_id !== null ? (
        <section className="checkin-banner">
          <div className="checkin-banner-icon"><HeartHandshake aria-hidden="true" /></div>
          <div><p className="eyebrow">{t(language, "helperProfile")}</p><h2>{t(language, "checkIn")}</h2><p>{t(language, "helperDescription")}</p></div>
          <Button size="lg" disabled={busyKey !== null} onClick={() => void heartbeat()}>
            <CheckCircle2 data-icon="inline-start" aria-hidden="true" />{busyKey === "heartbeat" ? t(language, "loading") : t(language, "checkIn")}
          </Button>
        </section>
      ) : (
        <div className="helper-profile-prompt">
          <ShieldAlert aria-hidden="true" />
          <p>{t(language, "selfRegisterOnlyOnce")}</p>
          <Button variant="outline" onClick={() => onNavigate("helpers")}>{t(language, "registerHelper")}</Button>
        </div>
      )}
      {actionError ? <p className="form-error" role="alert">{actionError}</p> : null}
      {hasHelperProfile && isLoading ? <LoadingState label={t(language, "loading")} /> : null}
      {hasHelperProfile && error ? <ErrorState message={formatApiError(error, language)} retryLabel={t(language, "retryRequest")} onRetry={() => void mutate()} /> : null}
      {hasHelperProfile && !isLoading && !error && !assignments ? <ContractNotice language={language} /> : null}
      {hasHelperProfile && !isLoading && !error && assignments?.length === 0 ? <EmptyState title={t(language, "noAssignments")} icon={<Clock />} /> : null}
      {assignments && assignments.length > 0 ? (
        <section className="assignment-list" aria-label={t(language, "myTasks")}>
          {assignments.map((assignment) => {
            const key = String(assignment.assignment_id)
            return (
              <article className="assignment-card" key={key}>
                <div className="assignment-card-top">
                  <span className="assignment-icon"><Navigation aria-hidden="true" /></span>
                  <div className="assignment-title"><p className="eyebrow">{t(language, "assignment")} · {key}</p><h3>{t(language, "personDetails")}</h3></div>
                  <StatusBadge>{assignment.status}</StatusBadge>
                </div>
                <div className="assignment-person-note"><ShieldAlert aria-hidden="true" /><span>{t(language, "unsupportedResponse")}</span></div>
                {user.role === "volunteer" ? (
                  <div className="assignment-actions">
                    <Button size="lg" disabled={busyKey !== null} onClick={() => void updateStatus(assignment, "on_my_way")}>
                      <Navigation data-icon="inline-start" aria-hidden="true" />{t(language, "onMyWay")}
                    </Button>
                    <Button variant="outline" size="lg" disabled={busyKey !== null} onClick={() => void updateStatus(assignment, "reached")}>
                      <CheckCircle2 data-icon="inline-start" aria-hidden="true" />{t(language, "reached")}
                    </Button>
                    <Button variant="destructive" size="lg" disabled={busyKey !== null} onClick={() => void updateStatus(assignment, "need_backup")}>
                      <ShieldAlert data-icon="inline-start" aria-hidden="true" />{t(language, "needBackup")}
                    </Button>
                  </div>
                ) : null}
              </article>
            )
          })}
        </section>
      ) : null}
    </div>
  )
}
