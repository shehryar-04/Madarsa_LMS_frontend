import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../Auth/SupabaseClient'
import { useClassBooks, useStudentResults, EXAM_TERMS, PAPER_TYPES } from '../../hooks/useResults'
import Alert from '../shared/Alert'
import LoadingSpinner from '../shared/LoadingSpinner'

const urduFont = { fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif" }

export default function ResultsDashboard({ isAdmin }) {
  // ── Classes ──
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [classLoading, setClassLoading] = useState(true)

  // ── Books ──
  const { books, loading: booksLoading, error: booksError, success: booksSuccess, fetchBooks, addBook, updateBook, deleteBook } = useClassBooks()
  const [newBook, setNewBook] = useState({ name: '', total: 100, term: 40, final: 60 })
  const [editingBook, setEditingBook] = useState(null)

  // ── Results ──
  const { results, loading: resultsLoading, error: resultsError, fetchResults, saveResult } = useStudentResults()
  const [examTerm, setExamTerm] = useState(EXAM_TERMS[0])
  const [examYear, setExamYear] = useState(new Date().getFullYear())
  const [marksDrafts, setMarksDrafts] = useState({})
  const [savingMarks, setSavingMarks] = useState(false)

  const [view, setView] = useState('classes')

  const fetchClasses = useCallback(async () => {
    setClassLoading(true)
    const { data } = await supabase.from('classes').select('id, name, sort_order').order('sort_order', { ascending: true })
    setClasses(data || [])
    setClassLoading(false)
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])
  useEffect(() => { if (selectedClass) fetchBooks(selectedClass.id) }, [selectedClass, fetchBooks])
  useEffect(() => {
    if (view === 'results' && selectedClass && examTerm && examYear) {
      fetchResults(selectedClass.name, examTerm, examYear)
      setMarksDrafts({})
    }
  }, [view, selectedClass, examTerm, examYear, fetchResults])

  const handleSelectClass = (cls) => { setSelectedClass(cls); setView('books') }

  const handleAddBook = async () => {
    if (!selectedClass) return
    const ok = await addBook(selectedClass.id, newBook.name, newBook.total, newBook.term, newBook.final)
    if (ok) setNewBook({ name: '', total: 100, term: 40, final: 60 })
  }

  const handleSaveBookSettings = async (book) => {
    if (!editingBook) return
    await updateBook(book.id, {
      book_name: editingBook.book_name,
      total_marks: Number(editingBook.total_marks) || 100,
      term_marks: Number(editingBook.term_marks) || 40,
      final_marks: Number(editingBook.final_marks) || 60,
    }, selectedClass.id)
    setEditingBook(null)
  }

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('کیا آپ واقعی اس کتاب کو حذف کرنا چاہتے ہیں؟')) return
    await deleteBook(bookId, selectedClass.id)
  }

  // marksDrafts key: `${studentId}_${bookId}_${paperType}`
  const handleMarkChange = (studentId, bookId, paperType, value) => {
    setMarksDrafts(d => ({ ...d, [`${studentId}_${bookId}_${paperType}`]: value }))
  }

  const handleSaveAllMarks = async () => {
    setSavingMarks(true)
    let allOk = true
    for (const [key, value] of Object.entries(marksDrafts)) {
      const parts = key.split('_')
      const studentId = Number(parts[0])
      const bookId = Number(parts[1])
      const paperType = parts[2]
      const book = books.find(b => b.id === bookId)
      const maxMarks = paperType === 'term' ? (book?.term_marks || 40) : (book?.final_marks || 60)
      const ok = await saveResult({
        studentId, bookId, examTerm, year: examYear,
        marks: value, totalMarks: maxMarks, paperType,
      })
      if (!ok) allOk = false
    }
    setSavingMarks(false)
    if (allOk) {
      setMarksDrafts({})
      fetchResults(selectedClass.name, examTerm, examYear)
    }
  }

  const error = booksError || resultsError
  const success = booksSuccess

  const yearOptions = []
  for (let y = new Date().getFullYear() + 1; y >= 2020; y--) yearOptions.push(y)

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title" dir="rtl" style={urduFont}>
            {view === 'classes' ? 'نتائج — کلاس منتخب کریں' :
             view === 'books' ? `${selectedClass?.name} — کتابیں اور ترتیبات` :
             `${selectedClass?.name} — نتائج درج کریں`}
          </h2>
          <p className="dash-page-subtitle" dir="rtl" style={urduFont}>
            {view === 'classes' ? 'نتائج درج کرنے کے لیے کلاس منتخب کریں' :
             view === 'books' ? 'ہر کتاب کے کل نمبر، ٹرم اور فائنل نمبر مقرر کریں' :
             `${examTerm} — ${examYear}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {view !== 'classes' && (
            <button className="sidebar-btn" onClick={() => { setView(view === 'results' ? 'books' : 'classes'); setEditingBook(null) }} style={{ padding: '8px 16px' }}>
              → واپس
            </button>
          )}
          {view === 'books' && books.length > 0 && (
            <button className="dash-btn dash-btn-primary" onClick={() => setView('results')} style={{ padding: '8px 16px' }}>
              📝 نتائج درج کریں
            </button>
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
              <thead><tr><th style={{ width: '40px' }}>#</th><th dir="rtl">کلاس</th><th style={{ width: '120px' }}>عمل</th></tr></thead>
              <tbody>
                {classes.map((cls, i) => (
                  <tr key={cls.id} className="clickable-row" onClick={() => handleSelectClass(cls)}>
                    <td className="mono">{i + 1}</td>
                    <td dir="rtl" style={{ fontWeight: 600, fontSize: '15px', ...urduFont }}>{cls.name}</td>
                    <td>
                      <button className="dash-btn" style={{ padding: '4px 12px', fontSize: '12px', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)', border: '1px solid var(--dash-accent)' }}
                        onClick={e => { e.stopPropagation(); handleSelectClass(cls) }}>📚 کتابیں</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ BOOKS MANAGEMENT ═══ */}
      {view === 'books' && selectedClass && (
        <>
          {isAdmin && (
            <div className="dash-card" style={{ marginBottom: '16px' }}>
              <h3 className="dash-card-title" dir="rtl" style={urduFont}>نئی کتاب شامل کریں</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text)', marginBottom: '4px' }} dir="rtl">کتاب کا نام</label>
                  <input className="dash-input" dir="rtl" value={newBook.name} onChange={e => setNewBook(b => ({ ...b, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddBook()} placeholder="کتاب کا نام" style={{ width: '100%', boxSizing: 'border-box', ...urduFont }} />
                </div>
                <div style={{ flex: '0 0 80px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text)', marginBottom: '4px' }} dir="rtl">کل نمبر</label>
                  <input className="dash-input" type="number" value={newBook.total} onChange={e => setNewBook(b => ({ ...b, total: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center' }} />
                </div>
                <div style={{ flex: '0 0 80px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text)', marginBottom: '4px' }} dir="rtl">ٹرم</label>
                  <input className="dash-input" type="number" value={newBook.term} onChange={e => setNewBook(b => ({ ...b, term: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center' }} />
                </div>
                <div style={{ flex: '0 0 80px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text)', marginBottom: '4px' }} dir="rtl">فائنل</label>
                  <input className="dash-input" type="number" value={newBook.final} onChange={e => setNewBook(b => ({ ...b, final: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center' }} />
                </div>
                <button className="dash-btn dash-btn-primary" onClick={handleAddBook} style={{ height: '40px', padding: '0 20px' }}>➕ شامل کریں</button>
              </div>
            </div>
          )}

          <div className="dash-card">
            <h3 className="dash-card-title" dir="rtl" style={urduFont}>کتابیں ({books.length})</h3>
            {booksLoading ? <LoadingSpinner message="لوڈ ہو رہا ہے…" /> :
            books.length === 0 ? <p className="dash-empty" dir="rtl" style={urduFont}>ابھی تک کوئی کتاب شامل نہیں</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36px' }}>#</th>
                      <th dir="rtl">کتاب</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>کل</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>ٹرم</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>فائنل</th>
                      {isAdmin && <th style={{ width: '160px' }}>عمل</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book, i) => {
                      const isEditing = editingBook?.id === book.id
                      return (
                        <tr key={book.id}>
                          <td className="mono">{i + 1}</td>
                          <td dir="rtl" style={{ ...urduFont, fontSize: '15px' }}>
                            {isEditing ? (
                              <input className="dash-input" dir="rtl" value={editingBook.book_name}
                                onChange={e => setEditingBook(b => ({ ...b, book_name: e.target.value }))}
                                style={{ width: '100%', ...urduFont }} />
                            ) : <span style={{ fontWeight: 600 }}>{book.book_name}</span>}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isEditing ? (
                              <input className="dash-input" type="number" value={editingBook.total_marks}
                                onChange={e => setEditingBook(b => ({ ...b, total_marks: e.target.value }))}
                                style={{ width: '55px', textAlign: 'center', padding: '3px' }} />
                            ) : <strong>{book.total_marks || 100}</strong>}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isEditing ? (
                              <input className="dash-input" type="number" value={editingBook.term_marks}
                                onChange={e => setEditingBook(b => ({ ...b, term_marks: e.target.value }))}
                                style={{ width: '55px', textAlign: 'center', padding: '3px' }} />
                            ) : <span style={{ color: 'var(--dash-accent)' }}>{book.term_marks || 40}</span>}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isEditing ? (
                              <input className="dash-input" type="number" value={editingBook.final_marks}
                                onChange={e => setEditingBook(b => ({ ...b, final_marks: e.target.value }))}
                                style={{ width: '55px', textAlign: 'center', padding: '3px' }} />
                            ) : <span style={{ color: 'var(--dash-accent)' }}>{book.final_marks || 60}</span>}
                          </td>
                          {isAdmin && (
                            <td>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {isEditing ? (
                                  <>
                                    <button className="dash-btn dash-btn-primary" onClick={() => handleSaveBookSettings(book)} style={{ padding: '3px 8px', fontSize: '11px' }}>💾</button>
                                    <button className="sidebar-btn" onClick={() => setEditingBook(null)} style={{ padding: '3px 8px', fontSize: '11px' }}>✕</button>
                                  </>
                                ) : (
                                  <>
                                    <button className="sidebar-btn" onClick={() => setEditingBook({ ...book })} style={{ padding: '3px 8px', fontSize: '11px' }}>✏️</button>
                                    <button className="sidebar-btn" onClick={() => handleDeleteBook(book.id)} style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--dash-red)' }}>🗑️</button>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ RESULTS ENTRY ═══ */}
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
              {isAdmin && Object.keys(marksDrafts).length > 0 && (
                <button className="dash-btn dash-btn-primary" onClick={handleSaveAllMarks} disabled={savingMarks} style={{ padding: '8px 16px' }}>
                  {savingMarks ? 'محفوظ ہو رہا ہے…' : `💾 محفوظ کریں (${Object.keys(marksDrafts).length})`}
                </button>
              )}
            </div>
          </div>

          <div className="dash-card">
            {resultsLoading ? <LoadingSpinner message="نتائج لوڈ ہو رہے ہیں…" /> :
            results.length === 0 ? <p className="dash-empty" dir="rtl" style={urduFont}>اس کلاس میں کوئی فعال طالب علم نہیں</p> :
            books.length === 0 ? <p className="dash-empty" dir="rtl" style={urduFont}>پہلے کتابیں شامل کریں</p> : (
              <div className="dash-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="dash-table" style={{ minWidth: `${250 + books.length * 160}px` }}>
                  <thead>
                    <tr>
                      <th rowSpan="2" style={{ width: '36px', verticalAlign: 'bottom' }}>#</th>
                      <th rowSpan="2" dir="rtl" style={{ minWidth: '110px', verticalAlign: 'bottom', ...urduFont }}>نام</th>
                      <th rowSpan="2" dir="rtl" style={{ minWidth: '90px', verticalAlign: 'bottom', ...urduFont }}>ولدیت</th>
                      {books.map(b => (
                        <th key={b.id} colSpan="3" style={{ textAlign: 'center', borderBottom: '1px solid var(--dash-border)', ...urduFont }}>
                          {b.book_name}
                          <div style={{ fontSize: '9px', fontWeight: 400, opacity: 0.7, marginTop: '2px' }}>
                            (کل: {b.total_marks || 100})
                          </div>
                        </th>
                      ))}
                      <th rowSpan="2" style={{ width: '60px', textAlign: 'center', verticalAlign: 'bottom' }}>مجموعہ</th>
                    </tr>
                    <tr>
                      {books.map(b => (
                        <React.Fragment key={`sub_${b.id}`}>
                          <th style={{ textAlign: 'center', fontSize: '10px', padding: '3px 4px', background: 'var(--dash-surface-2)', color: 'var(--dash-accent)' }}>
                            ٹرم<br/><span style={{ fontSize: '9px', opacity: 0.7 }}>/{b.term_marks || 40}</span>
                          </th>
                          <th style={{ textAlign: 'center', fontSize: '10px', padding: '3px 4px', background: 'var(--dash-surface-2)', color: 'var(--dash-accent)' }}>
                            فائنل<br/><span style={{ fontSize: '9px', opacity: 0.7 }}>/{b.final_marks || 60}</span>
                          </th>
                          <th style={{ textAlign: 'center', fontSize: '10px', padding: '3px 4px', background: 'var(--dash-surface-2)', fontWeight: 700 }}>
                            کل<br/><span style={{ fontSize: '9px', opacity: 0.7 }}>/{b.total_marks || 100}</span>
                          </th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((student, i) => {
                      let grandTotal = 0
                      return (
                        <tr key={student.id}>
                          <td className="mono">{i + 1}</td>
                          <td dir="rtl" style={{ fontWeight: 600, ...urduFont }}>{student.name}</td>
                          <td dir="rtl" style={urduFont}>{student.father_name || '—'}</td>
                          {books.map(b => {
                            const termKey = `${student.id}_${b.id}_term`
                            const finalKey = `${student.id}_${b.id}_final`
                            const termExisting = student.results[`${b.id}_term`]
                            const finalExisting = student.results[`${b.id}_final`]
                            const termVal = marksDrafts[termKey] !== undefined ? marksDrafts[termKey] : (termExisting?.marks ?? '')
                            const finalVal = marksDrafts[finalKey] !== undefined ? marksDrafts[finalKey] : (finalExisting?.marks ?? '')
                            const termNum = termVal !== '' && !isNaN(termVal) ? Number(termVal) : 0
                            const finalNum = finalVal !== '' && !isNaN(finalVal) ? Number(finalVal) : 0
                            const bookTotal = termNum + finalNum
                            if (termVal !== '' || finalVal !== '') grandTotal += bookTotal

                            const inputStyle = { width: '48px', textAlign: 'center', padding: '3px', fontSize: '12px' }

                            return (
                              <React.Fragment key={b.id}>
                                <td style={{ textAlign: 'center', padding: '3px' }}>
                                  {isAdmin ? (
                                    <input className="dash-input" type="number" min="0" max={b.term_marks || 40}
                                      value={termVal} onChange={e => handleMarkChange(student.id, b.id, 'term', e.target.value)}
                                      style={inputStyle} />
                                  ) : <span>{termVal || '—'}</span>}
                                </td>
                                <td style={{ textAlign: 'center', padding: '3px' }}>
                                  {isAdmin ? (
                                    <input className="dash-input" type="number" min="0" max={b.final_marks || 60}
                                      value={finalVal} onChange={e => handleMarkChange(student.id, b.id, 'final', e.target.value)}
                                      style={inputStyle} />
                                  ) : <span>{finalVal || '—'}</span>}
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 600, color: bookTotal > 0 ? 'var(--dash-text-bright)' : 'var(--dash-text)', fontSize: '12px' }}>
                                  {(termVal !== '' || finalVal !== '') ? bookTotal : '—'}
                                </td>
                              </React.Fragment>
                            )
                          })}
                          <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '13px', color: 'var(--dash-accent)' }}>
                            {grandTotal > 0 ? grandTotal : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
