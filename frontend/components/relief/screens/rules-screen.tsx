"use client"

import useSWR from "swr"
import { BookOpen, Languages } from "lucide-react"
import { PanelHeading } from "@/components/relief/primitives"
import { UnknownEndpointPanel } from "@/components/relief/unknown-endpoint-panel"
import type { Language } from "@/lib/contracts"
import { t } from "@/lib/i18n"
import { swrFetcher } from "@/lib/swr-fetcher"

export function RulesScreen({ language }: { language: Language }) {
  const rules = useSWR<unknown>("/rules", swrFetcher, { revalidateOnFocus: false })
  const languages = useSWR<unknown>("/languages", swrFetcher, { revalidateOnFocus: false })

  return (
    <div className="screen-stack">
      <PanelHeading eyebrow={t(language, "publicContent")} title={t(language, "rulesLanguages")} description={t(language, "rulesDescription")} />
      <div className="public-data-grid">
        <section className="surface-card">
          <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "appDataSource")}</p><h2>{t(language, "rulesLanguages")}</h2></div><span className="form-card-mark"><BookOpen aria-hidden="true" /></span></div>
          <UnknownEndpointPanel language={language} data={rules.data} error={rules.error} isLoading={rules.isLoading} message={t(language, "rulesResponseGap")} onRetry={() => void rules.mutate()} />
        </section>
        <section className="surface-card">
          <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "language")}</p><h2>{t(language, "rulesLanguages")}</h2></div><span className="form-card-mark"><Languages aria-hidden="true" /></span></div>
          <UnknownEndpointPanel language={language} data={languages.data} error={languages.error} isLoading={languages.isLoading} message={t(language, "rulesResponseGap")} onRetry={() => void languages.mutate()} />
        </section>
      </div>
    </div>
  )
}
