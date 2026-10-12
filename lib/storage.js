const HISTORY_KEY = "chemcheck_history_v1";
const CURRENT_KEY = "chemcheck_current_v1";
const MAX_HISTORY = 50;

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

export function getHistory() {
  return readJson(HISTORY_KEY, []);
}

export function saveReport(report) {
  const list = getHistory().filter((r) => r.id !== report.id);
  list.unshift(report);
  writeJson(HISTORY_KEY, list.slice(0, MAX_HISTORY));
  writeJson(CURRENT_KEY, report);
}

export function getCurrentReport() {
  return readJson(CURRENT_KEY, null);
}

export function setCurrentReport(report) {
  writeJson(CURRENT_KEY, report);
}

export function deleteReport(id) {
  const list = getHistory().filter((r) => r.id !== id);
  writeJson(HISTORY_KEY, list);
  const current = getCurrentReport();
  if (current && current.id === id) {
    window.localStorage.removeItem(CURRENT_KEY);
  }
}

export function clearHistory() {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
    window.localStorage.removeItem(CURRENT_KEY);
  } catch (error) {
    return;
  }
}
