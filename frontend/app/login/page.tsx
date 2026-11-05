import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ROLE_ICON, ROLE_META, ROLE_ORDER } from "@/lib/roles"

export const metadata = { title: "Sign in — Sahaara" }

export default function LoginChooser() {
  return (
    <main className="role-picker">
      <div className="role-picker-inner">
        <a className="brand-lockup" href="/" aria-label="Sahaara">
          <span className="brand-symbol brand-symbol-logo">
            <img src="/logo.png" alt="" />
          </span>
          <span className="brand-wordmark">Sahaara</span>
        </a>

        <h1>Who is signing in?</h1>
        <p>Choose your role to continue.</p>

        {ROLE_ORDER.map((role) => {
          const meta = ROLE_META[role]
          const Icon = ROLE_ICON[role]

          return (
            <Link
              key={role}
              href={`/login/${role}`}
              className="role-card"
              style={{ "--role-accent": meta.accent } as React.CSSProperties}
            >
              <span className="role-card-icon">
                <Icon aria-hidden="true" />
              </span>

              <span>
                <strong>{meta.label}</strong>
                <span className="desc">{meta.description}</span>
              </span>

              <ArrowRight className="arrow" aria-hidden="true" />
            </Link>
          )
        })}

        <Link className="role-back" href="/setup">
          First-time setup (create the first coordinator)
        </Link>
      </div>
    </main>
  )
}