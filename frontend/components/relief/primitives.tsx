"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { AlertCircle, CheckCircle2, Info, LoaderCircle } from "lucide-react"
import type { Language } from "@/lib/contracts"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

export function PanelHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="panel-heading">
      <div className="panel-heading-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p className="muted-copy">{description}</p> : null}
      </div>
      {action ? <div className="panel-heading-action">{action}</div> : null}
    </div>
  )
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="state-box state-loading" role="status" aria-live="polite">
      <LoaderCircle className="spin-icon" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: ReactNode }) {
  return (
    <div className="state-box state-empty">
      <span className="state-icon" aria-hidden="true">{icon ?? <Info />}</span>
      <div>
        <strong>{title}</strong>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
  )
}

export function InlineNotice({
  children,
  tone = "info",
}: {
  children: ReactNode
  tone?: "info" | "success" | "warning" | "danger"
}) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "danger" ? AlertCircle : Info
  return (
    <div className={`inline-notice notice-${tone}`} role={tone === "danger" ? "alert" : "status"}>
      <Icon aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
  retryLabel,
}: {
  message: string
  onRetry?: () => void
  retryLabel?: string
}) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state-copy">
        <AlertCircle aria-hidden="true" />
        <span>{message}</span>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel ?? "Retry"}
        </Button>
      ) : null}
    </div>
  )
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warning" | "danger" | "info" | "success" }) {
  return <span className={`status-badge badge-${tone}`}>{children}</span>
}

export function ContractNotice({
  language,
  message,
  shape,
}: {
  language: Language
  message?: string
  shape?: string
}) {
  return (
    <InlineNotice tone="warning">
      <strong>{t(language, "contractGap")}</strong>
      <p>{message ?? t(language, "unsupportedResponse")}</p>
      {shape ? <small>{t(language, "responseShape")}: {shape}</small> : null}
    </InlineNotice>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  busy,
  errorMessage,
  destructive,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  busy?: boolean
  errorMessage?: string
  destructive?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
    >
      <div className="dialog-content">
        <span className={`dialog-mark ${destructive ? "dialog-mark-danger" : ""}`} aria-hidden="true">
          <AlertCircle />
        </span>
        <div className="dialog-copy">
          <h2 id="confirm-dialog-title">{title}</h2>
          <p id="confirm-dialog-description">{description}</p>
        </div>
        {errorMessage ? <p className="dialog-error" role="alert">{errorMessage}</p> : null}
        <div className="dialog-actions">
          <Button variant="outline" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm} disabled={busy}>
            {busy ? <LoaderCircle className="spin-icon" data-icon="inline-start" aria-hidden="true" /> : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

export function FormDialog({
  open,
  title,
  description,
  closeLabel,
  onClose,
  children,
}: {
  open: boolean
  title: string
  description: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="form-dialog"
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="form-dialog-content">
        <div className="form-dialog-heading">
          <div><h2 id="form-dialog-title">{title}</h2><p id="form-dialog-description">{description}</p></div>
          <button className="icon-button" type="button" aria-label={closeLabel} onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
