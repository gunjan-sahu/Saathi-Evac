import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { enqueue, flush, getQueue, getFailed, clearFailed, newId } from "../offline.js";
import { STR } from "../i18n.js";
import "../field.css";

const NEEDS = ["bedridden", "mobility_aid", "oxygen_dependent", "dialysis", "hearing_limit", "vision_limit", "infant_or_pregnancy", "lives_alone"];
const blankPerson = (keep = {}) => ({
  name: "", age: "", phone: "", gender: "", prefers_women_team: false, consent: false,
  lat: "", lon: "", ward: "", language: "hi", ...Object.fromEntries(NEEDS.map((n) => [n, false])), ...keep,
});
const DEFAULT_LANGS = [{ code: "hi", name: "हिन्दी" }, { code: "en", name: "English" }];
const blankHelper = { name: "", phone: "", lat: "", lon: "", capacity: 2, women_led: false, stretcher: false, medical: false };

// Sends one saved item to the server. Network errors are kept for later by flush().
async function send(item) {
  if (item.kind === "person") return api.registerPerson(item.payload);
  if (item.kind === "helper") {
    try { return await api.addHelper(item.payload); }
    catch (e) { if (/already have/i.test(e.message)) return; throw e; }
  }
  if (item.kind === "status") return api.setStatus(item.payload.id, item.payload.status);
  if (item.kind === "heartbeat") return api.heartbeat(item.payload.id);
}

export default function FieldApp({ user, refreshUser }) {
  const [lang, setLang] = useState(localStorage.getItem("saathi_lang") || "en");
  const t = STR[lang];
  const [tab, setTab] = useState("register");
  const [form, setForm] = useState(blankPerson());
  const [hform, setHform] = useState(blankHelper);
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(getQueue().length);
  const [failed, setFailed] = useState(getFailed());
  const [msg, setMsg] = useState("");
  const [tasks, setTasks] = useState([]);
  const [people, setPeople] = useState([]);
  const syncing = useRef(false);
  const [langs, setLangs] = useState(() => { try { return JSON.parse(localStorage.getItem("saathi_langs")) || DEFAULT_LANGS; } catch { return DEFAULT_LANGS; } });

  const changeLang = (l) => { setLang(l); localStorage.setItem("saathi_lang", l); };
  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setH = (k) => (e) => setHform((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const loadLists = useCallback(async () => {
    try {
      const [p, a] = await Promise.all([api.people(), user.helper_id ? api.myAssignments() : Promise.resolve([])]);
      setPeople(p);
      setTasks(a);
    } catch { /* offline: keep what we have */ }
  }, [user.helper_id]);

  const sync = useCallback(async () => {
    if (syncing.current || !getQueue().length) return;
    syncing.current = true;
    const r = await flush(send);
    syncing.current = false;
    setPending(r.pending);
    setFailed(getFailed());
    if (r.done) { setMsg(STR[localStorage.getItem("saathi_lang") || "en"].synced.replace("{n}", r.done)); refreshUser(); loadLists(); }
  }, [refreshUser, loadLists]);

  useEffect(() => {
    const on = () => { setOnline(true); sync(); };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    loadLists();
    const id = setInterval(() => { if (navigator.onLine) { sync(); loadLists(); } }, 10000);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); clearInterval(id); };
  }, [sync, loadLists]);

  useEffect(() => {
    api.languages().then((l) => { setLangs(l); localStorage.setItem("saathi_langs", JSON.stringify(l)); }).catch(() => {});
  }, []);

  const later = (item, text) => { enqueue(item); setPending(getQueue().length); setMsg(text); };

  function useGps(setter) {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setter((f) => ({ ...f, lat: pos.coords.latitude.toFixed(5), lon: pos.coords.longitude.toFixed(5) })),
      () => setMsg(t.gpsFail)
    );
  }

  async function submitPerson(e) {
    e.preventDefault();
    if (!form.consent) return setMsg(t.errConsent);
    const lat = parseFloat(form.lat), lon = parseFloat(form.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return setMsg(t.errLocation);
    const payload = { ...form, age: Number(form.age), lat, lon, gender: form.gender || null, client_id: newId() };
    try {
      await api.registerPerson(payload);
      setMsg(t.savedOnline);
      loadLists();
    } catch (err) {
      if (err.network) later({ kind: "person", payload }, t.savedOffline);
      else return setMsg("Error: " + err.message);
    }
    setForm(blankPerson({ ward: form.ward, language: form.language }));
  }

  async function submitHelper(e) {
    e.preventDefault();
    const lat = parseFloat(hform.lat), lon = parseFloat(hform.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return setMsg(t.errLocation);
    const payload = {
      name: hform.name, phone: hform.phone, lat, lon, capacity: Number(hform.capacity), women_led: hform.women_led,
      skills: [hform.stretcher && "stretcher", hform.medical && "medical"].filter(Boolean).join(","),
    };
    try {
      await api.addHelper(payload);
      setMsg(t.savedOnline);
      refreshUser();
    } catch (err) {
      if (err.network) later({ kind: "helper", payload }, t.savedOffline);
      else setMsg("Error: " + err.message);
    }
  }

  async function checkin(a, status) {
    try { await api.setStatus(a.assignment_id, status); setMsg(t.sent); loadLists(); }
    catch (err) {
      if (err.network) later({ kind: "status", payload: { id: a.assignment_id, status } }, t.savedOffline);
      else setMsg("Error: " + err.message);
    }
  }

  async function alive() {
    try { await api.heartbeat(user.helper_id); setMsg(t.sent); }
    catch (err) {
      if (err.network) later({ kind: "heartbeat", payload: { id: user.helper_id } }, t.savedOffline);
      else setMsg("Error: " + err.message);
    }
  }

  const check = (label, checked, onChange) => (
    <label className="check"><input type="checkbox" checked={checked} onChange={onChange} />{label}</label>
  );

  return (
    <div className="field">
      <div className="syncbar">
        <span><i className={"dot " + (online ? "on" : "off")} />{online ? t.online : t.offline}
          {pending > 0 && <b> · {pending} {t.pending}</b>}</span>
        <span className="langsw">
          <button className={"btn" + (lang === "en" ? " primary" : "")} onClick={() => changeLang("en")}>EN</button>
          <button className={"btn" + (lang === "hi" ? " primary" : "")} onClick={() => changeLang("hi")}>हिं</button>
          {pending > 0 && <button className="btn" onClick={sync}>{t.syncNow}</button>}
        </span>
      </div>
      {msg && <div className="msg" style={{ marginBottom: 12 }}>{msg}</div>}
      {failed.length > 0 && (
        <div className="error">{t.failedTitle}: {failed.map((f) => `${f.kind} (${f.error})`).join(", ")}{" "}
          <button className="link" onClick={() => { clearFailed(); setFailed([]); }}>{t.dismiss}</button></div>
      )}
      <div className="tabs">
        {[["register", t.register], ["tasks", t.tasks], ["people", t.people], ["helper", t.helper]].map(([k, label]) => (
          <button key={k} className={"tab" + (tab === k ? " active" : "")} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === "register" && (
        <form className="card form" onSubmit={submitPerson}>
          <label>{t.name}</label><input type="text" value={form.name} onChange={setF("name")} required />
          <div className="two">
            <div><label>{t.age}</label><input type="number" min="0" max="120" value={form.age} onChange={setF("age")} required /></div>
            <div><label>{t.phone}</label><input type="tel" value={form.phone} onChange={setF("phone")} required /></div>
          </div>
          <div className="two">
            <div><label>{t.ward}</label><input type="text" value={form.ward} onChange={setF("ward")} required /></div>
            <div><label>{t.language}</label>
              <select value={form.language} onChange={setF("language")}>{langs.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}</select>
              {(langs.find((l) => l.code === form.language)?.review_status || "").toLowerCase().includes("pending") && <div className="note">AI-generated translation, pending native-speaker review.</div>}</div>
          </div>
          <label>{t.location}</label>
          <button type="button" className="btn" onClick={() => useGps(setForm)}>{t.useGps}</button>
          <div className="two">
            <input type="text" inputMode="decimal" placeholder={t.lat} value={form.lat} onChange={setF("lat")} />
            <input type="text" inputMode="decimal" placeholder={t.lon} value={form.lon} onChange={setF("lon")} />
          </div>
          <label>{t.needs}</label>
          {NEEDS.map((n) => <div key={n}>{check(t.n[n], form[n], setF(n))}</div>)}
          {check(t.prefersWomen, form.prefers_women_team, setF("prefers_women_team"))}
          <label>{t.gender}</label>
          <select value={form.gender} onChange={setF("gender")}>
            <option value="">-</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option>
          </select>
          <div className="note">{t.genderNote}</div>
          <div className="consent"><b>{t.consentTitle}</b><p>{t.consentText}</p>{check(t.consentCheck, form.consent, setF("consent"))}</div>
          <button className="btn primary big">{t.save}</button>
        </form>
      )}

      {tab === "tasks" && (
        <div className="card">
          {!user.helper_id ? <p>{t.needHelperFirst}</p> : (
            <>
              <button className="btn big" onClick={alive}>{t.imAlive}</button>
              {tasks.length === 0 && <p className="muted">{t.noTasks}</p>}
              {tasks.map((a) => (
                <div key={a.assignment_id} className="task" style={{ marginTop: 10 }}>
                  <div><b>{a.person.name}</b> <span className="muted">{a.person.ward}</span> <span className="chip gray">{t.s[a.status] || a.status}</span></div>
                  {a.person.health_visible
                    ? <div className="chips" style={{ marginTop: 6 }}>{a.person.reasons.map((r) => <span key={r} className="chip amber">{r}</span>)}</div>
                    : <div className="locked" style={{ marginTop: 6 }}>{t.healthHidden}</div>}
                  <div className="meta"><span>{t.helpers}: {a.person.helpers.join(", ")}</span><span>{t.shelter}: {a.person.shelter || "-"}</span></div>
                  <div className="actions">
                    <button className="btn" onClick={() => checkin(a, "on_my_way")}>{t.onMyWay}</button>
                    <button className="btn primary" onClick={() => checkin(a, "reached")}>{t.reached}</button>
                    <button className="btn danger" onClick={() => checkin(a, "need_backup")}>{t.needBackup}</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === "people" && (
        <div className="card">
          {people.length === 0 && <p className="muted">{t.noPeople}</p>}
          {people.map((p) => (
            <div key={p.id} className="row"><b>{p.name}</b><span className="muted">{p.ward}</span>
              <span className="muted">{t.helpers}: {p.helpers.join(", ") || "-"}</span></div>
          ))}
        </div>
      )}

      {tab === "helper" && (
        <div className="card">
          {user.helper_id ? <p>{t.profileActive}</p> : (
            <form className="form" onSubmit={submitHelper}>
              <h3 style={{ margin: 0 }}>{t.helperTitle}</h3>
              <label>{t.name}</label><input type="text" value={hform.name} onChange={setH("name")} required />
              <label>{t.phone}</label><input type="tel" value={hform.phone} onChange={setH("phone")} required />
              <label>{t.location}</label>
              <button type="button" className="btn" onClick={() => useGps(setHform)}>{t.useGps}</button>
              <div className="two">
                <input type="text" inputMode="decimal" placeholder={t.lat} value={hform.lat} onChange={setH("lat")} />
                <input type="text" inputMode="decimal" placeholder={t.lon} value={hform.lon} onChange={setH("lon")} />
              </div>
              <label>{t.capacity}</label><input type="number" min="1" max="10" value={hform.capacity} onChange={setH("capacity")} />
              <label>{t.skills}</label>
              {check(t.stretcher, hform.stretcher, setH("stretcher"))}
              {check(t.medical, hform.medical, setH("medical"))}
              {check(t.womenLed, hform.women_led, setH("women_led"))}
              <button className="btn primary big">{t.saveHelper}</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
