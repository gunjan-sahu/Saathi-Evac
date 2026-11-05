"use client"

import { useState, type FormEvent } from "react"
import useSWR from "swr"
import { UserRoundCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog, ContractNotice, FormDialog, PanelHeading } from "@/components/relief/primitives"
import { UnknownEndpointPanel } from "@/components/relief/unknown-endpoint-panel"
import type { AuthUser, Language, UserCreatePayload, UserRole } from "@/lib/contracts"
import { apiRequest } from "@/lib/api"
import { formatApiError } from "@/lib/format"
import { swrFetcher } from "@/lib/swr-fetcher"
import { t } from "@/lib/i18n"
import type { Notify } from "@/components/relief/types"

export function UsersScreen({ user, language, notify }: { user: AuthUser; language: Language; notify: Notify }) {
  const { data, error, isLoading, mutate } = useSWR<unknown>("/auth/users", swrFetcher, { revalidateOnFocus: false })
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [helperId, setHelperId] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("volunteer")
  const [createOpen, setCreateOpen] = useState(false)
  const [formError, setFormError] = useState("")
  const [targetId, setTargetId] = useState("")
  const [deactivationError, setDeactivationError] = useState("")
  const [deactivationReview, setDeactivationReview] = useState(false)
  const [busy, setBusy] = useState(false)

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!username.trim() || !fullName.trim() || password.length < 8) {
      setFormError(password.length > 0 && password.length < 8 ? t(language, "passwordTooShort") : t(language, "formRequired"))
      return
    }
    const payload: UserCreatePayload = {
      username: username.trim(),
      password,
      full_name: fullName.trim(),
      role,
      ...(helperId.trim() ? { helper_id: helperId.trim() } : {}),
    }
    setBusy(true)
    setFormError("")
    try {
      await apiRequest<unknown>("/auth/users", { method: "POST", body: payload, auth: true })
      notify(t(language, "userCreated"))
      setUsername("")
      setFullName("")
      setHelperId("")
      setPassword("")
      setRole("volunteer")
      setCreateOpen(false)
      await mutate()
    } catch (cause) {
      setFormError(formatApiError(cause, language))
    } finally {
      setBusy(false)
    }
  }

  async function deactivateUser() {
    const id = targetId.trim()
    if (!id) {
      setDeactivationError(t(language, "formRequired"))
      setDeactivationReview(false)
      return
    }
    if (id === String(user.id)) {
      setDeactivationError(t(language, "selfDeactivationDisabled"))
      setDeactivationReview(false)
      return
    }
    setBusy(true)
    setDeactivationError("")
    try {
      await apiRequest<unknown>(`/auth/users/${encodeURIComponent(id)}/deactivate`, { method: "POST", auth: true })
      notify(t(language, "userDeactivated"))
      setTargetId("")
      setDeactivationReview(false)
      await mutate()
    } catch (cause) {
      setDeactivationError(formatApiError(cause, language))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen-stack">
      <PanelHeading
        eyebrow={t(language, "roleCoordinator")}
        title={t(language, "userManagementTitle")}
        description={t(language, "userManagementDescription")}
        action={<Button size="lg" onClick={() => { setFormError(""); setCreateOpen(true) }}><UserRoundCog data-icon="inline-start" aria-hidden="true" />{t(language, "createUser")}</Button>}
      />

      <section className="surface-card manual-action-card">
        <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "userManagementTitle")}</p><h2>{t(language, "deactivateUser")}</h2></div></div>
        <form className="manual-action-form" onSubmit={(event) => { event.preventDefault(); setDeactivationError(""); setDeactivationReview(true) }}>
          <label className="form-field" htmlFor="target-user-id"><span>{t(language, "targetUserId")} <em>*</em></span><input id="target-user-id" className="form-control" value={targetId} onChange={(event) => setTargetId(event.target.value)} required /><small className="field-help">{t(language, "userIdNote")}</small></label>
          <Button type="submit" variant="destructive" size="lg">{t(language, "deactivateUser")}</Button>
        </form>
        {deactivationError ? <p className="form-error" role="alert">{deactivationError}</p> : null}
      </section>

      <section className="surface-card">
        <div className="surface-card-heading"><div><p className="eyebrow">{t(language, "appDataSource")}</p><h2>{t(language, "userManagementTitle")}</h2></div></div>
        {data !== undefined || error || isLoading ? (
          <UnknownEndpointPanel language={language} data={data} error={error} isLoading={isLoading} message={t(language, "userResponseGap")} onRetry={() => void mutate()} />
        ) : (
          <ContractNotice language={language} message={t(language, "userResponseGap")} />
        )}
      </section>

      <FormDialog
        open={createOpen}
        title={t(language, "createUser")}
        description={t(language, "userCreateDialogDescription")}
        closeLabel={t(language, "close")}
        onClose={() => setCreateOpen(false)}
      >
        <form className="form-grid user-create-form" onSubmit={createUser}>
          <label className="form-field" htmlFor="user-full-name"><span>{t(language, "fullName")} <em>*</em></span><input id="user-full-name" className="form-control" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label>
          <label className="form-field" htmlFor="user-username"><span>{t(language, "username")} <em>*</em></span><input id="user-username" className="form-control" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
          <label className="form-field" htmlFor="user-password"><span>{t(language, "password")} <em>*</em></span><input id="user-password" className="form-control" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /><small className="field-help">{t(language, "passwordTooShort")}</small></label>
          <label className="form-field" htmlFor="user-helper-id"><span>{t(language, "helperId")} <small>{t(language, "optional")}</small></span><input id="user-helper-id" className="form-control" value={helperId} onChange={(event) => setHelperId(event.target.value)} /><small className="field-help">{t(language, "helperIdOptional")}</small></label>
          <label className="form-field" htmlFor="user-role"><span>{t(language, "role")} <em>*</em></span><select id="user-role" className="form-control" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            <option value="volunteer">{t(language, "roleVolunteer")}</option>
            <option value="coordinator">{t(language, "roleCoordinator")}</option>
            <option value="rescue">{t(language, "roleRescue")}</option>
          </select></label>
          {formError ? <p className="form-error field-span-2" role="alert">{formError}</p> : null}
          <div className="form-actions field-span-2"><Button type="submit" size="lg" disabled={busy}>{busy ? t(language, "loading") : t(language, "createUser")}</Button></div>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={deactivationReview}
        title={t(language, "confirmDeactivateUser")}
        description={`${t(language, "deactivationWarning")} ${t(language, "targetUserId")}: ${targetId}`}
        confirmLabel={t(language, "deactivateUser")}
        cancelLabel={t(language, "cancel")}
        busy={busy}
        errorMessage={deactivationError}
        destructive
        onCancel={() => setDeactivationReview(false)}
        onConfirm={() => void deactivateUser()}
      />
    </div>
  )
}
