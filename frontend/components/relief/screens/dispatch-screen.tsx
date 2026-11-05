"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import useSWR from "swr"
import { Map, MapPin, Radio, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PanelHeading, StatusBadge, LoadingState, ErrorState, EmptyState, ContractNotice } from "@/components/relief/primitives"
import { UnknownEndpointPanel } from "@/components/relief/unknown-endpoint-panel"
import type { AuthUser, HelperRecord, Language, PersonRecord } from "@/lib/contracts"
import { isHelperRecord, isPersonRecord } from "@/lib/contracts"
import { coordinateIsValid, formatApiError } from "@/lib/format"
import { swrFetcher } from "@/lib/swr-fetcher"
import { t } from "@/lib/i18n"
import type { DispatchMapPoint } from "@/components/maps/dispatch-map"

const DispatchMap = dynamic(() => import("@/components/maps/dispatch-map"), {
  ssr: false,
  loading: () => <div className="map-loading"><span className="map-loading-lines" /></div>,
})

function validList<T>(data: unknown, guard: (value: unknown) => value is T): T[] | null {
  if (!Array.isArray(data)) return null
  return data.every(guard) ? data : null
}

export function DispatchScreen({ user, language }: { user: AuthUser; language: Language; notify?: (message: string, tone?: "success" | "danger" | "info") => void }) {
  const [wardDraft, setWardDraft] = useState("")
  const [ward, setWard] = useState("")
  const queuePath = `/dispatch/queue?ward=${encodeURIComponent(ward)}`
  const peoplePath = `/people?ward=${encodeURIComponent(ward)}`
  const { data: queueData, error: queueError, isLoading: queueLoading, mutate: mutateQueue } = useSWR<unknown>(queuePath, swrFetcher, { revalidateOnFocus: false })
  const { data: reassignmentData, error: reassignmentError, isLoading: reassignmentLoading, mutate: mutateReassignments } = useSWR<unknown>("/dispatch/reassignments", swrFetcher, { revalidateOnFocus: false })
  const { data: helperData, error: helperError, isLoading: helperLoading, mutate: mutateHelpers } = useSWR<unknown>("/helpers", swrFetcher, { revalidateOnFocus: false })
  const { data: shelterData, error: shelterError, isLoading: shelterLoading, mutate: mutateShelters } = useSWR<unknown>("/dispatch/shelters", swrFetcher, { revalidateOnFocus: false })
  const { data: eventData, error: eventError, isLoading: eventLoading, mutate: mutateEvents } = useSWR<unknown>("/events", swrFetcher, { revalidateOnFocus: false })
  const { data: peopleData, error: peopleError, isLoading: peopleLoading, mutate: mutatePeople } = useSWR<unknown>(user.role === "coordinator" ? peoplePath : null, swrFetcher, { revalidateOnFocus: false })

  const helpers = validList<HelperRecord>(helperData, isHelperRecord)
  const people = validList<PersonRecord>(peopleData, isPersonRecord)
  const helperShapeGap = !helperLoading && !helperError && helperData !== undefined && helpers === null
  const peopleShapeGap = user.role === "coordinator" && !peopleLoading && !peopleError && peopleData !== undefined && people === null
  const mapPoints = useMemo<DispatchMapPoint[]>(() => {
    const points: DispatchMapPoint[] = []
    for (const helper of helpers ?? []) {
      if (!coordinateIsValid(helper.lat, -90, 90) || !coordinateIsValid(helper.lon, -180, 180)) continue
      points.push({
        id: `helper-${helper.id}`,
        label: helper.name,
        kind: "helper",
        latitude: helper.lat,
        longitude: helper.lon,
        detail: helper.status,
      })
    }
    for (const person of people ?? []) {
      if (person.health_visible !== true) continue
      if (!coordinateIsValid(person.lat, -90, 90) || !coordinateIsValid(person.lon, -180, 180)) continue
      points.push({
        id: `person-${person.id}`,
        label: person.name,
        kind: "person",
        latitude: person.lat,
        longitude: person.lon,
      })
    }
    return points
  }, [helpers, people])

  const loadingAny = queueLoading || reassignmentLoading || helperLoading || shelterLoading || eventLoading || (user.role === "coordinator" && peopleLoading)
  const refreshAll = () => {
    void mutateQueue()
    void mutateReassignments()
    void mutateHelpers()
    void mutateShelters()
    void mutateEvents()
    if (user.role === "coordinator") void mutatePeople()
  }

  return (
    <div className="screen-stack dispatch-screen">
      <section className="screen-intro-row">
        <PanelHeading eyebrow={t(language, "liveData")} title={t(language, "dispatchTitle")} description={t(language, "dispatchDescription")} />
        <Button variant="outline" onClick={refreshAll}>
          <Radio data-icon="inline-start" aria-hidden="true" />
          {t(language, "refresh")}
        </Button>
      </section>

      <section className="dispatch-filter-card" aria-label={t(language, "filterByWard")}>
        <div className="filter-field">
          <label htmlFor="dispatch-ward">{t(language, "filterByWard")}</label>
          <input id="dispatch-ward" className="form-control" value={wardDraft} onChange={(event) => setWardDraft(event.target.value)} />
        </div>
        <Button size="lg" onClick={() => setWard(wardDraft.trim())}>{t(language, "apply")}</Button>
        <span className="filter-note">{t(language, "reachabilityNote")}</span>
      </section>

      <section className="dispatch-stats-row" aria-label={t(language, "operationalChannels")}>
        <article className="dispatch-stat-card">
          <span className="dispatch-stat-icon stat-icon-amber"><Radio aria-hidden="true" /></span>
          <div><p>{t(language, "activeEvent")}</p><strong>{t(language, "dataUnavailable")}</strong><small>{t(language, "eventStatusUnavailable")}</small></div>
        </article>
        <article className="dispatch-stat-card">
          <span className="dispatch-stat-icon stat-icon-sage"><UsersRound aria-hidden="true" /></span>
          <div><p>{t(language, "helpers")}</p><strong>{helpers ? helpers.length : t(language, "dataUnavailable")}</strong><small>{helpers ? t(language, "helperStatus") : t(language, "unsupportedResponse")}</small></div>
        </article>
        <article className="dispatch-stat-card">
          <span className="dispatch-stat-icon stat-icon-blue"><MapPin aria-hidden="true" /></span>
          <div><p>{t(language, "mapTitle")}</p><strong>{mapPoints.length}</strong><small>{t(language, "mapEmpty")}</small></div>
        </article>
      </section>

      <section className="dispatch-main-grid">
        <article className="surface-card map-card">
          <div className="surface-card-heading">
            <div>
              <p className="eyebrow">{t(language, "mapTitle")}</p>
              <h2>{t(language, "geographicalView")}</h2>
            </div>
            <span className="map-card-symbol"><Map aria-hidden="true" /></span>
          </div>
          {peopleError ? <ErrorState message={formatApiError(peopleError, language)} retryLabel={t(language, "retryRequest")} onRetry={() => void mutatePeople()} /> : null}
          {helperError ? <ErrorState message={formatApiError(helperError, language)} retryLabel={t(language, "retryRequest")} onRetry={() => void mutateHelpers()} /> : null}
          {(peopleLoading && user.role === "coordinator") || helperLoading ? <LoadingState label={t(language, "loading")} /> : (
            <>
              {helperShapeGap || peopleShapeGap ? <ContractNotice language={language} message={t(language, "unsupportedResponse")} /> : null}
              {mapPoints.length > 0 ? <DispatchMap points={mapPoints} language={language} /> : !helperError && !peopleError && !helperShapeGap && !peopleShapeGap ? (
                <EmptyState title={t(language, "mapEmpty")} description={t(language, "healthVisibilityNote")} icon={<MapPin />} />
              ) : null}
            </>
          )}
          <div className="map-legend">
            <span><i className="legend-dot legend-person" />{t(language, "peopleLocations")}</span>
            <span><i className="legend-dot legend-helper" />{t(language, "helperLocations")}</span>
            <small>{t(language, "mapAttribution")}</small>
          </div>
        </article>

        <div className="dispatch-side-stack">
          <article className="surface-card queue-card">
            <div className="surface-card-heading">
              <div><p className="eyebrow">{t(language, "dispatch")}</p><h2>{t(language, "priorityQueue")}</h2></div>
              <span className="queue-card-icon"><Radio aria-hidden="true" /></span>
            </div>
            <UnknownEndpointPanel
              language={language}
              data={queueData}
              error={queueError}
              isLoading={queueLoading}
              message={t(language, "queueResponseGap")}
              onRetry={() => void mutateQueue()}
            />
          </article>
          <article className="surface-card event-status-card">
            <div className="surface-card-heading">
              <div><p className="eyebrow">{t(language, "events")}</p><h2>{t(language, "activeEvent")}</h2></div>
              <span className="event-status-mark"><Radio aria-hidden="true" /></span>
            </div>
            <UnknownEndpointPanel
              language={language}
              data={eventData}
              error={eventError}
              isLoading={eventLoading}
              message={t(language, "eventResponseGap")}
            />
          </article>
        </div>
      </section>

      <section className="dispatch-bottom-grid">
        <article className="surface-card">
          <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "dispatch")}</p><h2>{t(language, "reassignments")}</h2></div></div>
          <UnknownEndpointPanel language={language} data={reassignmentData} error={reassignmentError} isLoading={reassignmentLoading} message={t(language, "reassignmentResponseGap")} onRetry={() => void mutateReassignments()} />
        </article>
        <article className="surface-card">
          <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "operationalChannels")}</p><h2>{t(language, "sheltersCard")}</h2></div></div>
          <UnknownEndpointPanel language={language} data={shelterData} error={shelterError} isLoading={shelterLoading} message={t(language, "noShelterSchema")} onRetry={() => void mutateShelters()} />
        </article>
      </section>
      <p className="dispatch-disclaimer">{loadingAny ? t(language, "loading") : t(language, "noMetrics")}</p>
    </div>
  )
}
