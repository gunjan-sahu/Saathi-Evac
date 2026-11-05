// A tiny offline queue kept in the phone's storage. Items are sent when the network returns.
const KEY = "saathi_queue";
const FAILED = "saathi_failed";
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
export const getQueue = () => read(KEY);
export const getFailed = () => read(FAILED);
export const clearFailed = () => write(FAILED, []);

export function enqueue(item) {
  const q = read(KEY);
  q.push({ ...item, id: newId(), at: Date.now() });
  write(KEY, q);
}

// send(item) must throw an error with .network = true when the server cannot be reached.
export async function flush(send) {
  const q = read(KEY);
  const rest = [];
  const failed = read(FAILED);
  let done = 0;
  let stop = false;
  for (const item of q) {
    if (stop) { rest.push(item); continue; }
    try {
      await send(item);
      done++;
    } catch (e) {
      if (e.network || e.message === "SESSION") { rest.push(item); stop = true; }
      else failed.push({ kind: item.kind, error: e.message, at: item.at });
    }
  }
  write(KEY, rest);
  write(FAILED, failed);
  return { done, pending: rest.length };
}
