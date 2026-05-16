import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { supabase } from '../Auth/SupabaseClient'

const CACHE_KEY = 'report_configs_cache'

/**
 * Default report configs — used when DB is empty or offline.
 * Each config defines: report_type, columns (array of {field, label, type}), and settings.
 *
 * Column types: 'text' | 'number' | 'image' | 'signature' | 'wazifa'
 * - text: renders student[field] as text
 * - number: auto-incremented row number (field is ignored)
 * - image: renders student image from storage
 * - signature: empty cell for handwritten signature
 * - wazifa: renders the class wazifa value
 */
const DEFAULT_CONFIGS = {
  wazifa_report: {
    report_type: 'wazifa_report',
    title: 'وظیفہ حاضری رپورٹ',
    columns: [
      { field: '_row_num', label: 'نمبر', type: 'number' },
      { field: 'name', label: 'نام طالب علم', type: 'text' },
      { field: 'father_name', label: 'ولدیت', type: 'text' },
      { field: '_wazifa', label: 'وظیفہ', type: 'wazifa' },
      { field: '_signature', label: 'دستخط', type: 'signature' },
    ],
    // Which fields to fetch from students table (auto-derived from columns with type=text/image)
    student_fields: ['name', 'father_name', 'class_level'],
  },
  student_report: {
    report_type: 'student_report',
    title: 'رپورٹ طلباء',
    // student_report columns are user-selected at runtime via the report panel
    // This config just defines the available fields and their labels
    available_fields: {
      student_image: 'Photo',
      serial_no: 'Serial No',
      name: 'Name',
      father_name: 'Father Name',
      student_type: 'Student Type',
      class_level: 'Class',
      district: 'District',
      cnic: 'CNIC',
      phone: 'Phone',
      status: 'Status',
      entry_year: 'Entry Year',
      dob: 'DOB',
      address: 'Address',
      residential_status: 'Resident Status',
      guardian_name: 'Guardian Name',
      guardian_phone: 'Guardian Phone',
      guardian_cnic: 'Guardian CNIC',
      guardian_relation: 'Guardian Relation',
      form_no: 'Form No',
      room_number: 'Room Number',
      tareekh_daakhla: 'Tareekh Daakhla',
      tareekh_ijaara: 'Tareekh Ijaara',
    },
    default_selected: ['name', 'father_name', 'student_type', 'class_level', 'district', 'phone', 'cnic', 'status'],
    field_priority: ['serial_no', 'student_image', 'name', 'father_name'],
  },
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function writeCache(configs) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(configs)) } catch { /* ignore */ }
}

function mergeConfigs(dbConfigs) {
  const merged = { ...DEFAULT_CONFIGS }
  for (const row of (dbConfigs || [])) {
    if (row.report_type && row.config) {
      try {
        merged[row.report_type] = {
          ...DEFAULT_CONFIGS[row.report_type],
          ...( typeof row.config === 'string' ? JSON.parse(row.config) : row.config ),
          report_type: row.report_type,
        }
      } catch { /* skip bad JSON */ }
    }
  }
  return merged
}

const ReportConfigContext = createContext(null)

export function ReportConfigProvider({ children }) {
  const [configs, setConfigs] = useState(() => {
    const cached = readCache()
    return cached ? mergeConfigs(cached) : { ...DEFAULT_CONFIGS }
  })

  const refreshConfigs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('report_configs')
        .select('report_type, config')

      if (error) {
        console.warn('[ReportConfig] fetch error:', error.message)
        return
      }

      const merged = mergeConfigs(data)
      setConfigs(merged)
      writeCache(data || [])
    } catch (err) {
      console.warn('[ReportConfig] network error:', err.message)
    }
  }, [])

  useEffect(() => { refreshConfigs() }, [refreshConfigs])

  const getConfig = useCallback((reportType) => {
    return configs[reportType] || DEFAULT_CONFIGS[reportType] || null
  }, [configs])

  return (
    <ReportConfigContext.Provider value={{ configs, getConfig, refreshConfigs }}>
      {children}
    </ReportConfigContext.Provider>
  )
}

export function useReportConfig() {
  const ctx = useContext(ReportConfigContext)
  if (!ctx) throw new Error('useReportConfig must be used within <ReportConfigProvider>')
  return ctx
}
