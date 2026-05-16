import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { supabase } from '../Auth/SupabaseClient'
import { DEFAULT_LABELS } from '../constants/defaultLabels'

const CACHE_KEY = 'ui_labels_cache'
const CACHE_TS_KEY = 'ui_labels_cache_ts'

/** Read cached labels from localStorage */
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/** Write labels to localStorage cache */
function writeCache(labels) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(labels))
    localStorage.setItem(CACHE_TS_KEY, new Date().toISOString())
  } catch { /* storage full or blocked — ignore */ }
}

/** Merge: DB labels override defaults, defaults fill any gaps */
function mergeLabels(dbLabels) {
  return { ...DEFAULT_LABELS, ...dbLabels }
}

// ── Context so any component can access labels without prop drilling ──
const LabelsContext = createContext(null)

export function LabelsProvider({ children }) {
  const [labels, setLabels] = useState(() => {
    // On first render: use cache if available, else defaults
    const cached = readCache()
    return cached ? mergeLabels(cached) : { ...DEFAULT_LABELS }
  })
  const [loading, setLoading] = useState(false)

  /** Fetch all labels from Supabase ui_labels table and update cache */
  const refreshLabels = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ui_labels')
        .select('key, value')

      if (error) {
        console.warn('[useUiLabels] fetch error, using cache/defaults:', error.message)
        setLoading(false)
        return
      }

      // Convert array of {key, value} to flat object
      const dbLabels = {}
      for (const row of (data || [])) {
        dbLabels[row.key] = row.value
      }

      const merged = mergeLabels(dbLabels)
      setLabels(merged)
      writeCache(dbLabels) // cache only DB values, not merged defaults
    } catch (err) {
      console.warn('[useUiLabels] network error, using cache/defaults:', err.message)
    }
    setLoading(false)
  }, [])

  // Fetch on mount (app startup)
  useEffect(() => { refreshLabels() }, [refreshLabels])

  /** Get a label by key. Returns the value or the key itself as fallback. */
  const t = useCallback((key) => {
    return labels[key] ?? key
  }, [labels])

  /** Get a JSON-parsed label (for arrays/objects stored as JSON strings) */
  const tJSON = useCallback((key) => {
    const val = labels[key]
    if (!val) return null
    if (typeof val === 'object') return val // already parsed
    try { return JSON.parse(val) } catch { return val }
  }, [labels])

  /** Get all report field labels as { field_name: label } */
  const reportFields = useCallback(() => {
    const result = {}
    for (const [k, v] of Object.entries(labels)) {
      if (k.startsWith('field.')) {
        result[k.replace('field.', '')] = v
      }
    }
    return result
  }, [labels])

  return (
    <LabelsContext.Provider value={{ labels, t, tJSON, reportFields, refreshLabels, loading }}>
      {children}
    </LabelsContext.Provider>
  )
}

/** Hook to access labels from any component */
export function useLabels() {
  const ctx = useContext(LabelsContext)
  if (!ctx) throw new Error('useLabels must be used within <LabelsProvider>')
  return ctx
}
