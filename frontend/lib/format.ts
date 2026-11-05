import type { Language } from "@/lib/contracts"
import { ApiError } from "@/lib/api"
import { t } from "@/lib/i18n"

export function formatApiError(error: unknown, language: Language): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return t(language, "accountLocked")
    if (error.status === 0 || error.networkFailure) return t(language, "backendUnreachable")
    return error.message || t(language, "submitFailed")
  }
  return error instanceof Error ? error.message : t(language, "submitFailed")
}

export function displayValue(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (typeof value === "boolean") return value ? "true" : "false"
  return fallback
}

export function coordinateIsValid(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
}

export function createClientId(): string {
  const cryptoApi = globalThis.crypto
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID()
  const bytes = new Uint8Array(16)
  if (typeof cryptoApi?.getRandomValues === "function") cryptoApi.getRandomValues(bytes)
  else bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256) })
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
