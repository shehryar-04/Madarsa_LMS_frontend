import React, { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../Auth/SupabaseClient'
import html2pdf from 'html2pdf.js'
import SanadDashboard from './SanadDashboard'
import './Dashboard.css'

const initialStudent = {
  student_type: 'kutub',
  serial_no: '',
  entry_year: '',
  name: '',
  father_name: '',
  dob_raw: '',
  dob: '',
  class_level: '',
  district: '',
  address: '',
  residential_status: '',
  cnic: '',
  guardian_phone: '',
  form_no: '',
  phone: '',
  source_sheet: '',
  source_row: '',
  tareekh_daakhla: '',
  tareekh_ijaara: '',
  guardian_relation: '',
  guardian_cnic: '',
  room_number: '',
  guardian_name: '',
  student_image: '',
  student_image_file: null,
}

const STUDENT_TYPES = ['kutub', 'naazrah', 'hifz', 'fuzala', 'sanad']
const PAGE_SIZE = 50

const REPORT_FIELDS = {
  student_type: 'Student Type',
  serial_no: 'Serial No',
  entry_year: 'Entry Year',
  name: 'Name',
  father_name: 'Father Name',
  dob_raw: 'DOB Raw',
  dob: 'DOB',
  class_level: 'Class',
  district: 'District',
  address: 'Address',
  residential_status: 'Resident Status',
  cnic: 'CNIC',
  guardian_phone: 'Guardian Phone',
  form_no: 'Form No',
  phone: 'Phone',
  source_sheet: 'Source Sheet',
  source_row: 'Source Row',
  tareekh_daakhla: 'Tareekh Daakhla',
  tareekh_ijaara: 'Tareekh Ijaara',
  guardian_relation: 'Guardian Relation',
  guardian_cnic: 'Guardian CNIC',
  room_number: 'Room Number',
  guardian_name: 'Guardian Name',
}

const StudentFormFields = ({ formState, onChange, onFileChange }) => {
  return (
    <>
      <div className="form-section">
        <h4 className="form-section-title">👤 Basic Information — بنیادی معلومات</h4>
        <div className="form-grid">
          <label className="form-label form-label-wide">
            <span>Student Image (تصویر طالب علم)</span>
            <input type="file" accept="image/*" onChange={e => onFileChange && onFileChange('student_image_file', e.target.files[0])} />
            {formState.student_image && !formState.student_image_file && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--dash-green)' }}>✓ Image locally captured in bucket</div>
            )}
          </label>
          <label className="form-label">
            <span>Full Name (نام) *</span>
            <input name="name" value={formState.name || ''} onChange={onChange} required placeholder="e.g. محمد عدنان" dir="auto" />
          </label>
          <label className="form-label">
            <span>Father's Name (ولدیت) *</span>
            <input name="father_name" value={formState.father_name || ''} onChange={onChange} required placeholder="e.g. محمد یوسف" dir="auto" />
          </label>
          <label className="form-label">
            <span>Date of Birth (تاریخ پیدائش)</span>
            <input type="date" name="dob" value={formState.dob || ''} onChange={onChange} />
          </label>
          <label className="form-label">
            <span>Student CNIC / B-Form No.</span>
            <input name="cnic" value={formState.cnic || ''} onChange={onChange} required placeholder="e.g. 35201-1234567-1" />
          </label>
          <label className="form-label">
            <span>Phone Number (فون نمبر)</span>
            <input name="phone" value={formState.phone || ''} onChange={onChange} placeholder="03XX-XXXXXXX" />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h4 className="form-section-title">🎓 Enrollment Details — تفصیلات داخلہ</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Student Type *</span>
            <select name="student_type" value={formState.student_type || ''} onChange={onChange} required>
              <option value="">— Select Type —</option>
              {STUDENT_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>Class / Level (درجہ)</span>
            <select name="class_level" value={formState.class_level || ''} onChange={onChange}>
              <option value="">— Select Class —</option>
              <option value="عالمہ ثانیہ">عالمہ ثانیہ</option>
              <option value="عالمہ اولیٰ">عالمہ اولیٰ (written as "3", follows "1")</option>
              <option value="عالیہ ثانیہ">عالیہ ثانیہ</option>
              <option value="عالیہ اولیٰ">عالیہ اولیٰ</option>
              <option value="خاصہ ثانیہ">خاصہ ثانیہ</option>
              <option value="خاصہ اولیٰ">خاصہ اولیٰ</option>
              <option value="عامہ ثالثہ">عامہ ثالثہ</option>
              <option value="عامہ ثانیہ کمپیوٹر سائنس">عامہ ثانیہ کمپیوٹر سائنس (Computer Science)</option>
              <option value="عامہ ثانیہ بائیو سائنس">عامہ ثانیہ بائیو سائنس (Bio Science)</option>
              <option value="عامہ ثانیہ آرٹس">عامہ ثانیہ آرٹس (Arts)</option>
              <option value="دراسات دینیہ اول">دراسات دینیہ اول</option>
              <option value="دراسات دینیہ دوم">دراسات دینیہ دوم</option>
              <option value="عامہ اولیٰ الف">عامہ اولیٰ الف</option>
              <option value="عامہ اولیٰ کمپیوٹر سائنس">عامہ اولیٰ کمپیوٹر سائنس</option>
              <option value="عامہ اولیٰ بائیو سائنس">عامہ اولیٰ بائیو سائنس</option>
              <option value="عامہ اولیٰ آرٹس">عامہ اولیٰ آرٹس</option>
              <option value="اعدادیہ برائے خاصہ اولیٰ">اعدادیہ برائے خاصہ اولیٰ</option>
              <option value="متوسطہ ثانیہ (8th)">متوسطہ ثانیہ (8th)</option>
              <option value="متوسطہ ثانیہ (7th)">متوسطہ ثانیہ (7th)</option>
              <option value="متوسطہ اولیٰ (6th)">متوسطہ اولیٰ (6th)</option>
              <option value="حفظ">حفظ</option>
              <option value="ناظرہ">ناظرہ</option>
            </select>
          </label>
          <label className="form-label">
            <span>Entry Year (سالِ داخلہ)</span>
            <input name="entry_year" value={formState.entry_year || ''} onChange={onChange} placeholder="e.g. 2024" />
          </label>
          <label className="form-label">
            <span>Admission Date (تاریخِ داخلہ)</span>
            <input type="date" name="tareekh_daakhla" value={formState.tareekh_daakhla || ''} onChange={onChange} />
          </label>
          <label className="form-label">
            <span>Leaving Date (تاریخِ اجراء)</span>
            <input type="date" name="tareekh_ijaara" value={formState.tareekh_ijaara || ''} onChange={onChange} />
          </label>
          <label className="form-label">
            <span>Serial No. (سلسلہ نمبر)</span>
            <input name="serial_no" value={formState.serial_no || ''} onChange={onChange} placeholder="e.g. 1423" />
          </label>
          <label className="form-label">
            <span>Form No. (فارم نمبر)</span>
            <input name="form_no" value={formState.form_no || ''} onChange={onChange} placeholder="e.g. F-234" />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h4 className="form-section-title">👨‍👩‍👦 Guardian Information — ولی / سرپرست کی معلومات</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Guardian's Name</span>
            <input name="guardian_name" value={formState.guardian_name || ''} onChange={onChange} placeholder="e.g. محمد یوسف" dir="auto" />
          </label>
          <label className="form-label">
            <span>Relation (رشتہ)</span>
            <select name="guardian_relation" value={formState.guardian_relation || ''} onChange={onChange}>
              <option value="">— Select Relation —</option>
              <option value="والد">Father (والد)</option>
              <option value="بھائی">Brother (بھائی)</option>
              <option value="چچا">Uncle — Paternal (چچا)</option>
              <option value="ماموں">Uncle — Maternal (ماموں)</option>
              <option value="دادا">Grandfather (دادا)</option>
              <option value="نانا">Maternal Grandfather (نانا)</option>
              <option value="سرپرست">Guardian (سرپرست)</option>
              <option value="دیگر">Other (دیگر)</option>
            </select>
          </label>
          <label className="form-label">
            <span>Guardian CNIC No.</span>
            <input name="guardian_cnic" value={formState.guardian_cnic || ''} onChange={onChange} placeholder="e.g. 35201-9876543-1" />
          </label>
          <label className="form-label">
            <span>Guardian's Phone</span>
            <input name="guardian_phone" value={formState.guardian_phone || ''} onChange={onChange} placeholder="e.g. 0300-1234567" />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h4 className="form-section-title">📍 Residence & Location — رہائش اور مقام</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Residential Status (مقیم/غیرمقیم)</span>
            <select name="residential_status" value={formState.residential_status || ''} onChange={onChange}>
              <option value="">— Select —</option>
              <option value="مقیم">مقیم (Resident)</option>
              <option value="غیر مقیم">غیر مقیم (Non-Resident)</option>
            </select>
          </label>
          {formState.residential_status === 'مقیم' && (
            <label className="form-label">
              <span>Room Number (کمرہ نمبر)</span>
              <input name="room_number" value={formState.room_number || ''} onChange={onChange} placeholder="e.g. A-12" dir="auto" />
            </label>
          )}
          <label className="form-label">
            <span>District (ضلع) *</span>
            <input name="district" value={formState.district || ''} onChange={onChange} required placeholder="e.g. لاہور" dir="auto" />
          </label>
          <label className="form-label form-label-wide">
            <span>Address (پتہ)</span>
            <textarea name="address" value={formState.address || ''} onChange={onChange} placeholder="Full home address..." dir="auto" />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h4 className="form-section-title">🔗 Additional Details</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Source Sheet</span>
            <input name="source_sheet" value={formState.source_sheet || ''} onChange={onChange} placeholder="Source sheet" />
          </label>
          <label className="form-label">
            <span>Source Row</span>
            <input type="number" name="source_row" value={formState.source_row || ''} onChange={onChange} placeholder="Row #" />
          </label>
          <label className="form-label">
            <span>DOB Raw</span>
            <input name="dob_raw" value={formState.dob_raw || ''} onChange={onChange} placeholder="As on document" />
          </label>
        </div>
      </div>
    </>
  )
}

export default function StudentDashboard({ user, onLogout }) {
  // ── Dashboard stats ──
  const [stats, setStats] = useState({ total: 0, byClass: {}, districts: 0 })
  const [recentStudents, setRecentStudents] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

  // ── Paginated student list ──
  const [students, setStudents] = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [listLoading, setListLoading] = useState(false)

  // ── Search & Filters ──
  const [searchQuery, setSearchQuery] = useState('')
  const searchTimer = useRef(null)
  const [appliedSearch, setAppliedSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [districtOptions, setDistrictOptions] = useState([])
  const [yearOptions, setYearOptions] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  // ── PDF ──
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReportFields, setSelectedReportFields] = useState([
    'name', 'father_name', 'student_type', 'class_level', 'district', 'phone'
  ])

  // ── Form & UI ──
  const [form, setForm] = useState(initialStudent)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // ── Admin & Edit ──
  const [dbRole, setDbRole] = useState(null)
  const isAdmin = dbRole === 'admin' || user?.user_metadata?.role === 'admin' || user?.role === 'admin'
  const [editForm, setEditForm] = useState(null)

  /** Fetch the user's role from the profiles table */
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (data) setDbRole(data.role)
    } catch (err) {
      console.error('Error fetching role:', err)
    }
  }, [user?.id])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  // ═══════════════════════════════════════════════════════
  // Data Fetching
  // ═══════════════════════════════════════════════════════

  /** Fetch distinct filter options (districts + entry years) */
  /** Helper: fetch ALL rows of a single column (paginates past 1000-row limit) */
  const fetchAllColumn = useCallback(async (column) => {
    const batchSize = 1000
    let all = []
    let page = 0
    let hasMore = true

    while (hasMore) {
      const from = page * batchSize
      const to = from + batchSize - 1
      const { data, error } = await supabase
        .from('students')
        .select(column)
        .range(from, to)

      if (error || !data) break
      all = all.concat(data)
      hasMore = data.length === batchSize
      page++
    }
    return all
  }, [])

  /** Normalize year value: "2020.0" → "2020", "1421.0" → "1421" */
  const normalizeYear = (val) => {
    if (!val) return ''
    const s = String(val).trim()
    // Strip trailing .0
    return s.replace(/\.0$/, '')
  }

  /** Fetch distinct filter options (districts + entry years) from ALL rows */
  const fetchFilterOptions = useCallback(async () => {
    const distData = await fetchAllColumn('district')
    const unique = [...new Set(distData.map(d => (d.district || '').trim()).filter(Boolean))].sort()
    setDistrictOptions(unique)

    const yearData = await fetchAllColumn('entry_year')
    const uniqueYears = [...new Set(
      yearData.map(d => normalizeYear(d.entry_year)).filter(Boolean)
    )].sort((a, b) => Number(a) - Number(b))
    setYearOptions(uniqueYears)
  }, [fetchAllColumn])

  /** Fetch lightweight stats + 5 recent students */
  const fetchDashboardStats = useCallback(async () => {
    setStatsLoading(true)

    const { count: total } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    // Fetch ALL class_level values (paginated)
    const classData = await fetchAllColumn('class_level')
    let byClass = {}
    if (classData) {
      byClass = classData.reduce((acc, item) => {
        const key = item.class_level || 'Unknown'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
    }

    // Fetch ALL district values (paginated)
    const districtData = await fetchAllColumn('district')
    let districts = 0
    if (districtData) {
      districts = new Set(districtData.map(d => (d.district || '').trim()).filter(Boolean)).size
    }

    setStats({ total: total || 0, byClass, districts })

    const { data: recent } = await supabase
      .from('students')
      .select('*')
      .order('id', { ascending: false })
      .limit(5)

    setRecentStudents(recent || [])
    setStatsLoading(false)
  }, [fetchAllColumn])

  /** Build a Supabase query with search + filters applied */
  const buildFilteredQuery = useCallback((selectStr, opts = {}) => {
    let query = supabase.from('students').select(selectStr, opts)

    if (appliedSearch && appliedSearch.trim()) {
      const term = `%${appliedSearch.trim()}%`
      query = query.or(
        `name.ilike.${term},father_name.ilike.${term},cnic.ilike.${term},district.ilike.${term}`
      )
    }
    if (filterType) query = query.eq('student_type', filterType)
    if (filterDistrict) query = query.ilike('district', filterDistrict)
    // Year filter: match both "2020" and "2020.0" using ilike with wildcard
    if (filterYear) query = query.ilike('entry_year', `${filterYear}%`)

    return query
  }, [appliedSearch, filterType, filterDistrict, filterYear])

  /** Fetch a single page of students with filters */
  const fetchStudentPage = useCallback(async (page) => {
    setListLoading(true)
    setError('')

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const query = buildFilteredQuery('*', { count: 'exact' })
      .order('id', { ascending: false })
      .range(from, to)

    const { data, count, error: fetchErr } = await query

    if (fetchErr) {
      setError(fetchErr.message)
      setListLoading(false)
      return
    }

    setStudents(data || [])
    setTotalStudents(count || 0)
    setListLoading(false)
  }, [buildFilteredQuery])

  // ── Initial load ──
  useEffect(() => {
    fetchDashboardStats()
    fetchFilterOptions()
  }, [fetchDashboardStats, fetchFilterOptions])

  // ── Fetch student page when page / search / filters change ──
  useEffect(() => {
    if (activeSection === 'allStudents') {
      fetchStudentPage(currentPage)
    }
  }, [activeSection, currentPage, appliedSearch, filterType, filterDistrict, filterYear, fetchStudentPage])

  // ── Debounced search ──
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1)
      setAppliedSearch(value)
    }, 400)
  }

  // ── Filter handlers ──
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilterType('')
    setFilterDistrict('')
    setFilterYear('')
    setSearchQuery('')
    setAppliedSearch('')
    setCurrentPage(1)
  }

  const hasActiveFilters = filterType || filterDistrict || filterYear || appliedSearch

  // ── Pagination helpers ──
  const totalPages = Math.ceil(totalStudents / PAGE_SIZE)

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setCurrentPage(p)
  }

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = []
    pages.push(1)
    if (currentPage > 4) pages.push('…')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 3) pages.push('…')
    pages.push(totalPages)
    return pages
  }

  // ═══════════════════════════════════════════════════════
  // PDF Report Generation
  // ═══════════════════════════════════════════════════════

  const generatePDF = async () => {
    setPdfLoading(true)
    setError('')

    try {
      // Fetch ALL matching records (with current filters) for the report
      let allRecords = []
      const batchSize = 1000
      let page = 0
      let hasMore = true

      while (hasMore) {
        const from = page * batchSize
        const to = from + batchSize - 1

        const selectStr = ['id', ...selectedReportFields].join(',')
        const query = buildFilteredQuery(selectStr)
          .order('id', { ascending: true })
          .range(from, to)

        const { data, error: fetchErr } = await query

        if (fetchErr) {
          setError(fetchErr.message)
          setPdfLoading(false)
          setShowReportModal(false)
          return
        }

        allRecords = allRecords.concat(data || [])
        hasMore = (data?.length || 0) === batchSize
        page++
      }

      if (allRecords.length === 0) {
        setError('No students to export with the current filters')
        setPdfLoading(false)
        setShowReportModal(false)
        return
      }

      // Hide modal once generation formally starts
      setShowReportModal(false)

      // Build filter subtitle
      const filterParts = []
      if (filterType) filterParts.push(`Type: ${filterType}`)
      if (filterDistrict) filterParts.push(`District: ${filterDistrict}`)
      if (filterYear) filterParts.push(`Year: ${filterYear}`)
      if (appliedSearch) filterParts.push(`Search: "${appliedSearch}"`)
      const subtitle = filterParts.length > 0
        ? `Filters: ${filterParts.join(' | ')} — ${allRecords.length.toLocaleString()} students`
        : `All Students — ${allRecords.length.toLocaleString()} total`

      const now = new Date()

      const orientation = selectedReportFields.length <= 3 ? 'portrait' : 'landscape'
      const containerWidth = selectedReportFields.length <= 3 ? '794px' : '1040px'

      const headersHtml = selectedReportFields.map(f => `<th style="background: #6c5ce7; color: #fff; font-weight: 700; font-size: 10px; text-transform: uppercase; padding: 8px 6px; text-align: left;">${REPORT_FIELDS[f]}</th>`).join('')

      // Build table rows HTML
      const rowsHtml = allRecords.map((s, i) => `
        <tr style="background: ${i % 2 === 0 ? '#f8f8fc' : '#fff'};">
          <td style="padding: 6px; border-bottom: 1px solid #e8ecf1;">${i + 1}</td>
          ${selectedReportFields.map(f => {
        const fontStyle = (f === 'cnic' || f === 'phone' || f === 'guardian_phone' || f === 'guardian_cnic') ? 'font-family: monospace;' : ''
        return `<td style="padding: 6px; border-bottom: 1px solid #e8ecf1; ${fontStyle}" dir="auto">${s[f] || '—'}</td>`
      }).join('')}
        </tr>
      `).join('')

      const container = document.createElement('div')
      // Render based on selected orientation
      container.innerHTML = `
        <div style="font-family: 'Inter', 'Noto Naskh Arabic', sans-serif; color: #1a1a2e; background: #fff; padding: 20px; width: ${containerWidth}; box-sizing: border-box;">
          <div style="margin-bottom: 20px; border-bottom: 3px solid #6c5ce7; padding-bottom: 16px;">
            <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 4px; margin-top: 0;">Madarsa LMS — Student Report</h1>
            <p style="font-size: 12px; color: #666; margin: 0;">${subtitle}</p>
            <p style="font-size: 12px; color: #666; margin: 0; margin-top: 4px;">Generated: ${now.toLocaleString()}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
            <thead>
              <tr>
                <th style="background: #6c5ce7; color: #fff; font-weight: 700; font-size: 10px; text-transform: uppercase; padding: 8px 6px; text-align: left;">#</th>
                ${headersHtml}
              </tr>
            </thead>
            <tbody style="font-size: 11px;">
              ${rowsHtml}
            </tbody>
          </table>
          <div style="margin-top: 18px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #999; display: flex; justify-content: space-between;">
            <span>Madarsa LMS Student Management System</span>
            <span>${allRecords.length.toLocaleString()} students</span>
          </div>
        </div>
      `

      const opt = {
        margin: 10,
        filename: 'student_report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: orientation }
      }

      await html2pdf().set(opt).from(container.firstElementChild).save()

    } catch (err) {
      setError('Report generation failed: ' + err.message)
    }

    setPdfLoading(false)
  }

  // ═══════════════════════════════════════════════════════
  // Form handling
  // ═══════════════════════════════════════════════════════

  const handleChange = event => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name || !form.cnic || !form.district) {
      setError('Name, CNIC, and District are required')
      return
    }

    const record = {
      ...form,
      source_row: form.source_row ? Number(form.source_row) : null,
      dob: form.dob || null,
      tareekh_daakhla: form.tareekh_daakhla || null,
      tareekh_ijaara: form.tareekh_ijaara || null,
    }

    if (form.student_image_file) {
      console.log('Attempting image upload...')
      const cleanName = (form.name || 'Unknown').trim().replace(/\s+/g, '_')
      const cleanFather = (form.father_name || 'Unknown').trim().replace(/\s+/g, '_')
      const serialPart = form.serial_no && form.serial_no.trim() !== '' ? `_${form.serial_no.trim().replace(/\s+/g, '_')}` : ''
      const ext = form.student_image_file.name.split('.').pop()
      const fileName = `${cleanName}_${cleanFather}${serialPart}.${ext}`
      const storagePath = `images/${fileName}`

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('Darul-Uloom-Students')
        .upload(storagePath, form.student_image_file, { upsert: true })

      if (uploadErr) {
        console.error('Storage Upload Error:', uploadErr)
        setError('Image upload failed: ' + uploadErr.message)
        return
      }

      // Use the returned path or our own storagePath as fallback
      record.student_image = uploadData?.path || storagePath
      console.log('Image uploaded successfully. Path saved to record:', record.student_image)
    }
    
    delete record.student_image_file
    delete record.id // Ensure we don't try to insert an ID field if it exists in form for some reason

    const { error } = await supabase.from('students').insert([record])
    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Student added successfully')
    setForm(initialStudent)
    fetchDashboardStats()
    fetchFilterOptions()
    setCurrentPage(1)
    setAppliedSearch('')
    setSearchQuery('')
    setActiveSection('allStudents')
  }

  const handleEditChange = event => {
    const { name, value } = event.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!editForm.name || !editForm.cnic || !editForm.district) {
      setError('Name, CNIC, and District are required')
      return
    }

    const record = {
      ...editForm,
      source_row: editForm.source_row ? Number(editForm.source_row) : null,
      dob: editForm.dob || null,
      tareekh_daakhla: editForm.tareekh_daakhla || null,
      tareekh_ijaara: editForm.tareekh_ijaara || null,
    }

    if (editForm.student_image_file) {
      console.log('Attempting image update...')
      const cleanName = (editForm.name || 'Unknown').trim().replace(/\s+/g, '_')
      const cleanFather = (editForm.father_name || 'Unknown').trim().replace(/\s+/g, '_')
      const serialPart = editForm.serial_no && editForm.serial_no.trim() !== '' ? `_${editForm.serial_no.trim().replace(/\s+/g, '_')}` : ''
      const ext = editForm.student_image_file.name.split('.').pop()
      const fileName = `${cleanName}_${cleanFather}${serialPart}.${ext}`
      const storagePath = `images/${fileName}`

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('Darul-Uloom-Students')
        .upload(storagePath, editForm.student_image_file, { upsert: true })

      if (uploadErr) {
        console.error('Storage Upload Error:', uploadErr)
        setError('Image upload failed: ' + uploadErr.message)
        return
      }

      record.student_image = uploadData?.path || storagePath
      console.log('Image updated successfully. Path saved to record:', record.student_image)
    }
    
    delete record.student_image_file

    const { error } = await supabase.from('students').update(record).eq('id', record.id)
    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Student updated successfully')
    setEditForm(null)
    setSelectedStudent(null)
    fetchDashboardStats()
    fetchFilterOptions()
    fetchStudentPage(currentPage)
  }

  // ═══════════════════════════════════════════════════════
  // Nav
  // ═══════════════════════════════════════════════════════

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'allStudents', label: 'All Students', icon: '👥' },
    { id: 'addStudent', label: 'Add Student', icon: '➕' },
    { id: 'sanadRecords', label: 'Sanad Records', icon: '📜' },
  ]

  // ═══════════════════════════════════════════════════════
  // Sections
  // ═══════════════════════════════════════════════════════

  /* ── Dashboard Section ──────────────────────────────── */
  const sectionDashboard = (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">Dashboard Overview</h2>
          <p className="dash-page-subtitle">Real-time student analytics at a glance</p>
        </div>
        <button className="dash-refresh-btn" onClick={fetchDashboardStats}>
          <span className="refresh-icon">🔄</span> Refresh
        </button>
      </div>

      {statsLoading ? (
        <div className="dash-loading"><div className="spinner" /> Loading stats…</div>
      ) : (
        <>
          <div className="dash-stats-grid">
            <div className="dash-stat-card stat-total">
              <div className="stat-icon-wrap">📚</div>
              <div className="stat-info">
                <span className="stat-label">Total Students</span>
                <strong className="stat-value">{stats.total.toLocaleString()}</strong>
              </div>
            </div>
            <div className="dash-stat-card stat-districts">
              <div className="stat-icon-wrap">🏘️</div>
              <div className="stat-info">
                <span className="stat-label">Districts</span>
                <strong className="stat-value">{stats.districts}</strong>
              </div>
            </div>
            <div className="dash-stat-card stat-classes">
              <div className="stat-icon-wrap">🎓</div>
              <div className="stat-info">
                <span className="stat-label">Classes</span>
                <strong className="stat-value">{Object.keys(stats.byClass).length}</strong>
              </div>
            </div>
            <div className="dash-stat-card stat-avg">
              <div className="stat-icon-wrap">📈</div>
              <div className="stat-info">
                <span className="stat-label">Avg per Class</span>
                <strong className="stat-value">
                  {Object.keys(stats.byClass).length > 0
                    ? Math.round(stats.total / Object.keys(stats.byClass).length)
                    : 0}
                </strong>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <h3 className="dash-card-title">Students by Class</h3>
            {Object.keys(stats.byClass).length === 0 ? (
              <p className="dash-empty">No class data yet</p>
            ) : (
              <div className="class-chips">
                {Object.entries(stats.byClass)
                  .sort((a, b) => b[1] - a[1])
                  .map(([classLevel, count]) => (
                    <div className="class-chip" key={classLevel}>
                      <span className="class-chip-name">{classLevel || 'Unknown'}</span>
                      <span className="class-chip-count">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="dash-card">
            <h3 className="dash-card-title">Recent Students</h3>
            {recentStudents.length === 0 ? (
              <p className="dash-empty">No students found.</p>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Father Name</th><th>District</th><th>CNIC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map(item => (
                      <tr key={item.id} className="clickable-row" onClick={() => setSelectedStudent(item)}>
                        <td>
                          <div className="student-name-cell">
                            <div className="student-avatar">
                              {item.student_image ? (
                                <img
                                  src={supabase.storage.from('Darul-Uloom-Students').getPublicUrl(item.student_image).data.publicUrl}
                                  alt={item.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                />
                              ) : (
                                (item.name || '?')[0].toUpperCase()
                              )}
                            </div>
                            {item.name}
                          </div>
                        </td>
                        <td>{item.father_name || '—'}</td>
                        <td>{item.district || '—'}</td>
                        <td className="mono">{item.cnic || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )

  /* ── Add Student Section ────────────────────────────── */
  const sectionAddStudent = (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">Add New Student</h2>
          <p className="dash-page-subtitle">Fill in the details below to register a student</p>
        </div>
      </div>

      <div className="dash-card">
        <form onSubmit={handleSubmit}>
          <StudentFormFields formState={form} onChange={handleChange} onFileChange={(name, file) => setForm(prev => ({ ...prev, [name]: file }))} />

          <button type="submit" className="dash-submit-btn">
            ➕ Add Student
          </button>
        </form>
      </div>
    </div>
  )

  /* ── All Students Section (paginated + filters + PDF) ─ */
  const sectionAllStudents = (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">All Students</h2>
          <p className="dash-page-subtitle">
            {totalStudents.toLocaleString()} student{totalStudents !== 1 ? 's' : ''}
            {appliedSearch ? ` matching "${appliedSearch}"` : ''}
            {' · Page '}{currentPage} of {totalPages || 1}
          </p>
        </div>
        <div className="dash-header-actions">
          <div className="dash-search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="dash-search"
              placeholder="Search name, CNIC, district…"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>
          <button
            className={`filter-toggle-btn ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
            onClick={() => setShowFilters(f => !f)}
            title="Toggle filters"
          >
            🔽 Filters {hasActiveFilters && <span className="filter-dot" />}
          </button>
          <button
            className="pdf-btn"
            onClick={() => setShowReportModal(true)}
            disabled={pdfLoading}
            title="Download PDF report of current filtered data"
          >
            {pdfLoading ? <><div className="spinner-sm" /> Generating…</> : <>📄 PDF Report</>}
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="filter-bar">
          <label className="filter-field">
            <span>Student Type</span>
            <select value={filterType} onChange={handleFilterChange(setFilterType)}>
              <option value="">All Types</option>
              {STUDENT_TYPES.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>District</span>
            <select value={filterDistrict} onChange={handleFilterChange(setFilterDistrict)}>
              <option value="">All Districts</option>
              {districtOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Entry Year</span>
            <select value={filterYear} onChange={handleFilterChange(setFilterYear)}>
              <option value="">All Years</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              ✕ Clear All
            </button>
          )}
        </div>
      )}

      <div className="dash-card">
        {listLoading && <div className="dash-loading"><div className="spinner" /> Loading students…</div>}
        {!listLoading && students.length === 0 && <p className="dash-empty">No students found.</p>}
        {!listLoading && students.length > 0 && (
          <>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Father Name</th><th>District</th><th>CNIC</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(item => (
                    <tr key={item.id} className="clickable-row" onClick={() => setSelectedStudent(item)}>
                      <td>
                        <div className="student-name-cell">
                          <div className="student-avatar">
                            {item.student_image ? (
                              <img
                                src={supabase.storage.from('Darul-Uloom-Students').getPublicUrl(item.student_image).data.publicUrl}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                              />
                            ) : (
                              (item.name || '?')[0].toUpperCase()
                            )}
                          </div>
                          {item.name}
                        </div>
                      </td>
                      <td>{item.father_name || '—'}</td>
                      <td>{item.district || '—'}</td>
                      <td className="mono">{item.cnic || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                  ← Prev
                </button>
                {getPageNumbers().map((p, i) =>
                  p === '…' ? (
                    <span key={`dots-${i}`} className="page-dots">…</span>
                  ) : (
                    <button key={p} className={`page-btn ${p === currentPage ? 'page-active' : ''}`} onClick={() => goToPage(p)}>
                      {p}
                    </button>
                  )
                )}
                <button className="page-btn" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )

  // ═══════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════

  return (
    <div className={`dash-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">📚</span>
          {!sidebarCollapsed && <span className="sidebar-title">Madarsa LMS</span>}
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-btn ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
              title={item.label}
            >
              <span className="sidebar-btn-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="sidebar-btn-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className="sidebar-btn sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(c => !c)}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            <span className="sidebar-btn-icon">{sidebarCollapsed ? '▶' : '◀'}</span>
            {!sidebarCollapsed && <span className="sidebar-btn-label">Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="dash-main-area">
        <header className="dash-topbar">
          <div className="topbar-left">
            <span className="topbar-greeting">
              Welcome, <strong>{user?.user_metadata?.full_name || user?.email || 'User'}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="topbar-role">{dbRole || user?.user_metadata?.role || 'user'}</span>
            <button className="topbar-logout" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <main className="dash-main-content">
          {error && <div className="dash-alert dash-alert-error">{error}</div>}
          {success && <div className="dash-alert dash-alert-success">{success}</div>}
          {activeSection === 'dashboard' && sectionDashboard}
          {activeSection === 'addStudent' && sectionAddStudent}
          {activeSection === 'allStudents' && sectionAllStudents}
          {activeSection === 'sanadRecords' && <SanadDashboard user={user} />}
        </main>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => { setSelectedStudent(null); setEditForm(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-avatar">
                  {selectedStudent.student_image ? (
                    <img
                      src={supabase.storage.from('Darul-Uloom-Students').getPublicUrl(selectedStudent.student_image).data.publicUrl}
                      alt={selectedStudent.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    (selectedStudent.name || '?')[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="modal-title">{selectedStudent.name || 'Unknown'}</h2>
                  <p className="modal-subtitle">{selectedStudent.student_type?.toUpperCase()} • ID: {selectedStudent.id}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {isAdmin && !editForm && (
                  <button className="sidebar-btn" style={{ padding: '6px 12px', background: 'var(--dash-bg)', color: 'var(--dash-accent)' }} onClick={() => setEditForm({ ...selectedStudent })}>✏️ Edit</button>
                )}
                <button className="modal-close" onClick={() => { setSelectedStudent(null); setEditForm(null); }}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              {editForm ? (
                <form onSubmit={handleUpdate} className="edit-student-form">
                  <div style={{ marginTop: -16 }}></div>
                  <StudentFormFields formState={editForm} onChange={handleEditChange} onFileChange={(name, file) => setEditForm(prev => ({ ...prev, [name]: file }))} />

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="button" className="sidebar-btn" onClick={() => setEditForm(null)}>Cancel</button>
                    <button type="submit" className="dash-submit-btn">💾 Save Changes</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="modal-section">
                    <h4 className="modal-section-title">📋 Basic Information</h4>
                    <div className="modal-grid">
                      <div className="modal-field"><span className="modal-field-label">Student Type</span><span className="modal-field-value">{selectedStudent.student_type || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Serial No.</span><span className="modal-field-value">{selectedStudent.serial_no || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Entry Year</span><span className="modal-field-value">{selectedStudent.entry_year || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Name</span><span className="modal-field-value">{selectedStudent.name || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Father Name</span><span className="modal-field-value">{selectedStudent.father_name || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">DOB</span><span className="modal-field-value">{selectedStudent.dob || selectedStudent.dob_raw || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Class Level</span><span className="modal-field-value">{selectedStudent.class_level || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Form No</span><span className="modal-field-value">{selectedStudent.form_no || '—'}</span></div>
                    </div>
                  </div>
                  <div className="modal-section">
                    <h4 className="modal-section-title">📍 Location & Contact</h4>
                    <div className="modal-grid">
                      <div className="modal-field"><span className="modal-field-label">District</span><span className="modal-field-value">{selectedStudent.district || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Address</span><span className="modal-field-value">{selectedStudent.address || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Residential Status</span><span className="modal-field-value">{selectedStudent.residential_status || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Phone</span><span className="modal-field-value">{selectedStudent.phone || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Room Number</span><span className="modal-field-value">{selectedStudent.room_number || '—'}</span></div>
                    </div>
                  </div>
                  <div className="modal-section">
                    <h4 className="modal-section-title">🪪 Identity</h4>
                    <div className="modal-grid">
                      <div className="modal-field"><span className="modal-field-label">CNIC</span><span className="modal-field-value mono">{selectedStudent.cnic || '—'}</span></div>
                      {selectedStudent.student_image && (
                        <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                          <span className="modal-field-label">Student Photo</span>
                          <div style={{ marginTop: '10px' }}>
                            <img
                              src={supabase.storage.from('Darul-Uloom-Students').getPublicUrl(selectedStudent.student_image).data.publicUrl}
                              alt="Student"
                              style={{ maxWidth: '200px', borderRadius: 'var(--dash-radius)', border: '1px solid var(--dash-border)' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-section">
                    <h4 className="modal-section-title">👨‍👩‍👦 Guardian Details</h4>
                    <div className="modal-grid">
                      <div className="modal-field"><span className="modal-field-label">Guardian Name</span><span className="modal-field-value">{selectedStudent.guardian_name || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Relation</span><span className="modal-field-value">{selectedStudent.guardian_relation || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Guardian CNIC</span><span className="modal-field-value mono">{selectedStudent.guardian_cnic || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Guardian Phone</span><span className="modal-field-value">{selectedStudent.guardian_phone || '—'}</span></div>
                    </div>
                  </div>
                  <div className="modal-section">
                    <h4 className="modal-section-title">📅 Dates & Source</h4>
                    <div className="modal-grid">
                      <div className="modal-field"><span className="modal-field-label">Tareekh Daakhla</span><span className="modal-field-value">{selectedStudent.tareekh_daakhla || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Tareekh Ijaara</span><span className="modal-field-value">{selectedStudent.tareekh_ijaara || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Source Sheet</span><span className="modal-field-value">{selectedStudent.source_sheet || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Source Row</span><span className="modal-field-value">{selectedStudent.source_row || '—'}</span></div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div style={{ marginTop: '24px', padding: '16px 0', borderTop: '1px solid var(--dash-border)', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="dash-submit-btn"
                        onClick={() => setEditForm({ ...selectedStudent })}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        ✏️ Edit Student Information
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* PDF Report Configuration Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-avatar">📄</div>
                <div>
                  <h2 className="modal-title">Configure PDF Report</h2>
                  <p className="modal-subtitle">
                    Select up to 6 fields to include in the report.
                    <br />
                    <span style={{ color: 'var(--dash-accent)' }}>
                      {selectedReportFields.length <= 3 ? 'Portrait Orientation' : 'Landscape Orientation'}
                    </span>
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {Object.entries(REPORT_FIELDS).map(([key, label]) => {
                  const isChecked = selectedReportFields.includes(key);
                  const isDisabled = !isChecked && selectedReportFields.length >= 6;
                  return (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer', color: 'var(--dash-text-bright)' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedReportFields.length < 6) {
                              setSelectedReportFields([...selectedReportFields, key])
                            }
                          } else {
                            setSelectedReportFields(selectedReportFields.filter(k => k !== key))
                          }
                        }}
                      />
                      {label}
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 28px', borderTop: '1px solid var(--dash-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="sidebar-btn"
                onClick={() => setSelectedReportFields(['name', 'father_name', 'class_level', 'district'])}
              >
                Reset Default
              </button>
              <button
                className="dash-submit-btn"
                onClick={generatePDF}
                disabled={selectedReportFields.length === 0}
              >
                {pdfLoading ? 'Generating…' : 'Generate Export'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}