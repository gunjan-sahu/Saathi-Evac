import type { UserRole } from "@/lib/contracts"

// Demo accounts are created by backend/create_demo_accounts.py. Keep both lists identical.
// Set NEXT_PUBLIC_DEMO_MODE=false to hide the demo box (always do this on a real deployment).
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false"

export const DEMO_ACCOUNTS: Record<UserRole, { username: string; password: string }> = {
  coordinator: { username: "demo_coordinator", password: "DemoCoord@2026" },
  volunteer: { username: "demo_volunteer", password: "DemoVolunteer@2026" },
  rescue: { username: "demo_rescue", password: "DemoRescue@2026" },
}
