# Saathi-Evac Dashboard + Field App

React + Vite + Leaflet. Needs the backend running on port 8000.

## Run
`npm install` (first time), then `npm run dev`, open http://localhost:5173

## Roles
- coordinator / rescue: dashboard. Coordinator can also open the "Field app" from the header.
- volunteer: field app only (register people, become a helper, check in). English and Hindi.

## Test offline mode (laptop)
Chrome DevTools (F12) -> Network -> set "Offline". Register a person: it says "Saved on this phone".
Set back to "No throttling": it syncs by itself within seconds. Retries never create duplicates.

## Test on a phone (same Wi-Fi)
Backend: `uvicorn app.main:app --reload --host 0.0.0.0`
Dashboard: `npm run dev -- --host`, then open `http://<laptop-ip>:5173` on the phone (find the IP with `ipconfig`).
Install-to-home-screen and offline reload need HTTPS, which comes with deployment.
