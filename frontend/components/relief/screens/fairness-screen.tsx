"use client"

import useSWR from "swr"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts"
import { BarChart3, Info } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { ContractNotice, EmptyState, ErrorState, LoadingState, PanelHeading } from "@/components/relief/primitives"
import type { FairnessAuditResponse, Language } from "@/lib/contracts"
import { isFairnessAuditResponse } from "@/lib/contracts"
import { formatApiError } from "@/lib/format"
import { swrFetcher } from "@/lib/swr-fetcher"
import { t } from "@/lib/i18n"

const measures = [
  { key: "count", label: "count", format: (value: number, language: Language) => new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-US").format(value) },
  { key: "avg_priority_score", label: "avgPriority", format: (value: number, _language: Language) => String(value) },
  { key: "pct_with_helper", label: "pctHelper", format: (value: number, _language: Language) => `${String(value)}%` },
  { key: "pct_with_shelter", label: "pctShelter", format: (value: number, _language: Language) => `${String(value)}%` },
] as const

export function FairnessScreen({ language }: { language: Language }) {
  const { data, error, isLoading, mutate } = useSWR<unknown>("/dispatch/audit", swrFetcher, { revalidateOnFocus: false })
  const audit = isFairnessAuditResponse(data) ? data : null

  return (
    <div className="screen-stack">
      <PanelHeading eyebrow={t(language, "appDataSource")} title={t(language, "fairnessTitle")} description={t(language, "fairnessDescription")} />
      <div className="audit-note"><Info aria-hidden="true" /><p>{t(language, "relativeScale")}</p></div>
      {isLoading ? <LoadingState label={t(language, "loading")} /> : null}
      {error ? <ErrorState message={formatApiError(error, language)} retryLabel={t(language, "retryRequest")} onRetry={() => void mutate()} /> : null}
      {!isLoading && !error && !audit ? <ContractNotice language={language} /> : null}
      {audit && Object.keys(audit).length === 0 ? <EmptyState title={t(language, "noAuditData")} icon={<BarChart3 />} /> : null}
      {audit && Object.keys(audit).length > 0 ? (
        <div className="audit-measure-grid">
          {measures.map((measure) => {
            const rows = Object.entries(audit).map(([group, values]) => ({ group, value: values[measure.key] }))
            const chartConfig = {
              value: { label: t(language, measure.label), color: "var(--chart-1)" },
            } satisfies ChartConfig
            return (
              <section className="surface-card audit-measure-card" key={measure.key}>
                <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "fairnessTitle")}</p><h2>{t(language, measure.label)}</h2></div><span className="audit-measure-icon"><BarChart3 aria-hidden="true" /></span></div>
                <ChartContainer
                  config={chartConfig}
                  className="audit-chart"
                  style={{ height: `${Math.max(180, rows.length * 36)}px` }}
                  role="group"
                  aria-label={`${t(language, measure.label)} chart`}
                >
                  <BarChart accessibilityLayer data={rows} layout="vertical" margin={{ top: 8, right: 10, left: 4, bottom: 8 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 4" />
                    <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis dataKey="group" type="category" width={90} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => String(value)} />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={[0, 5, 5, 0]} />
                  </BarChart>
                </ChartContainer>
              </section>
            )
          })}
          <section className="surface-card audit-groups-card">
            <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "appDataSource")}</p><h2>{t(language, "fairnessTitle")}</h2></div></div>
            <div className="audit-table-wrap">
              <table className="data-table">
                <thead><tr><th>{t(language, "role")}</th><th>{t(language, "count")}</th><th>{t(language, "avgPriority")}</th><th>{t(language, "pctHelper")}</th><th>{t(language, "pctShelter")}</th></tr></thead>
                <tbody>{Object.entries(audit as FairnessAuditResponse).map(([group, values]) => (
                  <tr key={group}><td><strong>{group}</strong></td><td>{new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-US").format(values.count)}</td><td>{String(values.avg_priority_score)}</td><td>{String(values.pct_with_helper)}%</td><td>{String(values.pct_with_shelter)}%</td></tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
