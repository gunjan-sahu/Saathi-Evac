"use client"

import { useState, type FormEvent } from "react"
import useSWR from "swr"
import { Building2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContractNotice, ErrorState, InlineNotice, LoadingState, PanelHeading } from "@/components/relief/primitives"
import { UnknownEndpointPanel } from "@/components/relief/unknown-endpoint-panel"
import type { Language, ShelterCreatePayload, UserRole } from "@/lib/contracts"
import { apiRequest } from "@/lib/api"
import { coordinateIsValid, formatApiError } from "@/lib/format"
import { swrFetcher } from "@/lib/swr-fetcher"
import { t } from "@/lib/i18n"
import type { Notify } from "@/components/relief/types"

export function SheltersScreen({ language, role, notify }: { language: Language; role: UserRole; notify: Notify }) {
  const { data, error, isLoading, mutate } = useSWR<unknown>("/dispatch/shelters", swrFetcher, { revalidateOnFocus: false })
  const [name, setName] = useState("")
  const [lat, setLat] = useState("")
  const [lon, setLon] = useState("")
  const [capacity, setCapacity] = useState("")
  const [accessible, setAccessible] = useState(false)
  const [separateSanitation, setSeparateSanitation] = useState(false)
  const [formError, setFormError] = useState("")
  const [busy, setBusy] = useState(false)

  async function createShelter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const latitude = Number(lat)
    const longitude = Number(lon)
    const numericCapacity = Number(capacity)
    if (!name.trim() || !lat.trim() || !lon.trim() || !Number.isInteger(numericCapacity) || numericCapacity < 1) {
      setFormError(t(language, "formRequired"))
      return
    }
    if (!coordinateIsValid(latitude, -90, 90) || !coordinateIsValid(longitude, -180, 180)) {
      setFormError(t(language, "invalidCoordinates"))
      return
    }
    const payload: ShelterCreatePayload = {
      name: name.trim(),
      lat: latitude,
      lon: longitude,
      capacity: numericCapacity,
      accessible,
      separate_sanitation: separateSanitation,
    }
    setBusy(true)
    setFormError("")
    try {
      await apiRequest<unknown>("/dispatch/shelters", { method: "POST", body: payload, auth: true })
      notify(t(language, "shelterCreateSuccess"))
      setName("")
      setLat("")
      setLon("")
      setCapacity("")
      setAccessible(false)
      setSeparateSanitation(false)
      await mutate()
    } catch (cause) {
      setFormError(formatApiError(cause, language))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen-stack">
      <PanelHeading eyebrow={t(language, "operationalChannels")} title={t(language, "shelterDirectory")} description={t(language, "shelterDescription")} />
      {role === "coordinator" ? (
        <section className="surface-card form-card">
          <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "shelters")}</p><h2>{t(language, "shelterCreate")}</h2></div><span className="form-card-mark"><Building2 aria-hidden="true" /></span></div>
          <form className="form-grid" onSubmit={createShelter}>
            <label className="form-field field-span-2" htmlFor="shelter-name"><span>{t(language, "fullName")} <em>*</em></span><input id="shelter-name" className="form-control" value={name} onChange={(event) => setName(event.target.value)} required /></label>
            <label className="form-field" htmlFor="shelter-capacity"><span>{t(language, "capacity")} <em>*</em></span><input id="shelter-capacity" className="form-control" type="number" min="1" step="1" value={capacity} onChange={(event) => setCapacity(event.target.value)} required /></label>
            <label className="form-field" htmlFor="shelter-lat"><span>{t(language, "latitude")} <em>*</em></span><input id="shelter-lat" className="form-control" type="number" min="-90" max="90" step="any" value={lat} onChange={(event) => setLat(event.target.value)} required /></label>
            <label className="form-field" htmlFor="shelter-lon"><span>{t(language, "longitude")} <em>*</em></span><input id="shelter-lon" className="form-control" type="number" min="-180" max="180" step="any" value={lon} onChange={(event) => setLon(event.target.value)} required /></label>
            <label className="checkbox-row field-span-2"><input type="checkbox" checked={accessible} onChange={(event) => setAccessible(event.target.checked)} /><span>{t(language, "accessible")}</span></label>
            <label className="checkbox-row field-span-2"><input type="checkbox" checked={separateSanitation} onChange={(event) => setSeparateSanitation(event.target.checked)} /><span>{t(language, "separateSanitation")}</span></label>
            {formError ? <p className="form-error field-span-2" role="alert">{formError}</p> : null}
            <div className="form-actions field-span-2"><Button size="lg" type="submit" disabled={busy}>{busy ? t(language, "loading") : t(language, "create")}</Button></div>
          </form>
        </section>
      ) : null}

      {error ? <ErrorState message={formatApiError(error, language)} retryLabel={t(language, "retryRequest")} onRetry={() => void mutate()} /> : null}
      {isLoading ? <LoadingState label={t(language, "loading")} /> : null}
      {!isLoading && !error && data === undefined ? <ContractNotice language={language} message={t(language, "noShelterSchema")} /> : null}
      {!isLoading && !error && data !== undefined ? <UnknownEndpointPanel language={language} data={data} error={error} isLoading={isLoading} message={t(language, "noShelterSchema")} onRetry={() => void mutate()} /> : null}
      <InlineNotice tone="info"><MapPin aria-hidden="true" /><p>{t(language, "mapEmpty")}</p></InlineNotice>
    </div>
  )
}
