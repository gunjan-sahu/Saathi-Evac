import type { UserRole } from "@/lib/contracts"

export const ROLE_ORDER: UserRole[] = ["coordinator", "volunteer", "rescue"]

export const ROLE_META: Record<UserRole, {
  label: string; portal: string; tagline: string; blurb: string; points: string[]
  accent: string; bright: string; soft: string; icon: "shield" | "hand" | "lifebuoy"
}> = {
  coordinator: {
    label: "Coordinator", portal: "Emergency Command Centre", tagline: "See everything. Coordinate everyone.",
    blurb: "Runs the response for a ward: starts events, watches the needs-ranked queue and keeps every person covered.",
    points: ["Start events and send warnings", "Monitor the priority queue and live map", "Re-assign silent helpers, manage shelters and users"],
    accent: "#28594b", bright: "#7fd1a8", soft: "#e8f0ea", icon: "shield",
  },
  volunteer: {
    label: "Volunteer", portal: "Community Hub", tagline: "Be the person someone is waiting for.",
    blurb: "Registers neighbours who cannot self-evacuate, then helps them on the day.",
    points: ["Register people with consent, even offline", "Become a helper and receive assignments", "Check in: on my way, reached, need backup"],
    accent: "#b86e12", bright: "#e7b45b", soft: "#fbf0dc", icon: "hand",
  },
  rescue: {
    label: "Rescue Team", portal: "Field Operations", tagline: "Know who needs what, and where.",
    blurb: "Responds in the field with a needs-ranked queue, locations and live helper status.",
    points: ["Needs-ranked mission queue with locations", "Health details only while an event is active", "Helper availability and shelter capacity"],
    accent: "#b8433b", bright: "#e8736b", soft: "#fbe9e7", icon: "lifebuoy",
  },
}
export type RoleIconName = (typeof ROLE_META)[UserRole]["icon"]
