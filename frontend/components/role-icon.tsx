import { HandHeart, LifeBuoy, ShieldCheck } from "lucide-react"
import type { RoleIconName } from "@/lib/roles"

export function RoleIcon({ name, className }: { name: RoleIconName; className?: string }) {
  const Icon = name === "shield" ? ShieldCheck : name === "hand" ? HandHeart : LifeBuoy
  return <Icon className={className} aria-hidden="true" />
}
