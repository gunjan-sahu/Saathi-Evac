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
