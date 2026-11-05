"use client"

import { useState, type FormEvent } from "react"
import useSWR from "swr"
import { FileSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PanelHeading } from "@/components/relief/primitives"
import { UnknownEndpointPanel } from "@/components/relief/unknown-endpoint-panel"
import type { Language } from "@/lib/contracts"
import { t } from "@/lib/i18n"
import { swrFetcher } from "@/lib/swr-fetcher"

export function AccessAuditScreen({ language }: { language: Language }) {
  const [limitDraft, setLimitDraft] = useState("")
  const [appliedLimit, setAppliedLimit] = useState("")
  const { data, error, isLoading, mutate } = useSWR<unknown>(appliedLimit ? `/audit/access?limit=${encodeURIComponent(appliedLimit)}` : null, swrFetcher, { revalidateOnFocus: false })

  function loadAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = Number(limitDraft)
    if (Number.isInteger(parsed) && parsed > 0) setAppliedLimit(String(parsed))
  }

  return (
    <div className="screen-stack">
      <PanelHeading eyebrow={t(language, "appDataSource")} title={t(language, "auditTitle")} description={t(language, "auditDescription")} />
      <section className="surface-card audit-filter-card">
        <div className="audit-filter-copy"><span className="audit-measure-icon"><FileSearch aria-hidden="true" /></span><div><h2>{t(language, "auditTitle")}</h2><p>{t(language, "auditDescription")}</p></div></div>
        <form className="audit-limit-form" onSubmit={loadAudit}>
          <label className="form-field" htmlFor="audit-limit"><span>{t(language, "limit")}</span><input id="audit-limit" className="form-control" type="number" min="1" step="1" value={limitDraft} onChange={(event) => setLimitDraft(event.target.value)} required /></label>
          <Button type="submit" size="lg">{t(language, "loadAudit")}</Button>
        </form>
      </section>
      {appliedLimit ? <section className="surface-card"><div className="surface-card-heading"><div><p className="eyebrow">{t(language, "appDataSource")}</p><h2>{t(language, "auditTitle")}</h2></div></div><UnknownEndpointPanel language={language} data={data} error={error} isLoading={isLoading} message={t(language, "auditDescription")} onRetry={() => void mutate()} /></section> : null}
    </div>
  )
}
