import { notFound } from "next/navigation"
import { RoleLogin } from "@/components/auth/role-login"
import { isUserRole } from "@/lib/api"

export default async function Page({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params
  return isUserRole(role) ? <RoleLogin role={role} /> : notFound()
}
