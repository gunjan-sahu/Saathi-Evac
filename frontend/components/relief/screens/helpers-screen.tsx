"use client"

import { useState } from "react"
import useSWR from "swr"
import { HandHeart, MapPin, ShieldAlert, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog, ContractNotice, EmptyState, ErrorState, InlineNotice, LoadingState, PanelHeading, StatusBadge } from "@/components/relief/primitives"
import type { AuthUser, HelperCreatePayload, HelperRecord, Language } from "@/lib/contracts"
import { isHelperRecord } from "@/lib/contracts"
import { apiRequest } from "@/lib/api"
import { coordinateIsValid, formatApiError } from "@/lib/format"
import { swrFetcher } from "@/lib/swr-fetcher"
import { t } from "@/lib/i18n"
import type { Notify } from "@/components/relief/types"

interface HelperFormState {
  name: string
  phone: string
  lat: string
  lon: string
  capacity: string
  skills: string
  women_led: boolean
}

const initialForm: HelperFormState = { name: "", phone: "", lat: "", lon: "", capacity: "", skills: "", women_led: false }

function helperList(data: unknown): HelperRecord[] | null {
  if (!Array.isArray(data)) return null
  return data.every(isHelperRecord) ? data : null
}

export function HelpersScreen({ user, language, notify, onProfileChanged }: { user: AuthUser; language: Language; notify: Notify; onProfileChanged: () => Promise<unknown> }) {
  const canReadDirectory = user.role === "coordinator" || user.role === "rescue"
  const [selfRegistrationConfirmed, setSelfRegistrationConfirmed] = useState(false)
  const canCreate = user.role === "coordinator" || user.role === "volunteer" && user.helper_id === null && !selfRegistrationConfirmed
  const { data, error, isLoading, mutate } = useSWR<unknown>(canReadDirectory ? "/helpers" : null, swrFetcher, { revalidateOnFocus: false })
  const helpers = helperList(data)
  const [form, setForm] = useState<HelperFormState>(initialForm)
  const [formError, setFormError] = useState("")
  const [sweepError, setSweepError] = useState("")
  const [actionError, setActionError] = useState("")
  const [busy, setBusy] = useState(false)
  const [sweepMinutes, setSweepMinutes] = useState("")
  const [selectedHelper, setSelectedHelper] = useState<HelperRecord | null>(null)

  function update<Key extends keyof HelperFormState>(key: Key, value: HelperFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function createHelper(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const lat = Number(form.lat)
    const lon = Number(form.lon)
    const capacity = Number(form.capacity)
    if (!form.name.trim() || !form.phone.trim() || !form.skills.trim() || !form.lat.trim() || !form.lon.trim() || !Number.isInteger(capacity) || capacity < 1) {
      setFormError(t(language, "formRequired"))
      return
    }
    if (!coordinateIsValid(lat, -90, 90) || !coordinateIsValid(lon, -180, 180)) {
      setFormError(t(language, "invalidCoordinates"))
      return
    }
    const payload: HelperCreatePayload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      lat,
      lon,
      capacity,
      skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean).join(","),
      women_led: form.women_led,
    }
    setBusy(true)
    setFormError("")
    try {
      await apiRequest<unknown>("/helpers", { method: "POST", body: payload, auth: true })
      notify(t(language, "helperCreateSuccess"))
      setForm(initialForm)
      if (user.role === "volunteer") {
        setSelfRegistrationConfirmed(true)
        await onProfileChanged()
      }
      await mutate()
    } catch (cause) {
      setFormError(formatApiError(cause, language))
    } finally {
      setBusy(false)
    }
  }

  async function markMissedCheckin() {
    if (!selectedHelper) return
    setBusy(true)
    setActionError("")
    try {
      await apiRequest<unknown>(`/helpers/${encodeURIComponent(String(selectedHelper.id))}/missed-checkin`, { method: "POST", auth: true })
      notify(t(language, "missedCheckinAccepted"))
      setSelectedHelper(null)
      await mutate()
    } catch (cause) {
      setActionError(formatApiError(cause, language))
    } finally {
      setBusy(false)
    }
  }

  async function restoreHelper(helper: HelperRecord) {
    setBusy(true)
    setActionError("")
    try {
      await apiRequest<unknown>(`/helpers/${encodeURIComponent(String(helper.id))}/heartbeat`, { method: "POST", auth: true })
      notify(t(language, "helperRestored"))
      await mutate()
    } catch (cause) {
      notify(formatApiError(cause, language), "danger")
    } finally {
      setBusy(false)
    }
  }

  async function runSweep(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const minutes = Number(sweepMinutes)
    if (!Number.isInteger(minutes) || minutes < 1) {
      setSweepError(t(language, "formRequired"))
      return
    }
    setBusy(true)
    setSweepError("")
    try {
      await apiRequest<unknown>(`/helpers/sweep?minutes=${encodeURIComponent(String(minutes))}`, { method: "POST", auth: true })
      notify(t(language, "sweepAccepted"))
      await mutate()
    } catch (cause) {
      setSweepError(formatApiError(cause, language))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen-stack">
      <PanelHeading eyebrow={t(language, "operationalChannels")} title={t(language, "helpers")} description={t(language, "helperDescription")} />

      {user.role === "volunteer" && user.helper_id !== null ? (
        <InlineNotice tone="info"><strong>{t(language, "helperProfile")}</strong><p>{t(language, "selfRegisterOnlyOnce")} · {t(language, "idLabel")} {String(user.helper_id)}</p></InlineNotice>
      ) : null}
      {user.role === "volunteer" && user.helper_id === null && selfRegistrationConfirmed ? <InlineNotice tone="success">{t(language, "helperRegistrationConfirmed")}</InlineNotice> : null}
      {user.role === "rescue" ? <InlineNotice tone="info">{t(language, "helperDescription")}</InlineNotice> : null}

      {canCreate ? (
        <section className="surface-card form-card">
          <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "helperRegistration")}</p><h2>{t(language, "helperProfile")}</h2></div><span className="form-card-mark"><HandHeart aria-hidden="true" /></span></div>
          <form className="form-grid" onSubmit={createHelper}>
            <label className="form-field" htmlFor="helper-name"><span>{t(language, "fullName")} <em>*</em></span><input id="helper-name" className="form-control" value={form.name} onChange={(event) => update("name", event.target.value)} required /></label>
            <label className="form-field" htmlFor="helper-phone"><span>{t(language, "phone")} <em>*</em></span><input id="helper-phone" className="form-control" type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} required /></label>
            <label className="form-field field-span-2" htmlFor="helper-skills"><span>{t(language, "skills")} <em>*</em></span><input id="helper-skills" className="form-control" value={form.skills} onChange={(event) => update("skills", event.target.value)} required /><small className="field-help">{t(language, "skillsHelp")}</small></label>
            <label className="form-field" htmlFor="helper-capacity"><span>{t(language, "capacity")} <em>*</em></span><input id="helper-capacity" className="form-control" type="number" min="1" step="1" value={form.capacity} onChange={(event) => update("capacity", event.target.value)} required /></label>
            <label className="form-field" htmlFor="helper-lat"><span>{t(language, "latitude")} <em>*</em></span><input id="helper-lat" className="form-control" type="number" min="-90" max="90" step="any" value={form.lat} onChange={(event) => update("lat", event.target.value)} required /></label>
            <label className="form-field" htmlFor="helper-lon"><span>{t(language, "longitude")} <em>*</em></span><input id="helper-lon" className="form-control" type="number" min="-180" max="180" step="any" value={form.lon} onChange={(event) => update("lon", event.target.value)} required /></label>
            <label className="checkbox-row field-span-2"><input type="checkbox" checked={form.women_led} onChange={(event) => update("women_led", event.target.checked)} /><span>{t(language, "womenLed")}</span></label>
            {formError ? <p className="form-error field-span-2" role="alert">{formError}</p> : null}
            <div className="form-actions field-span-2"><Button size="lg" type="submit" disabled={busy}>{busy ? t(language, "loading") : t(language, "create")}</Button></div>
          </form>
        </section>
      ) : null}

      {user.role === "coordinator" ? (
        <form className="sweep-card" onSubmit={runSweep}>
          <div className="sweep-card-copy"><span className="sweep-card-icon"><ShieldAlert aria-hidden="true" /></span><div><p className="eyebrow">{t(language, "helpers")}</p><h2>{t(language, "sweep")}</h2></div></div>
          <label className="form-field" htmlFor="sweep-minutes"><span>{t(language, "sweepMinutes")}</span><input id="sweep-minutes" className="form-control" type="number" min="1" step="1" value={sweepMinutes} onChange={(event) => setSweepMinutes(event.target.value)} required /></label>
          <Button type="submit" variant="outline" disabled={busy}>{t(language, "sweep")}</Button>
          {sweepError ? <p className="form-error field-span-2" role="alert">{sweepError}</p> : null}
        </form>
      ) : null}

      {user.role === "coordinator" || user.role === "rescue" ? (
        <section className="surface-card">
          <div className="surface-card-heading">
            <div><p className="eyebrow">{t(language, "appDataSource")}</p><h2>{t(language, "helperDirectory")}</h2></div>
            <span className="directory-count">{helpers ? helpers.length : "—"}</span>
          </div>
          {isLoading ? <LoadingState label={t(language, "loading")} /> : null}
          {error ? <ErrorState message={formatApiError(error, language)} retryLabel={t(language, "retryRequest")} onRetry={() => void mutate()} /> : null}
          {!isLoading && !error && !helpers ? <ContractNotice language={language} /> : null}
          {!isLoading && !error && helpers?.length === 0 ? <EmptyState title={t(language, "noHelpers")} icon={<Users />} /> : null}
          {helpers && helpers.length > 0 ? (
            <div className="helper-table-wrap">
              <table className="data-table">
                <thead><tr><th>{t(language, "fullName")}</th><th>{t(language, "taskStatus")}</th><th>{t(language, "skills")}</th><th>{t(language, "capacity")}</th><th>{t(language, "womenLed")}</th><th>{t(language, "location")}</th>{user.role === "coordinator" ? <th><span className="sr-only">{t(language, "missedCheckin")}</span></th> : null}</tr></thead>
                <tbody>{helpers.map((helper) => (
                  <tr key={helper.id}>
                    <td data-label={t(language, "fullName")}><strong>{helper.name}</strong><small>{t(language, "idLabel")} {String(helper.id)}</small></td>
                    <td data-label={t(language, "taskStatus")}><StatusBadge>{helper.status}</StatusBadge></td>
                    <td data-label={t(language, "skills")}>{helper.skills || t(language, "notReported")}</td>
                    <td data-label={t(language, "capacity")}>{String(helper.capacity)}</td>
                    <td data-label={t(language, "womenLed")}>{helper.women_led ? t(language, "yes") : t(language, "no")}</td>
                    <td data-label={t(language, "location")}><span className="coordinate-value"><MapPin aria-hidden="true" />{helper.lat}, {helper.lon}</span></td>
                    {user.role === "coordinator" ? <td data-label={t(language, "missedCheckin")}><div className="row-actions"><Button size="sm" variant="outline" onClick={() => { setActionError(""); setSelectedHelper(helper) }}>{t(language, "missedCheckin")}</Button>{helper.status === "unreachable" ? <Button size="sm" variant="outline" disabled={busy} onClick={() => void restoreHelper(helper)}>{t(language, "restoreHelper")}</Button> : null}</div></td> : null}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}

      <ConfirmDialog
        open={selectedHelper !== null}
        title={t(language, "missedCheckin")}
        description={t(language, "missedCheckinWarning")}
        confirmLabel={t(language, "confirm")}
        cancelLabel={t(language, "cancel")}
        busy={busy}
        errorMessage={actionError}
        destructive
        onCancel={() => { setSelectedHelper(null); setActionError("") }}
        onConfirm={() => void markMissedCheckin()}
      />
    </div>
  )
}
