# Saathi-Evac frontend (Next.js, from v0)

Works with the FastAPI backend in `../backend` (default http://127.0.0.1:8000, set in `.env.local`).

## Run
1. Backend running: `uvicorn app.main:app --reload` (in `backend`, venv active).
2. In this folder: `npm install` then `npm run dev`
3. Open http://localhost:3000
4. First time only: click **First-time setup** on the sign-in page to create the first coordinator.

Pages: Overview, Dispatch (map, queue, re-assignment log), People, Register person (offline-safe), My tasks,
Helpers (add, missed check-in, restore, sweep), Shelters, Events and alerts, Concerns, Fairness audit, Access audit,
Users, Rules and languages, First-time setup.

Phone on the same Wi-Fi: set `NEXT_PUBLIC_API_URL=http://<laptop-ip>:8000` in `.env.local`, run the backend with `--host 0.0.0.0`,
and `npm run dev -- --hostname 0.0.0.0`.
