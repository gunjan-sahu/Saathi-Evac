"use client"

import { useMemo, useState, type ChangeEvent } from "react"
import { ArrowLeft, ArrowRight, Check, MapPin, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InlineNotice, PanelHeading } from "@/components/relief/primitives"
import type { Language, PersonCreatePayload } from "@/lib/contracts"
import { apiRequest, ApiError } from "@/lib/api"
import { coordinateIsValid, createClientId, formatApiError } from "@/lib/format"
import { t } from "@/lib/i18n"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-fetcher"
import type { Notify } from "@/components/relief/types"
import type { useOfflineQueue } from "@/hooks/use-offline-queue"

type LanguageOption = { code: string; name: string; review_status?: string }

interface RegistrationForm {
  name: string
  age: string
  phone: string
  language: string
  ward: string
  lat: string
  lon: string
  gender: string
  prefers_women_team: boolean
  bedridden: boolean
  mobility_aid: boolean
  oxygen_dependent: boolean
  dialysis: boolean
  hearing_limit: boolean
  vision_limit: boolean
  infant_or_pregnancy: boolean
  lives_alone: boolean
  consent: boolean
  client_id: string | null
}

const emptyForm: RegistrationForm = {
  name: "",
  age: "",
  phone: "",
  language: "",
  ward: "",
  lat: "",
  lon: "",
  gender: "",
  prefers_women_team: false,
  bedridden: false,
  mobility_aid: false,
  oxygen_dependent: false,
  dialysis: false,
  hearing_limit: false,
  vision_limit: false,
  infant_or_pregnancy: false,
  lives_alone: false,
  consent: false,
  client_id: null,
}

const supportFields = [
  ["bedridden", "bedridden"],
  ["mobility_aid", "mobilityAid"],
  ["oxygen_dependent", "oxygenDependent"],
  ["dialysis", "dialysis"],
  ["hearing_limit", "hearingLimit"],
  ["vision_limit", "visionLimit"],
  ["infant_or_pregnancy", "infantPregnancy"],
  ["lives_alone", "livesAlone"],
] as const

const stepKeys = ["personalInformation", "contactLanguage", "location", "assistanceNeeds", "consentReview"] as const

export function PersonRegistrationScreen({
  language,
  queue,
  notify,
}: {
  language: Language
  queue: ReturnType<typeof useOfflineQueue>
  notify: Notify
}) {
  const [form, setForm] = useState<RegistrationForm>(emptyForm)
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [confirmedQueued, setConfirmedQueued] = useState(false)
  const [gpsError, setGpsError] = useState("")
  const stepLabels = useMemo(() => stepKeys.map((key) => t(language, key)), [language])
  const { data: languageList } = useSWR<LanguageOption[]>("/languages", (path: string) => swrFetcher<LanguageOption[]>(path))
  const languageOptions: LanguageOption[] = languageList && languageList.length > 0 ? languageList : [{ code: "en", name: "English" }, { code: "hi", name: "हिन्दी" }]
  const selectedLanguage = languageOptions.find((option) => option.code === form.language)

  function fillFromGps() {
    setGpsError("")
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsError(t(language, "gpsFailed"))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({ ...current, lat: position.coords.latitude.toFixed(5), lon: position.coords.longitude.toFixed(5) }))
      },
      () => setGpsError(t(language, "gpsFailed")),
    )
  }

  function setValue<Key extends keyof RegistrationForm>(key: Key, value: RegistrationForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function validateStep(index: number): string {
    if (index === 0) {
      const age = Number(form.age)
      if (!form.name.trim() || !form.age.trim() || !Number.isInteger(age) || age < 0) return t(language, "formRequired")
    }
    if (index === 1 && (!form.phone.trim() || !form.language.trim())) return t(language, "formRequired")
    if (index === 2) {
      const latitude = Number(form.lat)
      const longitude = Number(form.lon)
      if (!form.ward.trim()) return t(language, "formRequired")
      if (!form.lat.trim() || !form.lon.trim() || !coordinateIsValid(latitude, -90, 90) || !coordinateIsValid(longitude, -180, 180)) return t(language, "invalidCoordinates")
    }
    if (index === 4 && !form.consent) return t(language, "consentRequired")
    return ""
  }

  function handleNext() {
    const validation = validateStep(stepIndex)
    if (validation) {
      setError(validation)
      return
    }
    setError("")
    setStepIndex((current) => Math.min(stepKeys.length - 1, current + 1))
  }

  function handleCheckbox(event: ChangeEvent<HTMLInputElement>) {
    const key = event.currentTarget.name as keyof RegistrationForm
    if (key === "prefers_women_team" || key === "bedridden" || key === "mobility_aid" || key === "oxygen_dependent" || key === "dialysis" || key === "hearing_limit" || key === "vision_limit" || key === "infant_or_pregnancy" || key === "lives_alone" || key === "consent") {
      setValue(key, event.currentTarget.checked)
    }
  }

  async function submitRegistration() {
    const validation = validateStep(4)
    if (validation) {
      setError(validation)
      return
    }
    const clientId = form.client_id ?? createClientId()
    setValue("client_id", clientId)
    const payload: PersonCreatePayload = {
      name: form.name.trim(),
      age: Number(form.age),
      phone: form.phone.trim(),
      language: form.language.trim(),
      ward: form.ward.trim(),
      lat: Number(form.lat),
      lon: Number(form.lon),
      consent: true,
      ...(form.gender.trim() ? { gender: form.gender.trim() } : {}),
      prefers_women_team: form.prefers_women_team,
      bedridden: form.bedridden,
      mobility_aid: form.mobility_aid,
      oxygen_dependent: form.oxygen_dependent,
      dialysis: form.dialysis,
      hearing_limit: form.hearing_limit,
      vision_limit: form.vision_limit,
      infant_or_pregnancy: form.infant_or_pregnancy,
      lives_alone: form.lives_alone,
      client_id: clientId,
    }

    setBusy(true)
    setError("")
    setConfirmedQueued(false)
    try {
      if (queue.online === false) {
        const queuedId = queue.enqueue({ kind: "person", payload })
        if (!queuedId) {
          setError(t(language, "queueNotReady"))
          return
        }
        setConfirmedQueued(true)
        notify(t(language, "queuedNotConfirmed"), "info")
        setForm(emptyForm)
        setStepIndex(0)
        return
      }
      await apiRequest<unknown>("/people", { method: "POST", body: payload, auth: true })
      notify(t(language, "registrationSuccess"))
      setForm(emptyForm)
      setStepIndex(0)
    } catch (cause) {
      if (cause instanceof ApiError && cause.networkFailure) {
        const queuedId = queue.enqueue({ kind: "person", payload }, true)
        if (!queuedId) {
          setError(t(language, "queueUnavailable"))
          return
        }
        setConfirmedQueued(true)
        notify(t(language, "queuedNotConfirmed"), "info")
        setForm(emptyForm)
        setStepIndex(0)
      } else {
        setError(formatApiError(cause, language))
      }
    } finally {
      setBusy(false)
    }
  }

  function renderCurrentStep() {
    if (stepIndex === 0) {
      return (
        <div className="form-grid">
          <label className="form-field field-span-2" htmlFor="person-name"><span>{t(language, "fullName")} <em>*</em></span><input id="person-name" className="form-control" value={form.name} onChange={(event) => setValue("name", event.target.value)} autoComplete="name" required /></label>
          <label className="form-field" htmlFor="person-age"><span>{t(language, "age")} <em>*</em></span><input id="person-age" className="form-control" type="number" min="0" step="1" value={form.age} onChange={(event) => setValue("age", event.target.value)} required /></label>
          <label className="form-field" htmlFor="person-gender"><span>{t(language, "gender")} <small>{t(language, "optional")}</small></span><input id="person-gender" className="form-control" value={form.gender} onChange={(event) => setValue("gender", event.target.value)} aria-describedby="gender-help" /><small id="gender-help" className="field-help">{t(language, "genderHelp")}</small></label>
        </div>
      )
    }
    if (stepIndex === 1) {
      return (
        <div className="form-grid">
          <label className="form-field" htmlFor="person-phone"><span>{t(language, "phone")} <em>*</em></span><input id="person-phone" className="form-control" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setValue("phone", event.target.value)} required /></label>
          <label className="form-field" htmlFor="person-language"><span>{t(language, "preferredLanguage")} <em>*</em></span><select id="person-language" className="form-control" value={form.language} onChange={(event) => setValue("language", event.target.value)} required><option value="" disabled>{t(language, "selectLanguage")}</option>{languageOptions.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}</select>{selectedLanguage?.review_status?.toLowerCase().includes("pending") ? <small className="field-help">{t(language, "aiReview")}</small> : null}</label>
        </div>
      )
    }
    if (stepIndex === 2) {
      return (
        <div className="form-grid">
          <label className="form-field field-span-2" htmlFor="person-ward"><span>{t(language, "ward")} <em>*</em></span><input id="person-ward" className="form-control" value={form.ward} onChange={(event) => setValue("ward", event.target.value)} required /></label>
          <div className="coordinate-note field-span-2"><MapPin aria-hidden="true" /><span>{t(language, "location")} · {t(language, "manualCoordinatesNote")}</span></div>
          <label className="form-field" htmlFor="person-lat"><span>{t(language, "latitude")} <em>*</em></span><input id="person-lat" className="form-control" type="number" min="-90" max="90" step="any" value={form.lat} onChange={(event) => setValue("lat", event.target.value)} required /></label>
          <label className="form-field" htmlFor="person-lon"><span>{t(language, "longitude")} <em>*</em></span><input id="person-lon" className="form-control" type="number" min="-180" max="180" step="any" value={form.lon} onChange={(event) => setValue("lon", event.target.value)} required /></label>
          <div className="form-actions field-span-2"><Button type="button" variant="outline" onClick={fillFromGps}><MapPin aria-hidden="true" /> {t(language, "gpsUse")}</Button>{gpsError ? <p className="form-error" role="alert">{gpsError}</p> : null}</div>
        </div>
      )
    }
    if (stepIndex === 3) {
      return (
        <div className="checkbox-section">
          <label className="checkbox-row checkbox-row-featured"><input type="checkbox" name="prefers_women_team" checked={form.prefers_women_team} onChange={handleCheckbox} /><span><strong>{t(language, "womenLedPreference")}</strong><small>{t(language, "optional")}</small></span></label>
          <fieldset className="checkbox-fieldset">
            <legend>{t(language, "assistanceNeeds")}</legend>
            <div className="checkbox-grid">
              {supportFields.map(([field, label]) => (
                <label className="checkbox-row" key={field}>
                  <input type="checkbox" name={field} checked={form[field]} onChange={handleCheckbox} />
                  <span>{t(language, label)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )
    }
    return (
      <div className="review-panel">
        <div className="consent-card">
          <span className="consent-icon"><ShieldCheck aria-hidden="true" /></span>
          <div>
            <strong>{t(language, "consentReview")}</strong>
            <p>{t(language, "consentCopy")}</p>
          </div>
        </div>
        <label className="checkbox-row consent-checkbox">
          <input type="checkbox" name="consent" checked={form.consent} onChange={handleCheckbox} required />
          <span>{t(language, "consentCopy")} <em>*</em></span>
        </label>
        <div className="review-summary">
          <div><span>{t(language, "fullName")}</span><strong>{form.name || t(language, "notReported")}</strong></div>
          <div><span>{t(language, "ward")}</span><strong>{form.ward || t(language, "notReported")}</strong></div>
          <div><span>{t(language, "location")}</span><strong>{form.lat}, {form.lon}</strong></div>
          <div><span>{t(language, "assistanceNeeds")}</span><strong>{supportFields.filter(([key]) => form[key]).map(([, label]) => t(language, label)).join(", ") || t(language, "notReported")}</strong></div>
        </div>
          <p className="field-help">{t(language, "clientIdNote")} {t(language, "idempotencyNote")}</p>
      </div>
    )
  }

  return (
    <div className="screen-stack">
      <PanelHeading eyebrow={t(language, "people")} title={t(language, "registerTitle")} description={t(language, "registerDescription")} />
      {confirmedQueued ? <InlineNotice tone="warning">{t(language, "queuedNotConfirmed")}</InlineNotice> : null}
      <section className="registration-card">
        <div className="registration-progress-header">
          <div>
            <p className="eyebrow">{t(language, "step")} {stepIndex + 1} {t(language, "of")} {stepLabels.length}</p>
            <h2>{stepLabels[stepIndex]}</h2>
          </div>
          <span className="registration-step-number">0{stepIndex + 1}</span>
        </div>
        <div className="progress-track" role="progressbar" aria-label={t(language, "step")} aria-valuemin={1} aria-valuemax={stepLabels.length} aria-valuenow={stepIndex + 1}>
          <span style={{ width: `${((stepIndex + 1) / stepLabels.length) * 100}%` }} />
        </div>
        <div className="step-indicators" aria-label={stepLabels.join(", ")}>
          {stepLabels.map((label, index) => <span key={label} className={index <= stepIndex ? "step-indicator step-indicator-active" : "step-indicator"}><i />{label}</span>)}
        </div>
        <div className="registration-step-content">{renderCurrentStep()}</div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="registration-actions">
          <Button variant="outline" size="lg" disabled={stepIndex === 0 || busy} onClick={() => { setError(""); setStepIndex((current) => Math.max(0, current - 1)) }}>
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />{t(language, "back")}
          </Button>
          {stepIndex < stepLabels.length - 1 ? (
            <Button size="lg" onClick={handleNext}>{t(language, "saveAndContinue")}<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
          ) : (
            <Button size="lg" disabled={busy || !form.consent} onClick={() => void submitRegistration()}>
              {busy ? t(language, "loading") : t(language, "submit")}<Check data-icon="inline-end" aria-hidden="true" />
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}
