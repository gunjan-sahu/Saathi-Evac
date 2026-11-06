"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import useSWR, { SWRConfig } from "swr"
import { AlertCircle, Info, LoaderCircle, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { clearAccessToken, ACCESS_TOKEN_KEY } from "@/lib/api"
import { isAuthUser, type AuthUser, type Language, type UserRole } from "@/lib/contracts"
import { createClientId, formatApiError } from "@/lib/format"
import { t } from "@/lib/i18n"
import { swrFetcher } from "@/lib/swr-fetcher"
import { useOfflineQueue } from "@/hooks/use-offline-queue"
import { OperationsShell, type PageId } from "@/components/relief/operations-shell"
import { CommandCentre, CommunityHub, FieldOperations } from "@/components/relief/dashboards"
import { DispatchScreen } from "@/components/relief/screens/dispatch-screen"
import { PeopleScreen } from "@/components/relief/screens/people-screen"
import { PersonRegistrationScreen } from "@/components/relief/screens/person-registration-screen"
import { TasksScreen } from "@/components/relief/screens/tasks-screen"
import { HelpersScreen } from "@/components/relief/screens/helpers-screen"
import { SheltersScreen } from "@/components/relief/screens/shelters-screen"
import { EventsScreen } from "@/components/relief/screens/events-screen"
import { ConcernsScreen } from "@/components/relief/screens/concerns-screen"
import { FairnessScreen } from "@/components/relief/screens/fairness-screen"
import { AccessAuditScreen } from "@/components/relief/screens/access-audit-screen"
import { UsersScreen } from "@/components/relief/screens/users-screen"
import { RulesScreen } from "@/components/relief/screens/rules-screen"
import { ErrorState } from "@/components/relief/primitives"

export function ReliefApp({ portalRole }: { portalRole: UserRole }) {
  const router = useRouter()
    const [language, setLangState] = useState<Language>("en")
  const setLanguage = useCallback((next: Language) => {
    setLangState(next)
    try { window.localStorage.setItem("sahaara.lang", next) } catch {}
  }, [])
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("sahaara.lang")
      if (saved === "hi" || saved === "en") setLangState(saved)
    } catch {}
  }, 
  const [page, setPage] = useState<PageId>("overview")
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [sessionKey, setSessionKey] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const swrConfig = useMemo(() => ({ provider: () => new Map() }), [sessionKey])
  const [notice, setNotice] = useState<{ message: string; tone: "success" | "danger" | "info" } | null>(null)
  const [noticeKey, setNoticeKey] = useState(0)

  useEffect(() => {
    const token = window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
    setAccessToken(token)
    setSessionKey(token ? createClientId() : null)
    setSessionReady(true)
  }, [])

  const { data: user, error: userError, isLoading: userLoading, mutate: mutateUser } = useSWR<AuthUser>(
    sessionReady && accessToken && sessionKey ? ["/auth/me", sessionKey] : null,
    ([path]: [string, string]) => swrFetcher<AuthUser>(path),
    { shouldRetryOnError: false, revalidateOnFocus: false },
  )

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAccessToken()
      window.sessionStorage.removeItem("sahaara.role")
      setAccessToken(null)
      setSessionKey(null)
      setPage("overview")
      void mutateUser(undefined, { revalidate: false })
    }
    window.addEventListener("sahaara:unauthorized", handleUnauthorized)
    return () => window.removeEventListener("sahaara:unauthorized", handleUnauthorized)
  }, [mutateUser])

  const offlineQueue = useOfflineQueue(accessToken, language, user?.id ?? null)

  const notify = useCallback((message: string, tone: "success" | "danger" | "info" = "success") => {
    setNotice({ message, tone })
    setNoticeKey((key) => key + 1)
    window.setTimeout(() => setNotice((current) => current && current.message === message ? null : current), 5200)
  }, [])

  const handleSignOut = useCallback(() => {
    clearAccessToken()
    window.sessionStorage.removeItem("sahaara.role")
    setAccessToken(null)
    setSessionKey(null)
    setPage("overview")
    void mutateUser(undefined, { revalidate: false })
    router.replace("/")
  }, [mutateUser, router])

  // Protected route: no session goes to this role's sign-in; a session for another role goes to its own portal.
  useEffect(() => {
    if (sessionReady && !accessToken) router.replace(`/login/${portalRole}`)
  }, [sessionReady, accessToken, portalRole, router])
  useEffect(() => {
    if (user && isAuthUser(user) && user.role !== portalRole) router.replace(`/${user.role}`)
  }, [user, portalRole, router])

  if (!sessionReady) {
    return <div className="boot-screen" role="status"><LoaderCircle className="spin-icon" aria-hidden="true" /><span>{t(language, "loading")}</span></div>
  }

  if (!accessToken) {
    return <div className="boot-screen" role="status"><LoaderCircle className="spin-icon" aria-hidden="true" /><span>{t(language, "loading")}</span></div>
  }

  if (userLoading || !user && !userError) {
    return <div className="boot-screen" role="status"><LoaderCircle className="spin-icon" aria-hidden="true" /><span>{t(language, "loading")}</span></div>
  }

  if (userError) {
    return (
      <div className="session-error-screen">
        <div className="session-error-card">
          <span className="session-error-mark"><AlertCircle aria-hidden="true" /></span>
          <p className="eyebrow">{t(language, "appName")}</p>
          <h1>{t(language, "errorTitle")}</h1>
          <p>{formatApiError(userError, language)}</p>
          <div className="session-error-actions">
            <button type="button" className="primary-button" onClick={() => void mutateUser()}>{t(language, "retryRequest")}</button>
            <button type="button" className="text-button" onClick={handleSignOut}>{t(language, "signOut")}</button>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !isAuthUser(user)) {
    return (
      <div className="session-error-screen">
        <div className="session-error-card">
          <span className="session-error-mark"><ShieldCheck aria-hidden="true" /></span>
          <p className="eyebrow">{t(language, "appName")}</p>
          <h1>{t(language, "contractGap")}</h1>
          <p>{t(language, "authResponseGapDescription")}</p>
          <button type="button" className="text-button" onClick={handleSignOut}>{t(language, "signOut")}</button>
        </div>
      </div>
    )
  }

  if (user.role !== portalRole) {
    return <div className="boot-screen" role="status"><LoaderCircle className="spin-icon" aria-hidden="true" /><span>{t(language, "loading")}</span></div>
  }

  const allowed = (target: PageId) => {
    if (target === "overview" || target === "rules") return true
    if (target === "dispatch" || target === "events") return user.role === "coordinator" || user.role === "rescue"
    if (target === "people" || target === "register" || target === "concerns") return user.role === "volunteer" || user.role === "coordinator"
    if (target === "tasks") return user.role === "volunteer"
    if (target === "helpers" || target === "shelters") return true
    return user.role === "coordinator"
  }

  const onPageChange = (target: PageId) => {
    if (allowed(target)) setPage(target)
  }

    const overview = user.role === "coordinator" ? <CommandCentre user={user} language={language} onNavigate={onPageChange} /> : user.role === "rescue" ? <FieldOperations user={user} language={language} onNavigate={onPageChange} /> : <CommunityHub user={user} language={language} onNavigate={onPageChange} />

  const pageContent = (() => {
    if (!allowed(page)) return overview
    switch (page) {
      case "overview": return overview
      case "dispatch": return <DispatchScreen user={user} language={language} notify={notify} />
      case "people": return <PeopleScreen language={language} notify={notify} />
      case "register": return <PersonRegistrationScreen language={language} queue={offlineQueue} notify={notify} />
      case "tasks": return <TasksScreen user={user} language={language} notify={notify} onNavigate={onPageChange} />
      case "helpers": return <HelpersScreen user={user} language={language} notify={notify} onProfileChanged={() => mutateUser()} />
      case "shelters": return <SheltersScreen language={language} role={user.role} notify={notify} />
      case "events": return <EventsScreen language={language} user={user} notify={notify} />
      case "concerns": return <ConcernsScreen language={language} role={user.role} queue={offlineQueue} notify={notify} />
      case "fairness": return <FairnessScreen language={language} />
      case "access-audit": return <AccessAuditScreen language={language} />
      case "users": return <UsersScreen user={user} language={language} notify={notify} />
      case "rules": return <RulesScreen language={language} />
      default: return overview
    }
  })()

  return (
    <SWRConfig key={sessionKey ?? "signed-out"} value={swrConfig}>
    <OperationsShell
      user={user}
      language={language}
      page={page}
      queue={offlineQueue}
      onPageChange={onPageChange}
      onLanguageChange={setLanguage}
      onSignOut={handleSignOut}
    >
      {pageContent}
      {notice ? (
        <div key={noticeKey} className={`app-toast toast-${notice.tone}`} role={notice.tone === "danger" ? "alert" : "status"} aria-live="polite">
          {notice.tone === "success" ? <ShieldCheck aria-hidden="true" /> : notice.tone === "info" ? <Info aria-hidden="true" /> : <AlertCircle aria-hidden="true" />}
          <span>{notice.message}</span>
          <button className="toast-close" type="button" aria-label={t(language, "close")} onClick={() => setNotice(null)}>×</button>
        </div>
      ) : null}
    </OperationsShell>
    </SWRConfig>
  )
}
