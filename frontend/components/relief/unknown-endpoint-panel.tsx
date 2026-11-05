"use client"

import type { Language } from "@/lib/contracts"
import { responseShape } from "@/lib/contracts"
import { t } from "@/lib/i18n"
import { ErrorState, LoadingState, ContractNotice, EmptyState } from "@/components/relief/primitives"
import { formatApiError } from "@/lib/format"

export function UnknownEndpointPanel({
  language,
  data,
  error,
  isLoading,
  message,
  onRetry,
}: {
  language: Language
  data: unknown
  error?: unknown
  isLoading: boolean
  message: string
  onRetry?: () => void
}) {
  if (isLoading) return <LoadingState label={t(language, "loading")} />
  if (error) return <ErrorState message={formatApiError(error, language)} retryLabel={t(language, "retryRequest")} onRetry={onRetry} />
  if (data === undefined) return <EmptyState title={t(language, "dataUnavailable")} description={t(language, "emptyData")} />

  const kind = responseShape(data)
  const kindKey = `shape${kind.charAt(0).toUpperCase()}${kind.slice(1)}`
  const shape = Array.isArray(data)
    ? `${t(language, kindKey)} · ${t(language, "responseItemCount").replace("{count}", String(data.length))}`
    : t(language, kindKey)
  if (Array.isArray(data) && data.length === 0) {
    return (
      <div className="unknown-response-stack">
        <EmptyState title={t(language, "noRecords")} />
        <ContractNotice language={language} message={message} shape={shape} />
      </div>
    )
  }
  return <ContractNotice language={language} message={message} shape={shape} />
}
