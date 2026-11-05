"use client"

import { ArrowUpRight, ClipboardList, Compass, LifeBuoy, Map, ShieldCheck, UsersRound } from "lucide-react"
import type { AuthUser, Language } from "@/lib/contracts"
import { t } from "@/lib/i18n"
import type { PageId } from "@/components/relief/operations-shell"

export function OverviewScreen({
  user,
  language,
  onNavigate,
}: {
  user: AuthUser
  language: Language
  onNavigate: (page: PageId) => void
}) {
  const coordinator = user.role === "coordinator"
  const volunteer = user.role === "volunteer"
  const quickActions: { id: PageId; label: string; icon: typeof Map; enabled: boolean }[] = volunteer
    ? [
        { id: "register", label: "goToRegister", icon: LifeBuoy, enabled: true },
        { id: "people", label: "people", icon: UsersRound, enabled: true },
        { id: "tasks", label: "viewTasks", icon: ClipboardList, enabled: true },
      ]
    : coordinator
      ? [
          { id: "register", label: "goToRegister", icon: LifeBuoy, enabled: true },
          { id: "dispatch", label: "inspectDispatch", icon: Map, enabled: true },
          { id: "events", label: "events", icon: Compass, enabled: true },
        ]
      : [
          { id: "dispatch", label: "inspectDispatch", icon: Map, enabled: true },
          { id: "events", label: "events", icon: Compass, enabled: true },
          { id: "helpers", label: "helpers", icon: LifeBuoy, enabled: true },
        ]

  return (
    <div className="screen-stack">
      <section className="welcome-card">
        <div className="welcome-copy">
          <span className="welcome-mark"><ShieldCheck aria-hidden="true" /></span>
          <p className="eyebrow">{t(language, coordinator || user.role === "rescue" ? "operationalOverview" : "volunteerOverview")}</p>
          <h2>{t(language, "welcome")}, {user.full_name.split(" ")[0]}.</h2>
          <p>{t(language, "overviewDescription")}</p>
        </div>
        <div className="welcome-topography" aria-hidden="true">
          <span className="topography-ring ring-a" />
          <span className="topography-ring ring-b" />
          <span className="topography-ring ring-c" />
          <span className="topography-point point-a" />
          <span className="topography-point point-b" />
        </div>
      </section>

      <section className="service-strip" aria-label={t(language, "liveData")}>
        <div className="service-strip-icon"><Compass aria-hidden="true" /></div>
        <div className="service-strip-copy">
          <strong>{t(language, "liveData")}</strong>
          <span>{t(language, "noLiveSummary")}</span>
        </div>
        <span className="service-strip-status">{t(language, "appDataSource")}</span>
      </section>

      <div className="section-heading-row">
        <div>
          <p className="eyebrow">{t(language, "operationalOverview")}</p>
          <h2>{t(language, "quickActions")}</h2>
        </div>
      </div>
      <section className="quick-action-grid" aria-label={t(language, "quickActions")}>
        {quickActions.map(({ id, label, icon: Icon, enabled }) => (
          <button key={id} className="quick-action-card" type="button" disabled={!enabled} onClick={() => onNavigate(id)}>
            <span className="quick-action-icon"><Icon aria-hidden="true" /></span>
            <span className="quick-action-title">{t(language, label)}</span>
            <ArrowUpRight className="quick-action-arrow" aria-hidden="true" />
          </button>
        ))}
      </section>

      <section className="channel-grid">
        <article className="channel-card channel-card-wide">
          <div className="channel-card-head">
            <span className="channel-card-icon"><Map aria-hidden="true" /></span>
            <span className="channel-tag">{t(language, "dispatch")}</span>
          </div>
          <h3>{t(language, "dispatchTitle")}</h3>
          <p>{t(language, "dispatchDescription")}</p>
          {(coordinator || user.role === "rescue") ? (
            <button className="inline-link" type="button" onClick={() => onNavigate("dispatch")}>
              {t(language, "inspectDispatch")} <ArrowUpRight aria-hidden="true" />
            </button>
          ) : (
            <p className="channel-footnote">{t(language, "healthVisibilityNote")}</p>
          )}
        </article>
        <article className="channel-card">
          <div className="channel-card-head">
            <span className="channel-card-icon channel-card-icon-sage"><UsersRound aria-hidden="true" /></span>
            <span className="channel-tag">{t(language, "people")}</span>
          </div>
          <h3>{t(language, volunteer || coordinator ? "peopleDirectory" : "helpers")}</h3>
          <p>{t(language, volunteer || coordinator ? "peopleDescription" : "helperDescription")}</p>
          <button className="inline-link" type="button" onClick={() => onNavigate(volunteer || coordinator ? "people" : "helpers")}>
            {t(language, "viewAll")} <ArrowUpRight aria-hidden="true" />
          </button>
        </article>
      </section>
    </div>
  )
}
