"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SetupScreen } from "@/components/relief/setup-screen"
import type { Language } from "@/lib/contracts"

export default function SetupPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  return <SetupScreen language={language} onLanguageChange={setLanguage} onDone={() => router.push("/login")} />
}