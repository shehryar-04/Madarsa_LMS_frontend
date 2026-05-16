import { DEFAULT_LABELS } from './defaultLabels'

const CACHE_KEY = 'ui_labels_cache'

let _merged = null

/** Read labels from localStorage cache, merge with defaults. Works outside React. */
function loadLabels() {
  if (_merged) return _merged
  let cached = {}
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) cached = JSON.parse(raw)
  } catch { /* ignore */ }
  _merged = { ...DEFAULT_LABELS, ...cached }
  return _merged
}

/** Get a single label by key (for use outside React components) */
export function getLabel(key) {
  return loadLabels()[key] ?? key
}

/** Invalidate in-memory cache (call after refreshLabels) */
export function invalidateLabelCache() { _merged = null }
