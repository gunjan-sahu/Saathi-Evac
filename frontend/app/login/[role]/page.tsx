import { notFound } from "next/navigation"
import { RoleLogin } from "@/components/relief/role-login"
import { isUserRole } from "@/lib/api"

export default async function RoleLoginPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params
  if (!isUserRole(role)) notFound()
  return <RoleLogin role={role} />
}