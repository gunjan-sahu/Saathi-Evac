import type { UserRole } from "@/lib/contracts"

export const ROLE_ORDER: UserRole[] = ["coordinator", "volunteer", "rescue"]

export const ROLE_META: Record<UserRole, {
  label: string; portal: string; tagline: string; blurb: string; points: string[]
  accent: string; bright: string; soft: string; icon: "shield" | "hand" | "lifebuoy"
}> = {
  coordinator: {
    label: "Coordinator", portal: "Emergency Command Centre", tagline: "See everything. Coordinate everyone.",
    blurb: "Runs the response and keeps everyone covered.",
     points: ["Start events and warnings", "Monitor queue and live map"],
    accent: "#28594b", bright: "#7fd1a8", soft: "#e8f0ea", icon: "shield",
  },
  volunteer: {
    label: "Volunteer", portal: "Community Hub", tagline: "Be the person someone is waiting for.",
    blurb: "Registers neighbours and helps on the day.",
    points: ["Register people, even offline", "Check in: on my way, reached"],
    accent: "#b86e12", bright: "#e7b45b", soft: "#fbf0dc", icon: "hand",
  },
  rescue: {
    label: "Rescue Team", portal: "Field Operations", tagline: "Know who needs what, and where.",
    blurb: "Responds in the field with a ranked queue.",
    points: ["Needs-ranked missions with locations", "Health data only during events"],
    accent: "#b8433b", bright: "#e8736b", soft: "#fbe9e7", icon: "lifebuoy",
  },
}
export type RoleIconName = (typeof ROLE_META)[UserRole]["icon"]
