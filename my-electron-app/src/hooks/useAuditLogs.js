import { useState, useCallback } from 'react'
import { supabase } from '../Auth/SupabaseClient'

const PAGE_SIZE = 50

export function useAuditLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchLogs = useCallback(async ({
    page = 1,
    filterUser = '',
    filterTable = '',
    filterAction = '',
    filterRecordId = '',
    dateFrom = '',
    dateTo = '',
  } = {}) => {
    setLoading(true)
    setError('')

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('audit_logs')
      .select(
        'id, table_name, record_id, action, old_data, new_data, changed_by, changed_at',
        { count: 'exact' }
      )
      .order('changed_at', { ascending: false })
      .range(from, to)

    if (filterUser)     query = query.eq('changed_by', filterUser)
    if (filterTable)    query = query.eq('table_name', filterTable)
    if (filterAction)   query = query.eq('action', filterAction)
    if (filterRecordId) query = query.eq('record_id', filterRecordId.trim())
    if (dateFrom)       query = query.gte('changed_at', dateFrom)
    if (dateTo)         query = query.lte('changed_at', dateTo + 'T23:59:59Z')

    const { data, count, error: fetchErr } = await query

    if (fetchErr) {
      setError(fetchErr.message)
    } else {
      setLogs(data || [])
      setTotal(count || 0)
    }
    setLoading(false)
  }, [])

  // Fetch distinct admin users who have audit entries
  const fetchAdminUsers = useCallback(async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('changed_by')
      .not('changed_by', 'is', null)
    if (!data) return []
    const unique = [...new Set(data.map(r => r.changed_by))]
    return unique
  }, [])

  return { logs, total, loading, error, fetchLogs, fetchAdminUsers, PAGE_SIZE }
}
