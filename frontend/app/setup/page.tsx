"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SetupScreen } from "@/components/relief/setup-screen"
import type { Language } from "@/lib/contracts"

export default function Page() {
  const [language, setLanguage] = useState<Language>("en")
  const router = useRouter()
  return <SetupScreen language={language} onLanguageChange={setLanguage} onDone={() => router.push("/login/coordinator")} />
}
