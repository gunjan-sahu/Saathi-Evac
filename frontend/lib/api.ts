import type { LoginResponse, UserRole } from "@/lib/contracts"

export const ACCESS_TOKEN_KEY = "sahaara.access-token"
export const API_URL_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_API_URL)
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "")

const unauthenticatedPaths = new Set(["/auth/login", "/auth/bootstrap", "/rules", "/languages"])

type ApiRequestOptions = {
  method?: "GET" | "POST"
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
}

export class ApiError extends Error {
  readonly status: number | null
  readonly detail: unknown
  readonly validationMessages: string[]
  readonly networkFailure: boolean

  constructor(args: {
    message: string
    status?: number | null
    detail?: unknown
    validationMessages?: string[]
    networkFailure?: boolean
  }) {
    super(args.message)
    this.name = "ApiError"
    this.status = args.status ?? null
    this.detail = args.detail
    this.validationMessages = args.validationMessages ?? []
    this.networkFailure = args.networkFailure ?? false
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function saveAccessToken(token: string): void {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}

function messageFromDetail(detail: unknown): { message?: string; validationMessages: string[] } {
  if (typeof detail === "string") return { message: detail, validationMessages: [] }
  if (Array.isArray(detail)) {
    const validationMessages = detail
      .map((item) => {
        if (typeof item === "object" && item !== null && "msg" in item) {
          return typeof item.msg === "string" ? item.msg : ""
        }
        return ""
      })
      .filter(Boolean)
    return { message: validationMessages.join(" · "), validationMessages }
  }
  if (typeof detail === "object" && detail !== null) {
    const candidate = "msg" in detail ? detail.msg : "message" in detail ? detail.message : undefined
    const message = typeof candidate === "string" ? candidate : undefined
    return { message, validationMessages: message ? [message] : [] }
  }
  return { validationMessages: [] }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const endpoint = path.split("?")[0]
  const requiresAuth = options.auth ?? !unauthenticatedPaths.has(endpoint)
  const headers = new Headers({ Accept: "application/json" })

  if (options.body !== undefined) headers.set("Content-Type", "application/json")

  if (requiresAuth) {
    const token = getAccessToken()
    if (!token) {
      throw new ApiError({ message: "Authentication is required.", status: 401 })
    }
    headers.set("Authorization", `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
      cache: "no-store",
    })
  } catch {
    throw new ApiError({
      message: "The network request could not reach the service.",
      networkFailure: true,
    })
  }

  let raw: string
  try {
    raw = await response.text()
  } catch {
    throw new ApiError({ message: "The API response was interrupted.", networkFailure: true })
  }
  let payload: unknown
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown
    } catch {
      payload = raw
    }
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? payload.detail
        : payload
    const parsed = messageFromDetail(detail)
    const message =
      response.status === 429
        ? "This account is temporarily locked for five minutes."
        : parsed.message || `Request failed with status ${response.status}.`

    if (response.status === 401 && requiresAuth && typeof window !== "undefined") {
      clearAccessToken()
      window.dispatchEvent(new CustomEvent("sahaara:unauthorized"))
    }

    throw new ApiError({
      message,
      status: response.status,
      detail,
      validationMessages: parsed.validationMessages,
    })
  }

  return payload as T
}

export function isUserRole(value: unknown): value is UserRole {
  return value === "volunteer" || value === "coordinator" || value === "rescue"
}

export function isLoginResponse(value: unknown): value is LoginResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "access_token" in value &&
    "role" in value &&
    typeof value.access_token === "string" &&
    isUserRole(value.role)
  )
}
