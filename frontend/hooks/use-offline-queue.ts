"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { apiRequest, ApiError } from "@/lib/api"
import type { ConcernCreatePayload, Language, PersonCreatePayload } from "@/lib/contracts"
import { createClientId } from "@/lib/format"
import { t } from "@/lib/i18n"

const STORAGE_KEY = "sahaara.offline-actions.v1"
const MAX_RETRIES = 3

type QueueAction = {
  id: string
  kind: "person" | "concern"
  payload: PersonCreatePayload | ConcernCreatePayload
  createdAt: number
  retryCount: number
  nextAttemptAt: number
  state: "pending" | "syncing" | "failed"
}

type NewAction =
  | { kind: "person"; payload: PersonCreatePayload }
  | { kind: "concern"; payload: ConcernCreatePayload }

function storageKeyFor(owner: string): string {
  return `${STORAGE_KEY}.${encodeURIComponent(owner)}`
}

function readStoredActions(key: string): QueueAction[] {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is QueueAction => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        (item.kind === "person" || item.kind === "concern") &&
        typeof item.payload === "object" &&
        item.payload !== null &&
        typeof item.createdAt === "number" &&
        typeof item.retryCount === "number" &&
        typeof item.nextAttemptAt === "number" &&
        (item.state === "pending" || item.state === "syncing" || item.state === "failed")
      )
    }).map((item) => item.state === "syncing" ? { ...item, state: "pending" } : item)
  } catch {
    return []
  }
}

function persistActions(key: string, items: QueueAction[]): void {
  try {
    if (items.length === 0) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(items))
  } catch {
    // Storage may be disabled or full; the UI remains usable without persistence.
  }
}

export function useOfflineQueue(accessToken: string | null, language: Language, userId: string | number | null) {
  const owner = userId === null ? null : String(userId)
  const storageKey = owner ? storageKeyFor(owner) : null
  const [items, setItems] = useState<QueueAction[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [loadedOwner, setLoadedOwner] = useState<string | null>(null)
  const [online, setOnline] = useState<boolean | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState("")
  const syncingRef = useRef(false)

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine)
    updateOnline()
    window.addEventListener("online", updateOnline)
    window.addEventListener("offline", updateOnline)
    return () => {
      window.removeEventListener("online", updateOnline)
      window.removeEventListener("offline", updateOnline)
    }
  }, [])

  useEffect(() => {
    if (!owner || !storageKey) {
      setItems([])
      setLoadedOwner(null)
      setHydrated(true)
      return
    }
    setItems(readStoredActions(storageKey))
    setLoadedOwner(owner)
    setHydrated(true)
  }, [owner, storageKey])

  useEffect(() => {
    if (hydrated && owner && loadedOwner === owner && storageKey) {
      persistActions(storageKey, items)
    }
  }, [hydrated, items, loadedOwner, owner, storageKey])

  const enqueue = useCallback((action: NewAction, retryAfterNetworkFailure = false): string | null => {
    if (!owner || !storageKey || loadedOwner !== owner) return null
    const item: QueueAction = {
      ...action,
      id: createClientId(),
      createdAt: Date.now(),
      retryCount: 0,
      nextAttemptAt: retryAfterNetworkFailure ? Date.now() + 1500 : 0,
      state: "pending",
    }
    setItems((current) => [...current, item])
    return item.id
  }, [language, loadedOwner, owner, storageKey])

  const updateItem = useCallback((id: string, update: (item: QueueAction) => QueueAction | null) => {
    setItems((current) => current.flatMap((item) => {
      if (item.id !== id) return [item]
      const next = update(item)
      return next ? [next] : []
    }))
  }, [])

  const syncNow = useCallback(async (force = false) => {
    if (!hydrated || !accessToken || !owner || loadedOwner !== owner || online !== true || syncingRef.current) return
    const due = items.filter((item) => item.state === "pending" && (force || item.nextAttemptAt <= Date.now()))
    if (due.length === 0) {
      if (items.some((item) => item.state === "pending")) setSyncMessage(t(language, "pendingAction"))
      else if (items.some((item) => item.state === "failed")) setSyncMessage(t(language, "failedAction"))
      else setSyncMessage(t(language, "noPending"))
      return
    }

    const dueIds = new Set(due.map((item) => item.id))
    const pendingOutsideDue = items.some((item) => item.state === "pending" && !dueIds.has(item.id))
    let allDueSucceeded = true
    syncingRef.current = true
    setSyncing(true)
    setSyncMessage(t(language, "syncing"))

    try {
      for (const item of due) {
        updateItem(item.id, (current) => ({ ...current, state: "syncing" }))
        try {
          if (item.kind === "person") {
            await apiRequest<unknown>("/people", { method: "POST", body: item.payload, auth: true })
          } else {
            await apiRequest<unknown>("/concerns", { method: "POST", body: item.payload, auth: true })
          }
          updateItem(item.id, () => null)
        } catch (error) {
          allDueSucceeded = false
          if (error instanceof ApiError && error.networkFailure) {
            const retryCount = item.retryCount + 1
            updateItem(item.id, (current) => ({
              ...current,
              state: retryCount >= MAX_RETRIES ? "failed" : "pending",
              retryCount,
              nextAttemptAt: Date.now() + Math.min(30_000, 1500 * 2 ** retryCount),
            }))
            setSyncMessage(retryCount >= MAX_RETRIES ? t(language, "failedAction") : t(language, "pendingAction"))
            break
          }

          const status = error instanceof ApiError ? error.status : null
          updateItem(item.id, (current) => ({
            ...current,
            state: status === 401 ? "pending" : "failed",
            nextAttemptAt: status === 401 ? 0 : current.nextAttemptAt,
          }))
          setSyncMessage(error instanceof Error ? error.message : t(language, "backendError"))
          if (status === 401 || status === 429) break
        }
      }
      if (allDueSucceeded) setSyncMessage(pendingOutsideDue ? t(language, "pendingAction") : t(language, "synced"))
    } finally {
      syncingRef.current = false
      setSyncing(false)
    }
  }, [accessToken, hydrated, items, language, loadedOwner, online, owner, updateItem])

  useEffect(() => {
    if (!hydrated || !accessToken || !owner || loadedOwner !== owner || online !== true || syncing) return
    const nextDue = items
      .filter((item) => item.state === "pending")
      .reduce<number | null>((soonest, item) => soonest === null ? item.nextAttemptAt : Math.min(soonest, item.nextAttemptAt), null)
    if (nextDue === null) return
    const timer = window.setTimeout(() => {
      void syncNow()
    }, Math.max(0, nextDue - Date.now()))
    return () => window.clearTimeout(timer)
  }, [accessToken, hydrated, items, loadedOwner, online, owner, syncNow, syncing])

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const pendingCount = items.filter((item) => item.state === "pending" || item.state === "syncing").length
  const readyForUser = owner !== null && loadedOwner === owner

  return {
    items,
    online,
    hydrated,
    readyForUser,
    syncing,
    syncMessage,
    pendingCount,
    enqueue,
    remove,
    syncNow,
  }
}
