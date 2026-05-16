import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../Auth/SupabaseClient'
import { invalidateClassCache } from '../../hooks/useClasses'
import Alert from '../shared/Alert'
import LoadingSpinner from '../shared/LoadingSpinner'
import { printWazifaReport, getWazifaStudentFields, buildWazifaImageMap } from './WazifaReport'

const URDU_MONTHS = [
  'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
  'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر',
]

const urduFont = { fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif" }

export default function ClassesDashboard({ isAdmin }) {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // add form
  const [newClassName, setNewClassName] = useState('')
  const [newSortOrder, setNewSortOrder] = useState('')
  const [adding, setAdding] = useState(false)

  // per-row drafts: { [id]: { name, wazifa } }
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState({})

  // report modal
  const [reportModal, setReportModal] = useState(null)
  const now = new Date()
  const [reportMonth, setReportMonth] = useState(now.getMonth())
  const [reportYear, setReportYear] = useState(now.getFullYear())
  const [reportLoading, setReportLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data: classRows, error: classErr } = await supabase
      .from('classes')
      .select('id, name, sort_order, wazifa')
      .order('sort_order', { ascending: true })

    if (classErr) { setError(classErr.message); setLoading(false); return }

    const { data: studentRows, error: studentErr } = await supabase
      .from('students')
      .select('class_level')

    if (studentErr) { setError(studentErr.message); setLoading(false); return }

    const classTableNames = new Set((classRows || []).map(c => c.name))
    const studentClassNames = [...new Set((studentRows || []).map(r => r.class_level).filter(Boolean))]
    const orphanNames = studentClassNames.filter(n => !classTableNames.has(n))

    const merged = [
      ...(classRows || []),
      ...orphanNames.map(n => ({ id: null, name: n, sort_order: null, wazifa: '' })),
    ]
    setClasses(merged)
    // reset drafts so fresh DB values show
    setDrafts({})
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // get current draft value for a field, falling back to DB value
  const getDraft = (cls, field) => {
    if (cls.id && drafts[cls.id]?.[field] !== undefined) return drafts[cls.id][field]
    return cls[field] ?? ''
  }

  const setDraft = (id, field, value) => {
    setDrafts(d => ({ ...d, [id]: { ...d[id], [field]: value } }))
  }

  const isDirty = (cls) => {
    if (!cls.id || !drafts[cls.id]) return false
    const d = drafts[cls.id]
    if (d.name !== undefined && d.name !== (cls.name ?? '')) return true
    if (d.wazifa !== undefined && d.wazifa !== (cls.wazifa ?? '')) return true
    return false
  }

  const handleSave = async (cls) => {
    if (!cls.id) return
    const d = drafts[cls.id] || {}
    const newName = (d.name !== undefined ? d.name : cls.name ?? '').trim()
    const newWazifa = (d.wazifa !== undefined ? d.wazifa : cls.wazifa ?? '').trim()

    if (!newName) { setError('کلاس کا نام خالی نہیں ہو سکتا'); return }

    setSaving(s => ({ ...s, [cls.id]: true }))
    setError('')
    setSuccess('')

    const { data: updatedRows, error: upErr, status, statusText } = await supabase
      .from('classes')
      .update({ name: newName, wazifa: newWazifa })
      .eq('id', cls.id)
      .select()   // ← ask Supabase to return the updated row so we can confirm it worked

    console.log('[ClassesDashboard] save result:', { updatedRows, upErr, status, statusText })

    setSaving(s => ({ ...s, [cls.id]: false }))

    if (upErr) {
      setError(`خرابی: ${upErr.message} (code: ${upErr.code})`)
    } else if (!updatedRows || updatedRows.length === 0) {
      // RLS blocked the update silently — no error but also no rows updated
      setError('تبدیلی محفوظ نہیں ہوئی — ممکن ہے آپ کو اجازت نہ ہو (RLS policy). براہ کرم Supabase میں classes table کی RLS policy چیک کریں۔')
    } else {
      setSuccess('تبدیلیاں محفوظ ہو گئیں')
      invalidateClassCache()
      fetchData()
    }
  }

  const handleAdd = async () => {
    const trimmed = newClassName.trim()
    if (!trimmed) { setError('کلاس کا نام خالی نہیں ہو سکتا'); return }
    setAdding(true)
    setError('')
    setSuccess('')
    const { error: insertErr } = await supabase
      .from('classes')
      .insert({ name: trimmed, sort_order: newSortOrder !== '' ? Number(newSortOrder) : null })
    if (insertErr) {
      setError(insertErr.message)
    } else {
      setSuccess(`کلاس "${trimmed}" کامیابی سے شامل کر دی گئی`)
      setNewClassName('')
      setNewSortOrder('')
      invalidateClassCache()
      fetchData()
    }
    setAdding(false)
  }

  const openReportModal = (cls) => {
    setReportModal({ className: cls.name, wazifa: cls.wazifa || '' })
  }

  const handlePrintReport = async () => {
    if (!reportModal) return
    setReportLoading(true)
    const studentFields = getWazifaStudentFields()
    // Always fetch student_image + id for image map
    const fieldsToFetch = [...new Set([...studentFields, 'student_image', 'id'])]
    const { data, error: fetchErr } = await supabase
      .from('students')
      .select(fieldsToFetch.join(', '))
      .eq('class_level', reportModal.className)
      .eq('status', 'current')
      .order('name', { ascending: true })
    if (fetchErr) { setError(fetchErr.message); setReportLoading(false); return }
    // Fetch images as base64
    const imageMap = await buildWazifaImageMap(data || [])
    setReportLoading(false)
    printWazifaReport({
      className: reportModal.className,
      wazifa: reportModal.wazifa,
      students: data || [],
      month: URDU_MONTHS[reportMonth],
      year: reportYear,
      imageMap,
    })
    setReportModal(null)
  }

  const yearOptions = []
  for (let y = now.getFullYear() + 1; y >= 2015; y--) yearOptions.push(y)

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title" dir="rtl">کلاسیں</h2>
          <p className="dash-page-subtitle" dir="rtl">تمام کلاسیں اور ان کے وظائف</p>
        </div>
        <button className="dash-refresh-btn" onClick={fetchData}>
          <span className="refresh-icon">🔄</span> تازہ کریں
        </button>
      </div>

      <Alert error={error} success={success} />

      {isAdmin && (
        <div className="dash-card" style={{ marginBottom: '24px' }}>
          <h3 className="dash-card-title" dir="rtl">نئی کلاس شامل کریں</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 220px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--dash-text)', marginBottom: '6px' }} dir="rtl">کلاس کا نام</label>
              <input
                className="dash-input"
                type="text"
                placeholder="مثلاً: عالمیہ ثالثہ"
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                dir="rtl"
                style={{ width: '100%', boxSizing: 'border-box', ...urduFont }}
              />
            </div>
            <div style={{ flex: '0 1 130px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--dash-text)', marginBottom: '6px' }} dir="rtl">ترتیب نمبر (اختیاری)</label>
              <input
                className="dash-input"
                type="number"
                placeholder="مثلاً: 10"
                value={newSortOrder}
                onChange={e => setNewSortOrder(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <button
              className="dash-btn dash-btn-primary"
              onClick={handleAdd}
              disabled={adding}
              style={{ height: '40px', padding: '0 20px' }}
            >
              {adding ? 'شامل ہو رہا ہے…' : '➕ شامل کریں'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="کلاسیں لوڈ ہو رہی ہیں…" />
      ) : (
        <div className="dash-card">
          <h3 className="dash-card-title" dir="rtl">تمام کلاسیں ({classes.length})</h3>
          {classes.length === 0 ? (
            <p className="dash-empty" dir="rtl">کوئی کلاس نہیں ملی</p>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th dir="rtl" style={{ minWidth: '180px' }}>کلاس کا نام</th>
                    <th dir="rtl" style={{ minWidth: '220px' }}>وظیفہ</th>
                    <th dir="rtl" style={{ width: '160px' }}>عمل</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls, idx) => {
                    const rowDirty = isDirty(cls)
                    const isSaving = saving[cls.id]
                    const nameVal = getDraft(cls, 'name')
                    const wazifaVal = getDraft(cls, 'wazifa')

                    return (
                      <tr key={cls.id ?? cls.name}>
                        <td className="mono" style={{ color: 'var(--dash-text)' }}>{idx + 1}</td>

                        {/* Name cell */}
                        <td>
                          {isAdmin && cls.id ? (
                            <input
                              className="dash-input"
                              dir="rtl"
                              value={nameVal}
                              onChange={e => setDraft(cls.id, 'name', e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', fontWeight: 600, fontSize: '14px', ...urduFont }}
                            />
                          ) : (
                            <span dir="rtl" style={{ fontWeight: 600, fontSize: '15px', color: 'var(--dash-text-bright)', ...urduFont }}>
                              {cls.name}
                            </span>
                          )}
                        </td>

                        {/* Wazifa cell */}
                        <td>
                          {isAdmin && cls.id ? (
                            <input
                              className="dash-input"
                              dir="rtl"
                              placeholder="وظیفہ درج کریں"
                              value={wazifaVal}
                              onChange={e => setDraft(cls.id, 'wazifa', e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', fontSize: '13px', ...urduFont }}
                            />
                          ) : (
                            <span dir="rtl" style={{ fontSize: '14px', color: cls.wazifa ? 'var(--dash-text-bright)' : 'var(--dash-text)', ...urduFont }}>
                              {cls.wazifa || '—'}
                            </span>
                          )}
                        </td>

                        {/* Actions cell */}
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {isAdmin && cls.id && rowDirty && (
                              <button
                                className="dash-btn dash-btn-primary"
                                style={{ padding: '5px 10px', fontSize: '12px', whiteSpace: 'nowrap' }}
                                onClick={() => handleSave(cls)}
                                disabled={isSaving}
                              >
                                {isSaving ? '…' : '💾 محفوظ'}
                              </button>
                            )}
                            <button
                              className="dash-btn"
                              style={{ padding: '5px 10px', fontSize: '12px', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)', border: '1px solid var(--dash-accent)', whiteSpace: 'nowrap' }}
                              onClick={() => openReportModal(cls)}
                            >
                              📄 رپورٹ
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div className="modal-overlay" onClick={() => setReportModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', width: '94vw' }}>
            <div className="modal-header">
              <h2 className="modal-title" dir="rtl">📄 وظیفہ رپورٹ</h2>
              <button className="modal-close" onClick={() => setReportModal(null)}>✕</button>
            </div>
            <div className="modal-body" dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--dash-text)' }}>کلاس</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: 'var(--dash-text-bright)', ...urduFont }}>
                  {reportModal.className}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--dash-text)' }}>وظیفہ</p>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--dash-text-bright)', ...urduFont }}>
                  {reportModal.wazifa || '(وظیفہ درج نہیں)'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--dash-text)', marginBottom: '6px' }}>مہینہ</label>
                  <select className="dash-input" value={reportMonth} onChange={e => setReportMonth(Number(e.target.value))} style={{ width: '100%', ...urduFont }}>
                    {URDU_MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--dash-text)', marginBottom: '6px' }}>سال</label>
                  <select className="dash-input" value={reportYear} onChange={e => setReportYear(Number(e.target.value))} style={{ width: '100%' }}>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start', marginTop: '4px' }}>
                <button className="sidebar-btn" onClick={() => setReportModal(null)}>منسوخ</button>
                <button className="dash-btn dash-btn-primary" onClick={handlePrintReport} disabled={reportLoading} style={{ padding: '8px 20px' }}>
                  {reportLoading ? 'لوڈ ہو رہا ہے…' : '🖨️ رپورٹ پرنٹ کریں'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
