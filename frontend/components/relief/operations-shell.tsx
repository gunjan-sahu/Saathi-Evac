"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  Activity,
  BookOpen,
  ClipboardList,
  FileSearch,
  HandHeart,
  House,
  Languages,
  LifeBuoy,
  Map,
  MapPin,
  Radio,
  ShieldAlert,
  Users,
  UserRoundCog,
  UserRoundPlus,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  ChevronRight,
  Ellipsis,
} from "lucide-react"
import type { Language, UserRole } from "@/lib/contracts"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/relief/primitives"
import type { useOfflineQueue } from "@/hooks/use-offline-queue"

export type PageId =
  | "overview"
  | "dispatch"
  | "people"
  | "register"
  | "tasks"
  | "helpers"
  | "shelters"
  | "events"
  | "concerns"
  | "fairness"
  | "access-audit"
  | "users"
  | "rules"

const navItems: {
  id: PageId
  label: string
  icon: typeof Activity
  roles: UserRole[]
  group: "workspace" | "coordination" | "review"
}[] = [
  { id: "overview", label: "overview", icon: Activity, roles: ["volunteer", "coordinator", "rescue"], group: "workspace" },
  { id: "dispatch", label: "dispatch", icon: Map, roles: ["coordinator", "rescue"], group: "workspace" },
  { id: "people", label: "people", icon: Users, roles: ["volunteer", "coordinator"], group: "workspace" },
  { id: "register", label: "registerPerson", icon: UserRoundPlus, roles: ["volunteer", "coordinator"], group: "workspace" },
  { id: "tasks", label: "myTasks", icon: ClipboardList, roles: ["volunteer"], group: "workspace" },
  { id: "helpers", label: "helpers", icon: HandHeart, roles: ["coordinator", "rescue", "volunteer"], group: "coordination" },
  { id: "shelters", label: "shelters", icon: House, roles: ["coordinator", "rescue", "volunteer"], group: "coordination" },
  { id: "events", label: "events", icon: Radio, roles: ["coordinator", "rescue"], group: "coordination" },
  { id: "concerns", label: "concerns", icon: LifeBuoy, roles: ["volunteer", "coordinator"], group: "coordination" },
  { id: "fairness", label: "fairness", icon: ShieldAlert, roles: ["coordinator"], group: "review" },
  { id: "access-audit", label: "accessAudit", icon: FileSearch, roles: ["coordinator"], group: "review" },
  { id: "users", label: "userManagement", icon: UserRoundCog, roles: ["coordinator"], group: "review" },
  { id: "rules", label: "rulesLanguages", icon: BookOpen, roles: ["volunteer", "coordinator", "rescue"], group: "review" },
]

const groupTitles = {
  workspace: "operationalOverview",
  coordination: "operationalChannels",
  review: "publicContent",
} as const

const mobileCoreByRole: Record<UserRole, PageId[]> = {
  volunteer: ["overview", "register", "tasks"],
  coordinator: ["overview", "dispatch", "people"],
  rescue: ["overview", "dispatch", "helpers"],
}

export type QueueState = ReturnType<typeof useOfflineQueue>

export function OperationsShell({
  user,
  language,
  page,
  queue,
  children,
  onPageChange,
  onLanguageChange,
  onSignOut,
}: {
  user: { full_name: string; username: string; role: UserRole }
  language: Language
  page: PageId
  queue: QueueState
  children: ReactNode
  onPageChange: (page: PageId) => void
  onLanguageChange: (language: Language) => void
  onSignOut: () => void
}) {
  const [queueOpen, setQueueOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const moreDialogRef = useRef<HTMLDialogElement>(null)
  const visible = navItems.filter((item) => item.roles.includes(user.role))
  const roleLabel = t(language, user.role === "volunteer" ? "roleVolunteer" : user.role === "coordinator" ? "roleCoordinator" : "roleRescue")
  const mobileItems = visible.filter((item) => mobileCoreByRole[user.role].includes(item.id))
  const mobileMoreItems = visible.filter((item) => !mobileCoreByRole[user.role].includes(item.id))
  const selectedItem = navItems.find((item) => item.id === page && item.roles.includes(user.role)) ?? navItems[0]
  const OnlineIcon = queue.online === false ? WifiOff : Wifi

  useEffect(() => {
    const dialog = moreDialogRef.current
    if (!dialog) return
    if (moreOpen && !dialog.open) dialog.showModal()
    if (!moreOpen && dialog.open) dialog.close()
  }, [moreOpen])

  function renderNavigation(group: "workspace" | "coordination" | "review") {
    const items = visible.filter((item) => item.group === group)
    if (!items.length) return null
    return (
      <div className="nav-group" key={group}>
        <p className="nav-group-label">{t(language, groupTitles[group])}</p>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              className={`nav-item ${page === item.id ? "nav-item-active" : ""}`}
              key={item.id}
              type="button"
              aria-current={page === item.id ? "page" : undefined}
              onClick={() => onPageChange(item.id)}
            >
              <Icon aria-hidden="true" />
              <span>{t(language, item.label)}</span>
              {page === item.id ? <ChevronRight className="nav-current-mark" aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="app-frame" lang={language}>
      <aside className="app-sidebar" aria-label={t(language, "appName")}>
        <a className="brand-lockup sidebar-brand" href="/" aria-label={t(language, "appName")}>
          <span className="brand-symbol brand-symbol-logo"><img src="/logo.png" alt="" /></span>
          <span className="brand-text-wrap">
            <span className="brand-wordmark">{t(language, "appName")}</span>
            <span className="brand-caption">{t(language, "productLabel")}</span>
          </span>
        </a>

        <div className="sidebar-role">
          <span className="role-dot" aria-hidden="true" />
          <span>{roleLabel}</span>
          <span className="role-verified">{user.username}</span>
        </div>

        <nav className="primary-nav" aria-label={t(language, "operationalChannels")}>
          {renderNavigation("workspace")}
          {renderNavigation("coordination")}
          {renderNavigation("review")}
        </nav>

        <div className="sidebar-bottom">
          <div className="network-status" aria-live="polite">
            <span className={`network-mark ${queue.online === false ? "network-mark-offline" : ""}`}><OnlineIcon aria-hidden="true" /></span>
            <div>
              <strong>{queue.online === false ? t(language, "offlineSignal") : queue.online === true ? t(language, "onlineSignal") : t(language, "apiBase")}</strong>
              <small>{t(language, "reachabilityNote")}</small>
            </div>
          </div>
          <button className="signout-button" type="button" onClick={onSignOut}>
            <LogOut aria-hidden="true" />
            <span>{t(language, "signOut")}</span>
          </button>
        </div>
      </aside>

      <div className="app-main-column">
        <header className="app-topbar">
          <div className="topbar-title-group">
            <span className="topbar-mark"><img src="/logo.png" alt="" /></span>
            <div>
              <p className="eyebrow">{t(language, "appName")} / {roleLabel}</p>
              <h1>{t(language, selectedItem.label)}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="language-toggle language-toggle-light" role="group" aria-label={t(language, "language")}>
              <button type="button" onClick={() => onLanguageChange("en")} aria-pressed={language === "en"}>{t(language, "english")}</button>
              <button type="button" onClick={() => onLanguageChange("hi")} aria-pressed={language === "hi"}>{t(language, "hindi")}</button>
            </div>
            <div className="queue-anchor">
              <Button
                variant={queue.items.length > 0 ? "secondary" : "outline"}
                size="sm"
                onClick={() => setQueueOpen((current) => !current)}
                aria-expanded={queueOpen}
                aria-controls="offline-queue-panel"
              >
                <span className={`queue-indicator ${queue.items.length > 0 ? "queue-indicator-pending" : ""}`} aria-hidden="true" />
                {t(language, "pendingActions")}
                {queue.items.length > 0 ? <span className="queue-count">{queue.items.length}</span> : null}
              </Button>
              {queueOpen ? (
                <section className="queue-panel" id="offline-queue-panel" aria-label={t(language, "pendingActions")}>
                  <div className="queue-panel-head">
                    <div>
                      <p className="eyebrow">{t(language, "appName")}</p>
                      <h2>{t(language, "pendingActions")}</h2>
                    </div>
                    <button className="icon-button" type="button" aria-label={t(language, "close")} onClick={() => setQueueOpen(false)}><X aria-hidden="true" /></button>
                  </div>
                  <p className="queue-description">{t(language, "queueDescription")}</p>
                  <div className="queue-list">
                    {queue.items.length === 0 ? <p className="queue-empty">{t(language, "noPending")}</p> : queue.items.map((item) => (
                      <div className="queue-item" key={item.id}>
                        <span className={`queue-item-mark queue-state-${item.state}`} aria-hidden="true" />
                        <div className="queue-item-copy">
                          <strong>{t(language, item.kind === "person" ? "registerPerson" : "concernsTitle")}</strong>
                          <span>{t(language, item.state === "syncing" ? "syncing" : item.state === "failed" ? "failed" : "pending")}</span>
                        </div>
                        <button className="queue-remove" type="button" aria-label={`${t(language, "remove")}: ${t(language, item.kind === "person" ? "registerPerson" : "concernsTitle")}`} onClick={() => setRemoveId(item.id)}>{t(language, "remove")}</button>
                      </div>
                    ))}
                  </div>
                  <p className="queue-privacy-note">{t(language, "localStorageNotice")}</p>
                  <p className="queue-privacy-note">{t(language, "queueRetryCaveat")}</p>
                  {queue.syncMessage ? <p className="queue-sync-message" role="status">{queue.syncMessage}</p> : null}
                  <Button className="queue-sync-button" size="lg" onClick={() => void queue.syncNow(true)} disabled={queue.syncing || queue.pendingCount === 0 || queue.online !== true}>
                    <RefreshCw className={queue.syncing ? "spin-icon" : ""} data-icon="inline-start" aria-hidden="true" />
                    {queue.syncing ? t(language, "syncing") : t(language, "syncNow")}
                  </Button>
                </section>
              ) : null}
            </div>
            <button className="user-chip" type="button" onClick={onSignOut} aria-label={`${t(language, "signOut")}: ${user.full_name}`}>
              <span className="user-avatar" aria-hidden="true">{user.full_name.trim().slice(0, 1).toLocaleUpperCase()}</span>
              <span className="user-chip-name">{user.full_name}</span>
            </button>
          </div>
        </header>

        <main className="app-content" id="main-content" tabIndex={-1}>
          {children}
        </main>

        <footer className="app-footer">
          <span><Languages aria-hidden="true" /> {t(language, "mission")}</span>
          <span>{t(language, "reachabilityNote")}</span>
        </footer>
      </div>

      <nav className="mobile-nav" aria-label={t(language, "mobileNavigation")}>
        {mobileItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-item ${page === item.id ? "mobile-nav-active" : ""}`}
              aria-current={page === item.id ? "page" : undefined}
              onClick={() => onPageChange(item.id)}
            >
              <Icon aria-hidden="true" />
              <span>{t(language, item.label)}</span>
            </button>
          )
        })}
        {mobileMoreItems.length > 0 ? (
          <button className={`mobile-nav-item ${mobileMoreItems.some((item) => item.id === page) ? "mobile-nav-active" : ""}`} type="button" aria-haspopup="dialog" aria-expanded={moreOpen} onClick={() => setMoreOpen(true)}>
            <Ellipsis aria-hidden="true" />
            <span>{t(language, "more")}</span>
          </button>
        ) : null}
        <button className="mobile-nav-item mobile-nav-sync" type="button" onClick={() => { setQueueOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }) }}>
          <RefreshCw aria-hidden="true" />
          <span>{t(language, "syncNow")}</span>
          {queue.items.length > 0 ? <span className="mobile-nav-count">{queue.items.length}</span> : null}
        </button>
      </nav>

      <dialog
        ref={moreDialogRef}
        className="mobile-more-dialog"
        aria-labelledby="mobile-more-title"
        onCancel={(event) => { event.preventDefault(); setMoreOpen(false) }}
      >
        <div className="mobile-more-heading">
          <h2 id="mobile-more-title">{t(language, "more")}</h2>
          <button className="icon-button" type="button" aria-label={t(language, "close")} onClick={() => setMoreOpen(false)}>×</button>
        </div>
        <nav className="mobile-more-list" aria-label={t(language, "mobileNavigation")}>
          {mobileMoreItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                className={`mobile-more-item ${page === item.id ? "mobile-more-item-active" : ""}`}
                aria-current={page === item.id ? "page" : undefined}
                onClick={() => { onPageChange(item.id); setMoreOpen(false) }}
              >
                <Icon aria-hidden="true" />
                <span>{t(language, item.label)}</span>
              </button>
            )
          })}
        </nav>
      </dialog>

      <ConfirmDialog
        open={removeId !== null}
        title={t(language, "remove")}
        description={t(language, "queuedNotConfirmed")}
        confirmLabel={t(language, "remove")}
        cancelLabel={t(language, "cancel")}
        destructive
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) queue.remove(removeId)
          setRemoveId(null)
        }}
      />
    </div>
  )
}
