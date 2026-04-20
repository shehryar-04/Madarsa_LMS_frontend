import { useState, useCallback } from 'react'
import { supabase } from '../Auth/SupabaseClient'
import { PAGE_SIZE } from '../constants/student'

const isElectron = () => typeof window !== 'undefined' && Boolean(window.localDb)

/** Fetch ALL rows of a single column, paginating past Supabase's 1000-row limit */
async function fetchAllColumn(column, extraFilters = {}) {
  const batchSize = 1000
  let all = []
  let page = 0
  let hasMore = true

  while (hasMore) {
    const from = page * batchSize
    let query = supabase.from('students').select(column).range(from, from + batchSize - 1)
    // Apply any extra equality filters (e.g. { status: 'active' })
    for (const [key, val] of Object.entries(extraFilters)) {
      query = query.eq(key, val)
    }
    const { data, error } = await query
    if (error || !data) break
    all = all.concat(data)
    hasMore = data.length === batchSize
    page++
  }
  return all
}

/** Strip trailing ".0" from year strings like "2020.0" */
function normalizeYear(val) {
  return val ? String(val).trim().replace(/\.0$/, '') : ''
}

export function useStudentData() {
  // ── Dashboard stats ──
  const [stats, setStats] = useState({ total: 0, byClass: {}, districts: 0 })
  const [recentStudents, setRecentStudents] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

  // ── Paginated list ──
  const [students, setStudents] = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [listLoading, setListLoading] = useState(false)

  // ── Filter options ──
  const [districtOptions, setDistrictOptions] = useState([])
  const [yearOptions, setYearOptions] = useState([])

  // ── Errors ──
  const [error, setError] = useState('')

  const fetchDashboardStats = useCallback(async () => {
    setStatsLoading(true)

    // Count ALL students (active + inactive) for dashboard totals
    const { count: total } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    // Class breakdown — all students
    const classData = await fetchAllColumn('class_level')
    const byClass = classData.reduce((acc, item) => {
      const key = item.class_level || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    // District count — all students
    const districtData = await fetchAllColumn('district')
    const districts = new Set(districtData.map(d => (d.district || '').trim()).filter(Boolean)).size

    setStats({ total: total || 0, byClass, districts })

    // Recent students — all statuses
    const { data: recent } = await supabase
      .from('students')
      .select('*')
      .order('id', { ascending: false })
      .limit(5)

    setRecentStudents(recent || [])
    setStatsLoading(false)
  }, [])

  const fetchFilterOptions = useCallback(async () => {
    const distData = await fetchAllColumn('district')
    const uniqueDistricts = [...new Set(distData.map(d => (d.district || '').trim()).filter(Boolean))].sort()
    setDistrictOptions(uniqueDistricts)

    const yearData = await fetchAllColumn('entry_year')
    const uniqueYears = [...new Set(
      yearData.map(d => normalizeYear(d.entry_year)).filter(Boolean)
    )].sort((a, b) => Number(a) - Number(b))
    setYearOptions(uniqueYears)
  }, [])

  /** Build a filtered Supabase query */
  const buildFilteredQuery = useCallback((selectStr, opts = {}, filters = {}) => {
    const { appliedSearch, filterType, filterDistrict, filterYear, filterClass, filterRoom, showInactive } = filters
    let query = supabase.from('students').select(selectStr, opts)

    if (!showInactive) query = query.eq('status', 'active')

    if (appliedSearch?.trim()) {
      const term = appliedSearch.trim()
      const likeTerm = `%${term}%`
      const orClause = `name.ilike.${likeTerm},father_name.ilike.${likeTerm},district.ilike.${likeTerm},serial_no.ilike.${likeTerm}`
      query = query.or(orClause)
    }
    if (filterType)     query = query.eq('student_type', filterType)
    if (filterDistrict) query = query.ilike('district', filterDistrict)
    if (filterYear)     query = query.ilike('entry_year', `${filterYear}%`)
    if (filterClass)    query = query.eq('class_level', filterClass)
    if (filterRoom)     query = query.eq('room_number', filterRoom)

    return query
  }, [])

  const fetchStudentPage = useCallback(async (page, filters) => {
    setListLoading(true)
    setError('')

    // ── Offline fallback: read from local JSON backup ──
    if (!navigator.onLine && isElectron()) {
      try {
        const { appliedSearch, filterType, filterDistrict, filterYear, filterClass, filterRoom, showInactive } = filters
        let rows = appliedSearch?.trim()
          ? await window.localDb.searchStudents(appliedSearch.trim())
          : await window.localDb.filterStudents({ filterType, filterDistrict, filterYear, filterRoom })

        if (!showInactive) rows = rows.filter(r => r.status !== 'inactive')
        if (filterClass) rows = rows.filter(r => r.class_level === filterClass)

        const total = rows.length
        const from = (page - 1) * PAGE_SIZE
        setStudents(rows.slice(from, from + PAGE_SIZE))
        setTotalStudents(total)
      } catch (err) {
        setError('Offline: could not read local backup — ' + err.message)
      }
      setListLoading(false)
      return
    }

    // ── Online: fetch from Supabase ──
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count, error: fetchErr } = await buildFilteredQuery('*', { count: 'exact' }, filters)
      .order('id', { ascending: false })
      .range(from, to)

    if (fetchErr) {
      setError(fetchErr.message)
    } else {
      setStudents(data || [])
      setTotalStudents(count || 0)
    }
    setListLoading(false)
  }, [buildFilteredQuery])

  return {
    stats, recentStudents, statsLoading,
    students, totalStudents, listLoading,
    districtOptions, yearOptions,
    error, setError,
    fetchDashboardStats, fetchFilterOptions,
    fetchStudentPage, buildFilteredQuery,
  }
}
