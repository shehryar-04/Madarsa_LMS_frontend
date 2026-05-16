import { useState, useCallback } from 'react'
import { supabase } from '../Auth/SupabaseClient'

export const EXAM_TERMS = ['سہ ماہی', 'ششماہی', 'سالانہ']
export const PAPER_TYPES = [
  { key: 'term', label: 'ٹرم', defaultMax: 40 },
  { key: 'final', label: 'فائنل', defaultMax: 60 },
]

export function useClassBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchBooks = useCallback(async (classId) => {
    if (!classId) { setBooks([]); return }
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('class_books')
      .select('*')
      .eq('class_id', classId)
      .order('sort_order', { ascending: true })
    if (err) setError(err.message)
    else setBooks(data || [])
    setLoading(false)
  }, [])

  const addBook = async (classId, bookName, totalMarks = 100, termMarks = 40, finalMarks = 60) => {
    setError('')
    setSuccess('')
    if (!bookName?.trim()) { setError('کتاب کا نام درج کریں'); return false }
    const { error: err } = await supabase
      .from('class_books')
      .insert({
        class_id: classId,
        book_name: bookName.trim(),
        total_marks: Number(totalMarks) || 100,
        term_marks: Number(termMarks) || 40,
        final_marks: Number(finalMarks) || 60,
      })
    if (err) { setError(err.message); return false }
    setSuccess('کتاب شامل ہو گئی')
    await fetchBooks(classId)
    return true
  }

  const updateBook = async (bookId, updates, classId) => {
    setError('')
    setSuccess('')
    const { error: err } = await supabase
      .from('class_books')
      .update(updates)
      .eq('id', bookId)
    if (err) { setError(err.message); return false }
    setSuccess('کتاب اپ ڈیٹ ہو گئی')
    await fetchBooks(classId)
    return true
  }

  const deleteBook = async (bookId, classId) => {
    setError('')
    const { error: err } = await supabase.from('class_books').delete().eq('id', bookId)
    if (err) { setError(err.message); return false }
    setSuccess('کتاب حذف ہو گئی')
    await fetchBooks(classId)
    return true
  }

  return { books, loading, error, success, setError, setSuccess, fetchBooks, addBook, updateBook, deleteBook }
}

export function useStudentResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchResults = useCallback(async (classLevel, examTerm, year) => {
    if (!classLevel || !examTerm || !year) { setResults([]); return }
    setLoading(true)
    setError('')

    const { data: students, error: sErr } = await supabase
      .from('students')
      .select('id, name, father_name, serial_no')
      .eq('class_level', classLevel)
      .eq('status', 'current')
      .order('name', { ascending: true })

    if (sErr) { setError(sErr.message); setLoading(false); return }

    const studentIds = (students || []).map(s => s.id)
    let resultRows = []
    if (studentIds.length > 0) {
      const { data: rData, error: rErr } = await supabase
        .from('student_results')
        .select('*')
        .in('student_id', studentIds)
        .eq('exam_term', examTerm)
        .eq('year', year)
      if (rErr) { setError(rErr.message); setLoading(false); return }
      resultRows = rData || []
    }

    // Merge: each student gets results keyed by `${bookId}_${paperType}`
    const merged = (students || []).map(s => {
      const studentResults = {}
      for (const r of resultRows) {
        if (r.student_id === s.id) {
          const key = `${r.book_id}_${r.paper_type || 'term'}`
          studentResults[key] = r
        }
      }
      return { ...s, results: studentResults }
    })

    setResults(merged)
    setLoading(false)
  }, [])

  const saveResult = async ({ studentId, bookId, examTerm, year, marks, totalMarks, paperType }) => {
    setError('')
    const { error: err } = await supabase
      .from('student_results')
      .upsert({
        student_id: studentId,
        book_id: bookId,
        exam_term: examTerm,
        year: year,
        marks: marks !== '' && marks !== null ? Number(marks) : null,
        total_marks: totalMarks ? Number(totalMarks) : 100,
        paper_type: paperType || 'term',
      }, { onConflict: 'student_id,book_id,exam_term,year,paper_type' })
    if (err) { setError(err.message); return false }
    return true
  }

  return { results, loading, error, success, setError, setSuccess, fetchResults, saveResult }
}
