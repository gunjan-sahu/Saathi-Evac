// On a phone the page address is the laptop's address, so the API is on the same host, port 8000.
const BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
let token = sessionStorage.getItem("saathi_token");

export const getToken = () => token;
export function setToken(t) {
  token = t;
  if (t) sessionStorage.setItem("saathi_token", t);
  else sessionStorage.removeItem("saathi_token");
}

async function req(path, method = "GET", body) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error("Cannot reach the server. Is the backend running?");
    err.network = true; // lets the field app save the action for later
    throw err;
  }
  if (res.status === 401 && token) throw new Error("SESSION");
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    const detail = Array.isArray(d.detail) ? d.detail.map((x) => x.msg).join("; ") : d.detail;
    throw new Error(typeof detail === "string" ? detail : `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  login: (username, password) => { token = null; return req("/auth/login", "POST", { username, password }); },
  me: () => req("/auth/me"),
  queue: () => req("/dispatch/queue"),
  helpers: () => req("/helpers"),
  shelters: () => req("/dispatch/shelters"),
  reassignments: () => req("/dispatch/reassignments"),
  events: () => req("/events"),
  audit: () => req("/dispatch/audit"),
  rules: () => req("/rules"),
  languages: () => req("/languages"),
  alert: (ward) => req("/alerts", "POST", { ward }),
  endEvent: (id) => req(`/events/${id}/end`, "POST"),
  missed: (id) => req(`/helpers/${id}/missed-checkin`, "POST"),
  heartbeat: (id) => req(`/helpers/${id}/heartbeat`, "POST"),
  sweep: (m) => req(`/helpers/sweep?minutes=${m}`, "POST"),
  // field app
  registerPerson: (payload) => req("/people", "POST", payload),
  addHelper: (payload) => req("/helpers", "POST", payload),
  people: () => req("/people"),
  myAssignments: () => req("/helpers/me/assignments"),
  setStatus: (id, status) => req(`/helpers/assignments/${id}/status?status=${status}`, "POST"),
};

// The server sends UTC times without a "Z"; add it so the browser shows local time.
export function fmtTime(t) {
  if (!t) return "";
  const s = /Z$|[+-]\d\d:?\d\d$/.test(t) ? t : t + "Z";
  return new Date(s).toLocaleTimeString();
}
