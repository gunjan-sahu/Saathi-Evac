import { HeartHandshake, ShieldCheck, Siren } from "lucide-react"
import type { UserRole } from "@/lib/contracts"

export const ROLE_ORDER: UserRole[] = ["coordinator", "volunteer", "rescue"]

export const ROLE_ICON = {
  coordinator: ShieldCheck,
  volunteer: HeartHandshake,
  rescue: Siren,
} as const

export const ROLE_META: Record<
  UserRole,
  { label: string; heading: string; description: string; accent: string; demoUser: string; demoPass: string }
> = {
  coordinator: {
    label: "Coordinator",
    heading: "Command centre sign-in",
    description: "Run incidents, dispatch teams, manage shelters and see the whole response.",
    accent: "#1f6f5c",
    demoUser: "coord",
    demoPass: "Coord@12345",
  },
  volunteer: {
    label: "Volunteer",
    heading: "Community hub sign-in",
    description: "Register people, take assignments and support relief on the ground.",
    accent: "#6b8f3a",
    demoUser: "volunteer1",
    demoPass: "Volunteer@12345",
  },
  rescue: {
    label: "Rescue Team",
    heading: "Field operations sign-in",
    description: "See missions, priorities and locations, and report rescue progress.",
    accent: "#c2571a",
    demoUser: "rescue",
    demoPass: "Rescue@12345",
  },
}