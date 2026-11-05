export type UserRole = "volunteer" | "coordinator" | "rescue"
export type Language = "en" | "hi"

export interface AuthUser {
  id: string | number
  username: string
  role: UserRole
  full_name: string
  helper_id: string | number | null
}

export interface LoginResponse {
  access_token: string
  role: UserRole
}

export function isAuthUser(value: unknown): value is AuthUser {
  if (!isRecord(value)) return false
  const validRole = value.role === "volunteer" || value.role === "coordinator" || value.role === "rescue"
  const validId = (typeof value.id === "string" && value.id.trim().length > 0) || (typeof value.id === "number" && Number.isFinite(value.id))
  const validHelperId = value.helper_id === null || (typeof value.helper_id === "string" && value.helper_id.trim().length > 0) || (typeof value.helper_id === "number" && Number.isFinite(value.helper_id))
  return validId && typeof value.username === "string" && value.username.trim().length > 0 && validRole && typeof value.full_name === "string" && value.full_name.trim().length > 0 && validHelperId
}

export interface PersonRecord {
  id: string | number
  name: string
  ward: string
  helpers: string[]
  shelter: unknown
  safe_confirmed: boolean | null
  needs_help: boolean | null
  health_visible: boolean
  priority_score?: number | null
  reasons?: string[]
  lat?: number | null
  lon?: number | null
}

export interface PersonCreatePayload {
  name: string
  age: number
  phone: string
  language: string
  ward: string
  lat: number
  lon: number
  consent: true
  gender?: string
  prefers_women_team: boolean
  bedridden: boolean
  mobility_aid: boolean
  oxygen_dependent: boolean
  dialysis: boolean
  hearing_limit: boolean
  vision_limit: boolean
  infant_or_pregnancy: boolean
  lives_alone: boolean
  client_id: string
}

export interface HelperRecord {
  id: string | number
  name: string
  status: string
  skills: string
  capacity: number
  lat: number
  lon: number
  women_led: boolean
}

export interface HelperCreatePayload {
  name: string
  phone: string
  lat: number
  lon: number
  capacity: number
  skills: string
  women_led: boolean
}

export interface AssignmentRecord {
  assignment_id: string | number
  status: string
  person: unknown
}

export interface ConcernCreatePayload {
  ward: string
  message: string
  person_id?: string
  anonymous: boolean
}

export interface FairnessAuditMetric {
  count: number
  avg_priority_score: number
  pct_with_helper: number
  pct_with_shelter: number
}

export type FairnessAuditResponse = Record<string, FairnessAuditMetric>

export interface UserCreatePayload {
  username: string
  password: string
  full_name: string
  role: UserRole
  helper_id?: string | number
}

export interface ShelterCreatePayload {
  name: string
  lat: number
  lon: number
  capacity: number
  accessible: boolean
  separate_sanitation: boolean
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isPersonRecord(value: unknown): value is PersonRecord {
  if (!isRecord(value)) return false
  return (
    ((typeof value.id === "string" && value.id.trim().length > 0) || (typeof value.id === "number" && Number.isFinite(value.id))) &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.ward === "string" &&
    "shelter" in value &&
    Array.isArray(value.helpers) &&
    value.helpers.every((helper) => typeof helper === "string") &&
    (typeof value.safe_confirmed === "boolean" || value.safe_confirmed === null) &&
    (typeof value.needs_help === "boolean" || value.needs_help === null) &&
    typeof value.health_visible === "boolean" &&
    (value.priority_score === undefined || value.priority_score === null || (typeof value.priority_score === "number" && Number.isFinite(value.priority_score))) &&
    (value.reasons === undefined || (Array.isArray(value.reasons) && value.reasons.every((reason) => typeof reason === "string"))) &&
    (value.lat === undefined || value.lat === null || (typeof value.lat === "number" && Number.isFinite(value.lat))) &&
    (value.lon === undefined || value.lon === null || (typeof value.lon === "number" && Number.isFinite(value.lon)))
  )
}

export function isHelperRecord(value: unknown): value is HelperRecord {
  if (!isRecord(value)) return false
  return (
    ((typeof value.id === "string" && value.id.trim().length > 0) || (typeof value.id === "number" && Number.isFinite(value.id))) &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.status === "string" &&
    typeof value.skills === "string" &&
    typeof value.capacity === "number" && Number.isFinite(value.capacity) &&
    typeof value.lat === "number" && Number.isFinite(value.lat) &&
    typeof value.lon === "number" && Number.isFinite(value.lon) &&
    typeof value.women_led === "boolean"
  )
}

export function isAssignmentRecord(value: unknown): value is AssignmentRecord {
  if (!isRecord(value)) return false
  return (
    ((typeof value.assignment_id === "string" && value.assignment_id.trim().length > 0) || (typeof value.assignment_id === "number" && Number.isFinite(value.assignment_id))) &&
    typeof value.status === "string" &&
    "person" in value
  )
}

export function isFairnessAuditResponse(value: unknown): value is FairnessAuditResponse {
  if (!isRecord(value)) return false
  return Object.values(value).every((entry) => {
    if (!isRecord(entry)) return false
    return (
      typeof entry.count === "number" && Number.isFinite(entry.count) &&
      typeof entry.avg_priority_score === "number" && Number.isFinite(entry.avg_priority_score) &&
      typeof entry.pct_with_helper === "number" && Number.isFinite(entry.pct_with_helper) &&
      typeof entry.pct_with_shelter === "number" && Number.isFinite(entry.pct_with_shelter)
    )
  })
}

export function responseShape(value: unknown): "array" | "object" | "string" | "number" | "boolean" | "empty" {
  if (value === null || value === undefined) return "empty"
  if (Array.isArray(value)) return "array"
  if (isRecord(value)) return "object"
  if (typeof value === "string") return "string"
  if (typeof value === "number") return "number"
  if (typeof value === "boolean") return "boolean"
  return "empty"
}
