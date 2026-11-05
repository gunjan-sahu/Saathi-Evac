"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Shield,
  HeartHandshake,
  Siren,
  PhoneCall,
  WifiOff,
  Scale,
  Users,
  Radio,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Clock,
  LifeBuoy,
  Languages,
  Activity,
  FileCheck,
  Eye,
  Lock,
} from "lucide-react"

export default function LandingPage() {
  const [activeLangTab, setActiveLangTab] = useState<"hi" | "en">("hi")
  const [selectedDemoKey, setSelectedDemoKey] = useState<"1" | "2">("1")

  const languagesList = [
    { code: "hi", name: "हिन्दी", native: "Hindi" },
    { code: "bn", name: "বাংলা", native: "Bengali" },
    { code: "mr", name: "मराठी", native: "Marathi" },
    { code: "ta", name: "தமிழ்", native: "Tamil" },
    { code: "te", name: "తెలుగు", native: "Telugu" },
    { code: "ur", name: "اردو", native: "Urdu" },
    { code: "gu", name: "ગુજરાતી", native: "Gujarati" },
    { code: "ml", name: "മലയാളം", native: "Malayalam" },
    { code: "kn", name: "ಕನ್ನಡ", native: "Kannada" },
    { code: "or", name: "ଓଡ଼ିଆ", native: "Odia" },
    { code: "pa", name: "ਪੰਜਾਬੀ", native: "Punjabi" },
    { code: "as", name: "অসমীয়া", native: "Assamese" },
    { code: "en", name: "English", native: "English" },
  ]

  const scoringRules = [
    { need: "Bedridden", points: "+30 pts", reason: "Cannot evacuate without stretcher team" },
    { need: "Oxygen Dependent", points: "+30 pts", reason: "Critical life support power risk during flood" },
    { need: "Dialysis Patient", points: "+25 pts", reason: "Strict clinical window for medical relocation" },
    { need: "Mobility Aid (Wheelchair / Crutches)", points: "+15 pts", reason: "Requires accessible shelter and transport" },
    { need: "Infant or Pregnancy", points: "+15 pts", reason: "Heightened exposure and nutritional vulnerability" },
    { need: "Lives Alone", points: "+10 pts", reason: "Zero domestic assistance during water surge" },
    { need: "Age 75 or Above", points: "+10 pts", reason: "Elevated hypothermia and mobility hazard" },
    { need: "Hearing or Vision Limitation", points: "+8 pts", reason: "Sirens or visual warnings may be missed" },
    { need: "Gender, Caste, or Religion", points: "0 pts (Strictly Excluded)", reason: "Audited algorithmically to prevent bias" },
  ]

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#183d35] selection:bg-[#a9c5ae] selection:text-[#183d35]">
      {/* Top Emergency Status and Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-[#dfe6df] bg-[#faf9f5]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-[#183d35]/10">
                <img src="/logo.png" alt="Saathi-Evac Logo" className="h-full w-full object-contain" />
              </span>
              <div>
                <span className="block text-base font-bold tracking-tight text-[#183d35]">
                  Saathi-Evac
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#52635d]">
                  Disaster Safety Network
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 md:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
              </span>
              <span>Ward 7 Monitoring Active</span>
            </div>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            <a href="#mission" className="text-sm font-medium text-[#52635d] transition-colors hover:text-[#183d35]">
              Mission
            </a>
            <a href="#lifecycle" className="text-sm font-medium text-[#52635d] transition-colors hover:text-[#183d35]">
              How It Works
            </a>
            <a href="#innovations" className="text-sm font-medium text-[#52635d] transition-colors hover:text-[#183d35]">
              Offline and AI
            </a>
            <a href="#voice-alerts" className="text-sm font-medium text-[#52635d] transition-colors hover:text-[#183d35]">
              Voice Alerts
            </a>
            <a href="#triage" className="text-sm font-medium text-[#52635d] transition-colors hover:text-[#183d35]">
              Fair Rules
            </a>
            <a href="#stations" className="text-sm font-medium text-[#52635d] transition-colors hover:text-[#183d35]">
              Stations
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/setup"
              className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-[#52635d] transition-colors hover:bg-[#e8f0ea] hover:text-[#183d35] sm:block"
            >
              First-Time Setup
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-[#183d35] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#28594b] hover:shadow-md active:scale-95"
            >
              <span>Response Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="mission" className="relative overflow-hidden bg-gradient-to-b from-[#183d35] via-[#1f4a3e] to-[#183d35] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(169,197,174,0.22),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#a9c5ae]/30 bg-[#a9c5ae]/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#a9c5ae]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Fair Offline Disaster Evacuation</span>
              </div>

              <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                When disaster strikes,{" "}
                <span className="text-[#a9c5ae]">no one should be left behind.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#e8f0ea] sm:text-lg">
                In floods and cyclones, the bedridden, elderly, and disabled are warned last and carried last.
                Saathi-Evac empowers community volunteers to register vulnerable people in person, coordinates
                rescuers offline without cell towers, and triggers automated voice calls in local languages to basic phones.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-xl bg-[#a9c5ae] px-6 py-3.5 text-sm font-bold text-[#183d35] shadow-lg transition-all hover:bg-white hover:shadow-xl active:scale-95"
                >
                  <span>Launch Operations Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#lifecycle"
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <span>See How It Works</span>
                  <ChevronRight className="h-4 w-4 text-[#a9c5ae]" />
                </a>
              </div>

              {/* Direct station shortcuts */}
              <div className="mt-10 border-t border-white/10 pt-6">
                <span className="block text-xs font-medium uppercase tracking-wider text-[#a9c5ae]">
                  Direct Station Sign In:
                </span>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <Link
                    href="/login/coordinator"
                    className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <Shield className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Coordinator</span>
                  </Link>
                  <Link
                    href="/login/volunteer"
                    className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <HeartHandshake className="h-3.5 w-3.5 text-lime-300" />
                    <span>Volunteer Field App</span>
                  </Link>
                  <Link
                    href="/login/rescue"
                    className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <Siren className="h-3.5 w-3.5 text-amber-300" />
                    <span>Rescue Team</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Live Operational Simulation Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 animate-pulse text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Live Incident Simulation
                    </span>
                  </div>
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                    Flood Alert Level 3
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-[#183d35]/60 p-3.5 ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-[#a9c5ae]">People Registered in Ward 7</div>
                        <div className="text-lg font-bold text-white">1,420 Citizens</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">100% Consent</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-[#183d35]/60 p-3.5 ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-[#a9c5ae]">Urgent Triage Cases</div>
                        <div className="text-lg font-bold text-white">38 Bedridden / Oxygen</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-rose-300">Top Priority</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-[#183d35]/60 p-3.5 ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300">
                        <PhoneCall className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-[#a9c5ae]">Multilingual Voice Calls</div>
                        <div className="text-lg font-bold text-white">13 Regional Dialects</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-sky-300">Keypad Reply</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-[#183d35]/60 p-3.5 ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                        <WifiOff className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-[#a9c5ae]">Offline Helpers Linked</div>
                        <div className="text-lg font-bold text-white">124 Ready on Ground</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">Auto Sweep</span>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-3 text-center text-xs text-[#e8f0ea]">
                  Health details and GPS locations unlock only when official alerts are active for that ward.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers Ribbon */}
      <section className="border-b border-[#dfe6df] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="border-l-4 border-[#28594b] pl-4">
              <div className="text-2xl font-black text-[#183d35] sm:text-3xl">0 Bias</div>
              <div className="text-xs font-semibold text-[#52635d]">
                Gender, caste and religion strictly excluded from triage score
              </div>
            </div>

            <div className="border-l-4 border-emerald-600 pl-4">
              <div className="text-2xl font-black text-[#183d35] sm:text-3xl">100% Offline</div>
              <div className="text-xs font-semibold text-[#52635d]">
                Field app saves to device storage, retries with safe client IDs
              </div>
            </div>

            <div className="border-l-4 border-sky-600 pl-4">
              <div className="text-2xl font-black text-[#183d35] sm:text-3xl">13 Dialects</div>
              <div className="text-xs font-semibold text-[#52635d]">
                Automated IVR calls run on basic phones with key 1 and 2 replies
              </div>
            </div>

            <div className="border-l-4 border-amber-600 pl-4">
              <div className="text-2xl font-black text-[#183d35] sm:text-3xl">Live Sweep</div>
              <div className="text-xs font-semibold text-[#52635d]">
                Silent or unreachable helpers are auto replaced in minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Storytelling: The 4-Step Evacuation Lifecycle */}
      <section id="lifecycle" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#28594b]">
              End to End Coordination
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#183d35] sm:text-4xl">
              How Saathi-Evac Protects Communities
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#52635d]">
              From in-person registration to multilingual voice alarms and offline rescue triage,
              every step is designed for high water, broken power grids, and zero cellular signal.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative flex flex-col rounded-2xl border border-[#dfe6df] bg-white p-6 shadow-sm transition-all hover:border-[#28594b] hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f0ea] text-[#183d35]">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#28594b]">Step 01</span>
                <span className="h-px flex-1 bg-[#dfe6df]"></span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-[#183d35]">In-Person Registration</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                ASHA workers and volunteers visit homes door to door. They record bedridden status, oxygen dependence,
                dialysis needs, mobility limits, pregnancy, and living alone with explicit consent.
              </p>
              <div className="mt-auto pt-4 text-xs font-medium text-[#28594b]">
                Works 100% offline with zero cell connectivity.
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col rounded-2xl border border-[#dfe6df] bg-white p-6 shadow-sm transition-all hover:border-[#28594b] hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <PhoneCall className="h-6 w-6" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Step 02</span>
                <span className="h-px flex-1 bg-[#dfe6df]"></span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-[#183d35]">Multilingual Voice Warning</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                Official alerts trigger automated phone calls to basic keypad phones in regional languages.
                Residents confirm safety or press 2 for immediate rescue backup.
              </p>
              <div className="mt-auto pt-4 text-xs font-medium text-sky-700">
                No smartphone, internet, or app installation required.
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col rounded-2xl border border-[#dfe6df] bg-white p-6 shadow-sm transition-all hover:border-[#28594b] hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                <Scale className="h-6 w-6" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Step 03</span>
                <span className="h-px flex-1 bg-[#dfe6df]"></span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-[#183d35]">Fair Explainable Triage</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                Transparent scoring ranks the rescue queue strictly by medical vulnerability and danger.
                Rescuers see clear reasons for ranking, with accessible shelter matching.
              </p>
              <div className="mt-auto pt-4 text-xs font-medium text-amber-800">
                Scoring rules published openly for public audit.
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col rounded-2xl border border-[#dfe6df] bg-white p-6 shadow-sm transition-all hover:border-[#28594b] hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <Siren className="h-6 w-6" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Step 04</span>
                <span className="h-px flex-1 bg-[#dfe6df]"></span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-[#183d35]">Live Helper Re-assignment</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                Volunteers and rescue teams navigate to assigned people. If a helper loses signal, falls behind,
                or requests backup, the system immediately dispatches the next closest helper.
              </p>
              <div className="mt-auto pt-4 text-xs font-medium text-emerald-800">
                Full re-assignment audit trail with reason logs.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Innovations Grid */}
      <section id="innovations" className="border-y border-[#dfe6df] bg-[#eef1ec]/60 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#28594b]">
              Technological Highlights
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#183d35] sm:text-4xl">
              Five Innovations Built for Natural Disasters
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#52635d]">
              Engineered specifically to solve real challenges during monsoons, cyclones, and rapid flash floods.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Innovation 1 */}
            <div className="rounded-2xl border border-[#dfe6df] bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0ea] text-[#183d35]">
                <WifiOff className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#183d35]">Offline-First Field Resilience</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                Field volunteers can register citizens and check in even with zero internet signal.
                Actions are stored locally on the phone and synchronized with idempotent client IDs,
                guaranteeing no duplicate entries upon network reconnection.
              </p>
            </div>

            {/* Innovation 2 */}
            <div className="rounded-2xl border border-[#dfe6df] bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0ea] text-[#183d35]">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#183d35]">Fair and Unbiased Triage</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                Priority is determined entirely by medical vulnerability, physical mobility, and isolation factors.
                Protected demographics like gender, religion, and caste are never inputs to priority scoring,
                with real-time equity audits across demographic groups.
              </p>
            </div>

            {/* Innovation 3 */}
            <div className="rounded-2xl border border-[#dfe6df] bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0ea] text-[#183d35]">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#183d35]">Live Helper Sweeps and Heartbeats</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                If a volunteer becomes silent during an evacuation or faces blocked roads, an automated sweep
                marks them unreachable and re-routes their assigned cases to the nearest available team,
                honoring stretcher and medical skill requirements.
              </p>
            </div>

            {/* Innovation 4 */}
            <div className="rounded-2xl border border-[#dfe6df] bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0ea] text-[#183d35]">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#183d35]">Accessible Shelter Matching</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                The shelter agent checks wheelchair ramps and separate sanitation facilities before routing.
                People requiring mobility aids are directed exclusively to verified accessible relief centers
                with verified capacity headroom.
              </p>
            </div>

            {/* Innovation 5 */}
            <div className="rounded-2xl border border-[#dfe6df] bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0ea] text-[#183d35]">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#183d35]">Event-Gated Privacy Architecture</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                Vulnerable citizens health diagnoses and home coordinates remain strictly hidden during peacetime.
                They unlock only when a coordinator initiates an active disaster alert for that ward,
                with complete audit logging for every record accessed.
              </p>
            </div>

            {/* Innovation 6 */}
            <div className="rounded-2xl border border-[#dfe6df] bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0ea] text-[#183d35]">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#183d35]">Confidential Concern Reporting</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                Evacuees and volunteers can submit confidential or completely anonymous safety reports
                regarding shelter conditions, medical shortages, or harassment, directly viewable by incident leadership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multilingual Voice Warning Showcase */}
      <section id="voice-alerts" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#28594b]">
                Inclusion by Design
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#183d35] sm:text-4xl">
                Reaching Basic Phones in 13 Indian Languages
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#52635d]">
                Smartphone apps fail during floods because batteries drain, mobile data towers crash, and elderly
                citizens often do not use touchscreen apps. Saathi-Evac broadcasts voice calls directly to standard
                feature phones, allowing citizens to report safety with simple keypad presses.
              </p>

              {/* Supported Languages Pills */}
              <div className="mt-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#183d35]">
                  Supported Dialects and Scripts:
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {languagesList.map((lang) => (
                    <span
                      key={lang.code}
                      className="rounded-lg border border-[#dfe6df] bg-white px-2.5 py-1 text-xs font-semibold text-[#183d35] shadow-xs"
                    >
                      {lang.name} ({lang.native})
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-relaxed text-emerald-950">
                <strong>Simulated Telephony Integration:</strong> In the current prototype, warning broadcasts are
                simulated with high-fidelity scripts and DTMF keypad logs. Integration points are ready for Twilio,
                Exotel, or Sarvam AI speech models.
              </div>
            </div>

            {/* Keypad Phone Simulation Box */}
            <div className="lg:col-span-6">
              <div className="mx-auto max-w-md rounded-3xl border-4 border-[#183d35] bg-[#183d35] p-5 shadow-2xl text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Incoming Emergency Call
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-white/60">00:42</span>
                </div>

                {/* Language Switch Tabs inside Call */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setActiveLangTab("hi")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${
                      activeLangTab === "hi"
                        ? "bg-white text-[#183d35]"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                  <button
                    onClick={() => setActiveLangTab("en")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${
                      activeLangTab === "en"
                        ? "bg-white text-[#183d35]"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    English
                  </button>
                </div>

                {/* Simulated Audio Box */}
                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#a9c5ae]">
                    Voice Broadcast Transcript:
                  </div>
                  <div className="mt-2 text-sm leading-relaxed font-medium">
                    {activeLangTab === "hi" ? (
                      <span>
                        "वार्ड 7 के लिए चेतावनी। बाढ़ का पानी बढ़ रहा है। आपके लिए मदद की व्यवस्था की जा रही है।
                        कृपया जहाँ हैं वहीं रहें और अपना फोन पास रखें। यदि आप सुरक्षित हैं तो 1 दबाएँ, और यदि मदद चाहिए तो 2 दबाएँ।"
                      </span>
                    ) : (
                      <span>
                        "Alert for Ward 7. Flood water is rising. Help is being arranged for you.
                        Please stay where you are and keep your phone close. Press 1 if you are safe. Press 2 if you need help."
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulated Keypad */}
                <div className="mt-5">
                  <div className="text-center text-xs text-white/70">
                    Beneficiary Keypad Response:
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedDemoKey("1")}
                      className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all ${
                        selectedDemoKey === "1"
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="text-xl font-black">1</span>
                      <span className="text-[11px]">Safe at Home</span>
                    </button>

                    <button
                      onClick={() => setSelectedDemoKey("2")}
                      className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all ${
                        selectedDemoKey === "2"
                          ? "border-rose-400 bg-rose-500/20 text-rose-300 ring-2 ring-rose-400"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="text-xl font-black">2</span>
                      <span className="text-[11px]">Need Rescue Help</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-center text-[11px] text-white/50">
                  {selectedDemoKey === "1" ? (
                    <span className="text-emerald-300">
                      Key 1 recorded: Resident marked safe confirmed. Rescue team notified.
                    </span>
                  ) : (
                    <span className="text-rose-300">
                      Key 2 recorded: Needs help flagged. Individual moved to top of rescue queue.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Triage Scoring Rulebook */}
      <section id="triage" className="border-t border-[#dfe6df] bg-[#faf9f5] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#28594b]">
              Algorithmic Transparency
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#183d35] sm:text-4xl">
              Published Triage Rules and Weights
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#52635d]">
              In life-or-death evacuations, black-box machine learning is unsafe.
              Saathi-Evac uses an explainable, audited scoring model published openly for disaster officials and humanitarian observers.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-[#dfe6df] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#183d35]">
                <thead className="border-b border-[#dfe6df] bg-[#eef1ec]/80 text-xs font-bold uppercase tracking-wider text-[#52635d]">
                  <tr>
                    <th scope="col" className="px-6 py-4">Vulnerability Need</th>
                    <th scope="col" className="px-6 py-4">Triage Priority Score</th>
                    <th scope="col" className="px-6 py-4">Operational Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfe6df]">
                  {scoringRules.map((rule, idx) => (
                    <tr
                      key={rule.need}
                      className={idx === scoringRules.length - 1 ? "bg-amber-50/50 font-semibold" : "hover:bg-slate-50"}
                    >
                      <td className="px-6 py-4 font-bold text-[#183d35]">{rule.need}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${
                            rule.points.includes("0 pts")
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-[#e8f0ea] text-[#183d35]"
                          }`}
                        >
                          {rule.points}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#52635d] sm:text-sm">{rule.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#dfe6df] bg-[#faf9f5] px-6 py-4 text-xs text-[#52635d]">
              Full rule definitions are queryable by any authorized system via the public endpoint{" "}
              <code className="rounded bg-white px-2 py-0.5 font-mono text-[#183d35] ring-1 ring-[#dfe6df]">
                GET /rules
              </code>
              .
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Command Stations */}
      <section id="stations" className="border-t border-[#dfe6df] bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#28594b]">
              Role Scoped Access
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#183d35] sm:text-4xl">
              Choose Your Response Station
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#52635d]">
              Each responder gets a dedicated, calm interface tailored to their exact responsibilities.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {/* Coordinator Station */}
            <div className="flex flex-col rounded-2xl border border-[#dfe6df] bg-[#faf9f5] p-7 transition-all hover:border-[#1f6f5c] hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f6f5c] text-white">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#183d35]">Coordinator</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                Declare ward disaster alerts, manage available shelters, inspect live fairness audits,
                and run silent helper sweep re-assignments across all response units.
              </p>
              <div className="mt-6 border-t border-[#dfe6df] pt-4 text-xs text-[#52635d]">
                Demo login: <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[#183d35]">coord / Coord@12345</code>
              </div>
              <Link
                href="/login/coordinator"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#1f6f5c] px-4 py-3 text-xs font-bold text-white transition-all hover:opacity-95"
              >
                <span>Open Command Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Volunteer Station */}
            <div className="flex flex-col rounded-2xl border border-[#dfe6df] bg-[#faf9f5] p-7 transition-all hover:border-[#6b8f3a] hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6b8f3a] text-white">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#183d35]">Volunteer Field App</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                Register vulnerable residents door to door, operate fully offline, record consent,
                view assigned neighbors, send heartbeats, and report safety concerns.
              </p>
              <div className="mt-6 border-t border-[#dfe6df] pt-4 text-xs text-[#52635d]">
                Demo login: <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[#183d35]">volunteer1 / Volunteer@12345</code>
              </div>
              <Link
                href="/login/volunteer"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#6b8f3a] px-4 py-3 text-xs font-bold text-white transition-all hover:opacity-95"
              >
                <span>Open Volunteer Station</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Rescue Station */}
            <div className="flex flex-col rounded-2xl border border-[#dfe6df] bg-[#faf9f5] p-7 transition-all hover:border-[#c2571a] hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c2571a] text-white">
                <Siren className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#183d35]">Rescue Team</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#52635d]">
                Inspect the urgent needs-ranked dispatch queue, view GPS coordinates during active events,
                track patient equipment needs, and request immediate team backup.
              </p>
              <div className="mt-6 border-t border-[#dfe6df] pt-4 text-xs text-[#52635d]">
                Demo login: <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[#183d35]">rescue / Rescue@12345</code>
              </div>
              <Link
                href="/login/rescue"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#c2571a] px-4 py-3 text-xs font-bold text-white transition-all hover:opacity-95"
              >
                <span>Open Rescue Dispatch</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/setup"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#28594b] underline underline-offset-4 hover:text-[#183d35]"
            >
              <span>First time setting up the platform? Create the root coordinator account</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-gradient-to-r from-[#183d35] via-[#28594b] to-[#183d35] py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold sm:text-4xl">
            Protect your community before floodwaters rise.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#e8f0ea] sm:text-base">
            Equip your district with transparent triage, native-language voice alerts, and offline volunteer coordination.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-[#a9c5ae] px-7 py-3.5 text-sm font-bold text-[#183d35] shadow-lg transition-all hover:bg-white hover:shadow-xl active:scale-95"
            >
              Sign In to Incident Command
            </Link>
            <Link
              href="/setup"
              className="rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Run First-Time Setup
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-[#dfe6df] bg-[#faf9f5] py-12 text-[#52635d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-[#183d35]/10">
                <img src="/logo.png" alt="Saathi-Evac Logo" className="h-full w-full object-contain" />
              </span>
              <div>
                <span className="block text-sm font-bold text-[#183d35]">Saathi-Evac</span>
                <span className="block text-xs text-[#52635d]">
                  When disaster strikes, no one should be left behind.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
              <Link href="/login" className="hover:text-[#183d35]">Portal Access</Link>
              <Link href="/setup" className="hover:text-[#183d35]">Setup</Link>
              <a href="#mission" className="hover:text-[#183d35]">Mission</a>
              <a href="#lifecycle" className="hover:text-[#183d35]">Architecture</a>
              <a href="#triage" className="hover:text-[#183d35]">Triage Rules</a>
            </div>
          </div>

          <div className="mt-8 border-t border-[#dfe6df] pt-6 text-center text-xs text-[#52635d]">
            Saathi-Evac Response System. Prototype Stage v0.4.0. Transparent, offline-first, fair disaster relief.
          </div>
        </div>
      </footer>
    </div>
  )
}