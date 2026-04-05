import { useState, useCallback, useRef } from 'react'
import { supabase } from '../Auth/SupabaseClient'
import { PAGE_SIZE } from '../constants/student'

/** Fetch ALL rows of a single column, paginating past Supabase's 1000-row limit */
async function fetchAllColumn(column) {
  const batchSize = 1000
  let all = []
  let page = 0
  let hasMore = true

  while (hasMore) {
    const from = page * batchSize
    const { data, error } = await supabase
      .from('students')
      .select(column)
      .range(from, from + batchSize - 1)

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

    const { count: total } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    const classData = await fetchAllColumn('class_level')
    const byClass = classData.reduce((acc, item) => {
      const key = item.class_level || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const districtData = await fetchAllColumn('district')
    const districts = new Set(districtData.map(d => (d.district || '').trim()).filter(Boolean)).size

    setStats({ total: total || 0, byClass, districts })

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
    const { appliedSearch, filterType, filterDistrict, filterYear } = filters
    let query = supabase.from('students').select(selectStr, opts)

    if (appliedSearch?.trim()) {
      const term = `%${appliedSearch.trim()}%`
      query = query.or(`name.ilike.${term},father_name.ilike.${term},cnic.ilike.${term},district.ilike.${term}`)
    }
    if (filterType) query = query.eq('student_type', filterType)
    if (filterDistrict) query = query.ilike('district', filterDistrict)
    if (filterYear) query = query.ilike('entry_year', `${filterYear}%`)

    return query
  }, [])

  const fetchStudentPage = useCallback(async (page, filters) => {
    setListLoading(true)
    setError('')

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
