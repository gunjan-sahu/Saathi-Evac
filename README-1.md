# Saathi-Evac

**Live, offline, fair evacuation for people who cannot self-evacuate.**

Shakti Hackathon · Theme: Natural Disaster Safety + AI-Agentic Solutions

> Status: proposed design. Update with what is actually built, and disclose what existed before the hackathon.

## Problem
Elderly, bedridden and disabled people are warned last and carried last in floods and cyclones. They rarely use apps, and shelters add risks (separated families, unsafe sanitation, gender-based violence).

## Solution
Volunteers register at-risk people in person. An AI agent then warns them, coordinates helpers offline, re-assigns helpers live, and sends rescue teams a needs-ranked queue.

## Features

**1. Registration (volunteer app)**
- In-person registration in local language with voice input
- Needs: mobility aid, medical dependence (oxygen, dialysis), hearing/vision limits, infant/pregnancy, living alone
- 2-3 helpers per person, with consent and a preferred-helper option
- Home location pin and nearest safe shelter
- Works offline and syncs later

**2. Warning**
- Triggered by official alerts (CAP feeds) or manual officer trigger
- Automated voice call in the local language (works on basic phones), SMS fallback
- Call confirms "Are you safe? Is help on the way?" with keypad or voice reply
- Helpers and family are notified in parallel

**3. Offline coordination**
- Bluetooth/Wi-Fi mesh between helper phones when towers fail
- Helper check-in, "on my way", "reached", "need backup" status
- **Live re-assignment:** if a helper is unreachable, late, absent or in danger, the agent assigns the next best helper or volunteer

**4. Fair triage**
- Transparent rule-based priority score from needs and risk only
- Gender is never an input; every ranking shows its reasons
- Exposure factors (alone, separated, unsafe sanitation) raise risk for anyone
- Audit view to compare outcomes across gender and age groups

**5. Dispatch and shelter**
- Needs-specific queue for rescue teams (e.g., "2 bedridden, 1 oxygen-dependent, ward 7")
- Shelter matching: separate sanitation and sleeping areas, accessibility, capacity
- Helper pairing follows the person's preference (e.g., women-led team on request)
- Confidential concern reporting through a volunteer or voice line

**6. Rescue-team dashboard**
- Live map of people, helpers and status
- Priority queue with reasons, re-assignment log, shelter occupancy

## Tech stack (proposed)

| Layer | Technology |
|---|---|
| Volunteer/helper app | Android (Kotlin) or Flutter; local database (SQLite/Room) for offline use |
| Offline mesh | Android Nearby Connections API / BLE + Wi-Fi Direct |
| Backend | Python, FastAPI, PostgreSQL (PostGIS for location), Redis for queues |
| Agents | Python orchestration (Warning, Matching/Re-assignment, Triage, Shelter agents) |
| Scoring | Rule-based, explainable (no black-box model); weights set with NGO/NDMA guidance |
| Language/voice | LLM for generating voice scripts; speech-to-text and text-to-speech for Indian languages (e.g., Sarvam AI) |
| Voice/SMS | IVR/SMS provider (e.g., Twilio or an Indian provider) |
| Maps and routing | OpenStreetMap, OSRM or OpenRouteService |
| Alerts | CAP feeds (e.g., NDMA Sachet), weather/flood data |
| Dashboard | React with Leaflet or MapLibre |
| Security | Encryption at rest and in transit, role-based access, consent records |

## Architecture
Inputs (alerts, registrations, helper status) → Agents (warning, matching, triage, shelter) → Outputs (voice/SMS, mesh, dashboard).

## Data and privacy
- Collect only what rescue needs; record consent at registration
- Health details visible only to assigned helpers and rescue teams during an event
- Do not store sensitive personal data in demo/test data
- Publish scoring rules so officials and NGOs can audit them

## Roadmap
1. **Prototype:** simulated flood in one ward, a few phones, one dashboard
2. **Pilot:** one village with ASHA/panchayat volunteers and drills
3. **Scale:** connect to state disaster alerts and publish scoring rules for audit

## Future ideas
- Predictive pre-positioning of helpers before a flood peaks
- Integration with ambulance and relief-supply dispatch
- Post-disaster check-ins and recovery tracking
- Drills mode so communities practise the plan before disasters

## Success metrics (targets set in the pilot)
Reach before deadline, helper re-assignment time, fairness across groups, share placed in safe shelters.

## Limits
- Novelty is based on a limited public search; re-verify before claiming "first"
- Helper registration is the hardest part to scale

## Setup
_Add install and run steps once the code exists._
