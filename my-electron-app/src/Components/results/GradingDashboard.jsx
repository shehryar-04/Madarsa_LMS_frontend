import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../Auth/SupabaseClient'
import { useClassBooks, EXAM_TERMS } from '../../hooks/useResults'
import { useGrading, GRADE_SCALE, BOOK_PASS_THRESHOLD } from '../../hooks/useGrading'
import { printResultReport } from './ResultReport'
import Alert from '../shared/Alert'
import LoadingSpinner from '../shared/LoadingSpinner'

const urduFont = { fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif" }

function GradeBadge({ grade, status }) {
  const color = status === 'pass' ? 'var(--dash-green)' : 'var(--dash-red)'
  const bg = status === 'pass' ? 'var(--dash-green-light)' : 'var(--dash-red-light)'
  return (
    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color, background: bg, ...urduFont }}>
      {grade}
    </span>
  )
}

export default function GradingDashboard({ isAdmin }) {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [classLoading, setClassLoading] = useState(true)
  const [examTerm, setExamTerm] = useState(EXAM_TERMS[2]) // سالانہ default
  const [examYear, setExamYear] = useState(new Date().getFullYear())
  const [view, setView] = useState('classes') // classes | results | detail | zimni

  const { books, fetchBooks } = useClassBooks()
  const {
    loading, error, success, setError, setSuccess,
    summaries, studentDetail,
    calculateResults, fetchSummaries, fetchStudentDetail, saveZimniMarks,
  } = useGrading()

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [zimniDrafts, setZimniDrafts] = useState({})

  const fetchClasses = useCallback(async () => {
    setClassLoading(true)
    const { data } = await supabase.from('classes').select('id, name, sort_order').order('sort_order', { ascending: true })
    setClasses(data || [])
    setClassLoading(false)
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])
  useEffect(() => { if (selectedClass) fetchBooks(selectedClass.id) }, [selectedClass, fetchBooks])

  const handleSelectClass = (cls) => {
    setSelectedClass(cls)
    setView('results')
  }

  useEffect(() => {
    if (view === 'results' && selectedClass) {
      fetchSummaries(selectedClass.name, examTerm, examYear)
    }
  }, [view, selectedClass, examTerm, examYear, fetchSummaries])

  const handleCalculate = async () => {
    if (!selectedClass || !books.length) return
    await calculateResults(selectedClass.name, examTerm, examYear, books)
    fetchSummaries(selectedClass.name, examTerm, examYear)
  }

  const handleViewDetail = async (summary) => {
    setSelectedStudent(summary)
    await fetchStudentDetail(summary.student_id, examTerm, examYear, books)
    setView('detail')
  }

  const handleViewZimni = () => {
    setZimniDrafts({})
    setView('zimni')
  }

  const handleSaveZimni = async () => {
    if (!selectedStudent || !studentDetail) return
    const entries = studentDetail
      .filter(b => b.needs_zimni || b.zimni_marks !== null)
      .filter(b => zimniDrafts[b.book.id] !== undefined)
      .map(b => ({
        book_id: b.book.id,
        zimni_marks: zimniDrafts[b.book.id],
        original_total: b.original_total,
      }))
    if (!entries.length) return
    const ok = await saveZimniMarks(selectedStudent.student_id, entries, examTerm, examYear)
    if (ok) {
      await fetchStudentDetail(selectedStudent.student_id, examTerm, examYear, books)
      // Recalculate after zimni
      await calculateResults(selectedClass.name, examTerm, examYear, books)
    }
  }

  const yearOptions = []
  for (let y = new Date().getFullYear() + 1; y >= 2020; y--) yearOptions.push(y)

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title" dir="rtl" style={urduFont}>
            {view === 'classes' ? 'نتائج و درجہ بندی' :
             view === 'results' ? `${selectedClass?.name} — نتائج` :
             view === 'detail' ? `${selectedStudent?.students?.name} — تفصیلی نتیجہ` :
             `${selectedStudent?.students?.name} — ضمنی امتحان`}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {view !== 'classes' && (
            <button className="sidebar-btn" onClick={() => {
              if (view === 'zimni') setView('detail')
              else if (view === 'detail') setView('results')
              else setView('classes')
            }} style={{ padding: '8px 16px' }}>→ واپس</button>
          )}
        </div>
      </div>

      <Alert error={error} success={success} />

      {/* ═══ CLASS LIST ═══ */}
      {view === 'classes' && (
        classLoading ? <LoadingSpinner message="لوڈ ہو رہا ہے…" /> :
        <div className="dash-card">
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead><tr><th>#</th><th dir="rtl">کلاس</th><th>عمل</th></tr></thead>
              <tbody>
                {classes.map((cls, i) => (
                  <tr key={cls.id} className="clickable-row" onClick={() => handleSelectClass(cls)}>
                    <td className="mono">{i + 1}</td>
                    <td dir="rtl" style={{ fontWeight: 600, ...urduFont }}>{cls.name}</td>
                    <td><button className="dash-btn" style={{ padding: '4px 12px', fontSize: '12px', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)', border: '1px solid var(--dash-accent)' }}>📊 نتائج</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ RESULTS SUMMARY ═══ */}
      {view === 'results' && selectedClass && (
        <>
          <div className="dash-card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text)', marginBottom: '4px' }} dir="rtl">امتحان</label>
                <select className="dash-input" value={examTerm} onChange={e => setExamTerm(e.target.value)} style={{ ...urduFont, minWidth: '130px' }}>
                  {EXAM_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text)', marginBottom: '4px' }} dir="rtl">سال</label>
                <select className="dash-input" value={examYear} onChange={e => setExamYear(Number(e.target.value))} style={{ minWidth: '90px' }}>
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {isAdmin && (
                <button className="dash-btn dash-btn-primary" onClick={handleCalculate} disabled={loading} style={{ padding: '8px 16px' }}>
                  {loading ? 'حساب ہو رہا ہے…' : '📊 نتائج مرتب کریں'}
                </button>
              )}
              {summaries.length > 0 && (
                <button
                  className="dash-btn"
                  style={{ padding: '8px 16px', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)', border: '1px solid var(--dash-accent)' }}
                  onClick={async () => {
                    // Batch print all result cards
                    const { printBatchResultReport } = await import('./ResultReport')
                    const studentIds = summaries.map(s => s.student_id)
                    const { data: fullStudents } = await supabase.from('students').select('id, name, father_name, serial_no, student_image, class_level').in('id', studentIds)
                    const studentMap = {}
                    for (const s of (fullStudents || [])) studentMap[s.id] = s

                    // Fetch detailed results for each student
                    const allBookResults = []
                    const allStudents = []
                    const allSummaries = []
                    for (const s of summaries) {
                      const { data: results } = await supabase.from('student_results').select('*').eq('student_id', s.student_id).eq('exam_term', examTerm).eq('year', examYear)
                      const bookResults = books.map(book => {
                        const termResult = (results || []).find(r => r.book_id === book.id && r.paper_type === 'term')
                        const finalResult = (results || []).find(r => r.book_id === book.id && r.paper_type === 'final')
                        const termMarks = termResult?.marks ?? null
                        const finalMarks = finalResult?.marks ?? null
                        const originalTotal = (Number(termMarks) || 0) + (Number(finalMarks) || 0)
                        const bookTotal = book.total_marks || 100
                        const percentage = bookTotal > 0 ? (originalTotal / bookTotal) * 100 : 0
                        const pass = percentage >= BOOK_PASS_THRESHOLD
                        const zimniMarks = termResult?.zimni_marks ?? null
                        const computedFinal = zimniMarks !== null ? Math.max(originalTotal, Number(zimniMarks)) : originalTotal
                        return { book, term_marks: termMarks, final_paper_marks: finalMarks, original_total: originalTotal, zimni_marks: zimniMarks, final_marks: computedFinal, book_total: bookTotal, percentage: Math.round(percentage * 10) / 10, pass, needs_zimni: !pass && zimniMarks === null }
                      })
                      const hasZimni = bookResults.some(b => b.zimni_marks !== null)
                      allStudents.push(studentMap[s.student_id] || s.students)
                      allBookResults.push(bookResults)
                      allSummaries.push({ ...s, _isZimni: hasZimni })
                    }
                    // Separate normal and zimni
                    const normalIdx = allSummaries.map((s, i) => !s._isZimni ? i : null).filter(i => i !== null)
                    const zimniIdx = allSummaries.map((s, i) => s._isZimni ? i : null).filter(i => i !== null)

                    if (normalIdx.length > 0) {
                      await printBatchResultReport({
                        students: normalIdx.map(i => allStudents[i]),
                        allBookResults: normalIdx.map(i => allBookResults[i]),
                        allSummaries: normalIdx.map(i => allSummaries[i]),
                        examTerm, year: examYear, isZimni: false,
                      })
                    }
                    if (zimniIdx.length > 0) {
                      await printBatchResultReport({
                        students: zimniIdx.map(i => allStudents[i]),
                        allBookResults: zimniIdx.map(i => allBookResults[i]),
                        allSummaries: zimniIdx.map(i => allSummaries[i]),
                        examTerm, year: examYear, isZimni: true,
                      })
                    }
                  }}
                >
                  🖨️ تمام نتائج پرنٹ
                </button>
              )}
            </div>
          </div>

          {/* Grade scale reference */}
          <div className="dash-card" style={{ marginBottom: '16px', padding: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', direction: 'rtl' }}>
              {GRADE_SCALE.map(g => (
                <span key={g.grade_en} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--dash-border)', ...urduFont }}>
                  {g.min}-{g.max}% = <strong>{g.grade_ur}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="dash-card">
            {loading ? <LoadingSpinner message="نتائج لوڈ ہو رہے ہیں…" /> :
            summaries.length === 0 ? <p className="dash-empty" dir="rtl" style={urduFont}>ابھی تک نتائج مرتب نہیں ہوئے — اوپر "نتائج مرتب کریں" بٹن دبائیں تاکہ نمبرات سے درجہ بندی ہو سکے</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th dir="rtl" style={urduFont}>نام</th>
                      <th dir="rtl" style={urduFont}>ولدیت</th>
                      <th style={{ textAlign: 'center' }}>%</th>
                      <th dir="rtl" style={{ textAlign: 'center', ...urduFont }}>درجہ</th>
                      <th dir="rtl" style={{ textAlign: 'center', ...urduFont }}>حیثیت</th>
                      <th dir="rtl" style={{ textAlign: 'center', ...urduFont }}>ضمنی</th>
                      <th>عمل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map((s, i) => (
                      <tr key={s.id} className="clickable-row" onClick={() => handleViewDetail(s)}>
                        <td className="mono">{i + 1}</td>
                        <td dir="rtl" style={{ fontWeight: 600, ...urduFont }}>{s.students?.name}</td>
                        <td dir="rtl" style={urduFont}>{s.students?.father_name || '—'}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{s.percentage}%</td>
                        <td style={{ textAlign: 'center' }}><GradeBadge grade={s.grade} status={s.status} /></td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: s.status === 'pass' ? 'var(--dash-green)' : 'var(--dash-red)' }}>
                            {s.status === 'pass' ? '✓ کامیاب' : '✗ ناکام'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {s.zimni_applicable && <span style={{ fontSize: '11px', color: 'var(--dash-orange)', fontWeight: 700 }}>⚠ ضروری</span>}
                        </td>
                        <td>
                          <button className="dash-btn" style={{ padding: '3px 8px', fontSize: '11px', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)', border: '1px solid var(--dash-accent)' }}
                            onClick={e => { e.stopPropagation(); handleViewDetail(s) }}>تفصیل</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ STUDENT DETAIL ═══ */}
      {view === 'detail' && selectedStudent && (
        <div className="dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', direction: 'rtl' }}>
            <h3 className="dash-card-title" style={{ margin: 0, ...urduFont }}>
              {selectedStudent.students?.name} — تفصیلی نتیجہ
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {studentDetail && (
                <button
                  className="dash-btn"
                  style={{ padding: '6px 14px', fontSize: '12px', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)', border: '1px solid var(--dash-accent)' }}
                  onClick={async () => {
                    // Fetch full student info for image
                    const { data: fullStudent } = await supabase.from('students').select('id, name, father_name, serial_no, student_image, class_level').eq('id', selectedStudent.student_id).single()
                    const hasZimni = studentDetail.some(b => b.zimni_marks !== null)
                    printResultReport({
                      student: fullStudent || selectedStudent.students,
                      bookResults: studentDetail,
                      summary: selectedStudent,
                      examTerm,
                      year: examYear,
                      isZimni: hasZimni,
                    })
                  }}
                >
                  🖨️ نتیجہ کارڈ
                </button>
              )}
              {selectedStudent.zimni_applicable && isAdmin && (
                <button className="dash-btn dash-btn-primary" onClick={handleViewZimni} style={{ padding: '6px 14px', fontSize: '12px' }}>
                  📝 ضمنی امتحان
                </button>
              )}
            </div>
          </div>

          {loading ? <LoadingSpinner /> : !studentDetail ? <p className="dash-empty">No data</p> : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th dir="rtl" style={urduFont}>کتاب</th>
                    <th style={{ textAlign: 'center' }}>ٹرم</th>
                    <th style={{ textAlign: 'center' }}>فائنل</th>
                    <th style={{ textAlign: 'center' }}>کل</th>
                    <th style={{ textAlign: 'center' }}>/{' '}</th>
                    <th style={{ textAlign: 'center' }}>%</th>
                    <th style={{ textAlign: 'center' }}>ضمنی</th>
                    <th style={{ textAlign: 'center' }}>حتمی</th>
                    <th dir="rtl" style={{ textAlign: 'center', ...urduFont }}>حیثیت</th>
                  </tr>
                </thead>
                <tbody>
                  {studentDetail.map((b, i) => (
                    <tr key={b.book.id} style={{ background: !b.pass ? 'var(--dash-red-light)' : '' }}>
                      <td className="mono">{i + 1}</td>
                      <td dir="rtl" style={{ fontWeight: 600, ...urduFont }}>{b.book.book_name}</td>
                      <td style={{ textAlign: 'center' }}>{b.term_marks ?? '—'}</td>
                      <td style={{ textAlign: 'center' }}>{b.final_paper_marks ?? '—'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{b.original_total}</td>
                      <td style={{ textAlign: 'center', color: 'var(--dash-text)' }}>{b.book_total}</td>
                      <td style={{ textAlign: 'center' }}>{b.percentage}%</td>
                      <td style={{ textAlign: 'center', color: b.zimni_marks !== null ? 'var(--dash-accent)' : 'var(--dash-text)' }}>
                        {b.zimni_marks !== null ? b.zimni_marks : '—'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{b.final_marks}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: b.pass ? 'var(--dash-green)' : 'var(--dash-red)' }}>
                          {b.pass ? '✓' : '✗'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ ZIMNI IMTEHAN ═══ */}
      {view === 'zimni' && selectedStudent && studentDetail && (
        <div className="dash-card">
          <h3 className="dash-card-title" dir="rtl" style={urduFont}>ضمنی امتحان — {selectedStudent.students?.name}</h3>
          <p dir="rtl" style={{ fontSize: '12px', color: 'var(--dash-text)', marginBottom: '12px', ...urduFont }}>
            صرف ناکام کتابوں کے ضمنی نمبرات درج کریں۔ اصل نمبرات تبدیل نہیں ہوں گے۔
          </p>

          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th dir="rtl" style={urduFont}>کتاب</th>
                  <th style={{ textAlign: 'center' }}>اصل نمبر</th>
                  <th style={{ textAlign: 'center' }}>کل</th>
                  <th style={{ textAlign: 'center' }}>%</th>
                  <th style={{ textAlign: 'center', ...urduFont }}>ضمنی نمبر</th>
                </tr>
              </thead>
              <tbody>
                {studentDetail.filter(b => b.needs_zimni || b.zimni_marks !== null).map((b, i) => (
                  <tr key={b.book.id}>
                    <td className="mono">{i + 1}</td>
                    <td dir="rtl" style={{ fontWeight: 600, ...urduFont }}>{b.book.book_name}</td>
                    <td style={{ textAlign: 'center' }}>{b.original_total}</td>
                    <td style={{ textAlign: 'center', color: 'var(--dash-text)' }}>{b.book_total}</td>
                    <td style={{ textAlign: 'center', color: 'var(--dash-red)', fontWeight: 600 }}>{b.percentage}%</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>
                      <input
                        className="dash-input"
                        type="number"
                        min="0"
                        max={b.book_total}
                        value={zimniDrafts[b.book.id] ?? (b.zimni_marks ?? '')}
                        onChange={e => setZimniDrafts(d => ({ ...d, [b.book.id]: e.target.value }))}
                        style={{ width: '70px', textAlign: 'center', padding: '4px', fontSize: '13px' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isAdmin && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <button className="dash-btn dash-btn-primary" onClick={handleSaveZimni} disabled={loading} style={{ padding: '8px 16px' }}>
                {loading ? 'محفوظ ہو رہا ہے…' : '💾 ضمنی نمبرات محفوظ کریں'}
              </button>
              <button className="sidebar-btn" onClick={() => setView('detail')}>منسوخ</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
