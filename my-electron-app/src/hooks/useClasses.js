import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../Auth/SupabaseClient'

let _cache = null // module-level cache so we only fetch once per session

export function useClasses() {
  const [classes, setClasses] = useState(_cache || [])
  const [loading, setLoading] = useState(!_cache)

  const fetchClasses = useCallback(async () => {
    if (_cache) { setClasses(_cache); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('classes')
      .select('id, name')
      .order('sort_order', { ascending: true })
    if (data) {
      _cache = data
      setClasses(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  // Returns just the name strings (drop-in replacement for CLASS_OPTIONS)
  const classNames = classes.map(c => c.name)

  return { classes, classNames, loading, fetchClasses }
}

/** Invalidate cache (call after adding/removing a class) */
export function invalidateClassCache() { _cache = null }
