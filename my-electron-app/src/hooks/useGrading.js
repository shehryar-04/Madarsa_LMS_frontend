import { useState, useCallback } from 'react'
import { supabase } from '../Auth/SupabaseClient'

/**
 * Grading scale:
 * 81-100 → ممتاز (Excellent)
 * 60-80  → جيد جداً (Very Good)
 * 50-59  → جيد (Good)
 * 40-49  → مقبول (Pass)
 * 0-39   → راسب (Fail)
 */
export const GRADE_SCALE = [
  { min: 81, max: 100, grade_ur: 'ممتاز', grade_en: 'Excellent' },
  { min: 60, max: 80, grade_ur: 'جيد جداً', grade_en: 'Very Good' },
  { min: 50, max: 59, grade_ur: 'جيد', grade_en: 'Good' },
  { min: 40, max: 49, grade_ur: 'مقبول', grade_en: 'Pass' },
  { min: 0, max: 39, grade_ur: 'راسب', grade_en: 'Fail' },
]

export const BOOK_PASS_THRESHOLD = 40 // percentage

export function getGrade(percentage) {
  const pct = Math.round(percentage)
  for (const g of GRADE_SCALE) {
    if (pct >= g.min && pct <= g.max) return g
  }
  return GRADE_SCALE[GRADE_SCALE.length - 1]
}

export function useGrading() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [summaries, setSummaries] = useState([])
  const [studentDetail, setStudentDetail] = useState(null)

  /**
   * Calculate and store results for all students in a class/term/year.
   * Reads from student_results, computes grades, writes to student_result_summary.
   */
  const calculateResults = useCallback(async (classLevel, examTerm, year, books) => {
    setLoading(true)
    setError('')
    setSuccess('')

    // Get all active students in this class
    const { data: students, error: sErr } = await supabase
      .from('students')
      .select('id, name, father_name, serial_no')
      .eq('class_level', classLevel)
      .eq('status', 'current')
      .order('name', { ascending: true })

    if (sErr) { setError(sErr.message); setLoading(false); return }
    if (!students?.length) { setError('اس کلاس میں کوئی طالب علم نہیں'); setLoading(false); return }

    const studentIds = students.map(s => s.id)

    // Get all results for these students
    const { data: results, error: rErr } = await supabase
      .from('student_results')
      .select('*')
      .in('student_id', studentIds)
      .eq('exam_term', examTerm)
      .eq('year', year)

    if (rErr) { setError(rErr.message); setLoading(false); return }

    // Process each student
    const summaryRows = []
    const bookUpdates = []

    for (const student of students) {
      const studentResults = (results || []).filter(r => r.student_id === student.id)
      let totalObtained = 0
      let totalPossible = 0
      let hasFailedBook = false

      for (const book of books) {
        // Get term + final marks for this book
        const termResult = studentResults.find(r => r.book_id === book.id && r.paper_type === 'term')
        const finalResult = studentResults.find(r => r.book_id === book.id && r.paper_type === 'final')

        const termMarks = termResult?.marks ?? 0
        const finalMarks = finalResult?.marks ?? 0
        const originalTotal = Number(termMarks) + Number(finalMarks)
        const bookTotal = book.total_marks || 100
        const bookPct = bookTotal > 0 ? (originalTotal / bookTotal) * 100 : 0
        const bookPass = bookPct >= BOOK_PASS_THRESHOLD

        // Use final_marks if zimni was taken, otherwise original
        const finalMarksValue = termResult?.final_marks ?? originalTotal

        totalObtained += finalMarksValue
        totalPossible += bookTotal

        if (!bookPass && !termResult?.zimni_marks) hasFailedBook = true

        // Update book_pass and final_marks on the term record
        if (termResult) {
          bookUpdates.push({
            id: termResult.id,
            book_pass: bookPass,
            final_marks: finalMarksValue,
          })
        }
      }

      const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0
      const gradeInfo = getGrade(percentage)
      const status = percentage >= BOOK_PASS_THRESHOLD ? 'pass' : 'fail'

      summaryRows.push({
        student_id: student.id,
        class_level: classLevel,
        exam_term: examTerm,
        year: year,
        total_obtained: Math.round(totalObtained * 100) / 100,
        total_possible: totalPossible,
        percentage: Math.round(percentage * 100) / 100,
        grade: gradeInfo.grade_ur,
        grade_en: gradeInfo.grade_en,
        status,
        zimni_applicable: hasFailedBook,
        updated_at: new Date().toISOString(),
      })
    }

    // Upsert summaries
    const { error: uErr } = await supabase
      .from('student_result_summary')
      .upsert(summaryRows, { onConflict: 'student_id,class_level,exam_term,year' })

    if (uErr) { setError(uErr.message); setLoading(false); return }

    // Update book_pass flags (batch)
    for (const upd of bookUpdates) {
      await supabase.from('student_results').update({ book_pass: upd.book_pass, final_marks: upd.final_marks }).eq('id', upd.id)
    }

    setSuccess('نتائج کامیابی سے محفوظ ہو گئے')
    setLoading(false)
    return summaryRows
  }, [])

  /**
   * Fetch result summaries for a class/term/year
   */
  const fetchSummaries = useCallback(async (classLevel, examTerm, year) => {
    setLoading(true)
    setError('')

    // Fetch summaries
    const { data: sumData, error: sumErr } = await supabase
      .from('student_result_summary')
      .select('*')
      .eq('class_level', classLevel)
      .eq('exam_term', examTerm)
      .eq('year', year)
      .order('percentage', { ascending: false })

    if (sumErr) { setError(sumErr.message); setLoading(false); return }
    if (!sumData?.length) { setSummaries([]); setLoading(false); return }

    // Fetch student names
    const studentIds = sumData.map(s => s.student_id)
    const { data: studentData } = await supabase
      .from('students')
      .select('id, name, father_name, serial_no')
      .in('id', studentIds)

    const studentMap = {}
    for (const s of (studentData || [])) studentMap[s.id] = s

    // Merge
    const merged = sumData.map(s => ({
      ...s,
      students: studentMap[s.student_id] || { name: '—', father_name: '—', serial_no: '' },
    }))

    setSummaries(merged)
    setLoading(false)
  }, [])

  /**
   * Fetch detailed book-wise results for a single student
   */
  const fetchStudentDetail = useCallback(async (studentId, examTerm, year, books) => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('student_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('exam_term', examTerm)
      .eq('year', year)

    if (err) { setError(err.message); setLoading(false); return }

    // Build book-wise breakdown
    const bookResults = books.map(book => {
      const termResult = (data || []).find(r => r.book_id === book.id && r.paper_type === 'term')
      const finalResult = (data || []).find(r => r.book_id === book.id && r.paper_type === 'final')
      const termMarks = termResult?.marks ?? null
      const finalMarks = finalResult?.marks ?? null
      const originalTotal = (Number(termMarks) || 0) + (Number(finalMarks) || 0)
      const bookTotal = book.total_marks || 100
      const percentage = bookTotal > 0 ? (originalTotal / bookTotal) * 100 : 0
      const pass = percentage >= BOOK_PASS_THRESHOLD
      const zimniMarks = termResult?.zimni_marks ?? null
      const computedFinal = zimniMarks !== null ? Math.max(originalTotal, Number(zimniMarks)) : originalTotal

      return {
        book,
        term_marks: termMarks,
        final_paper_marks: finalMarks,
        original_total: originalTotal,
        zimni_marks: zimniMarks,
        final_marks: computedFinal,
        book_total: bookTotal,
        percentage: Math.round(percentage * 10) / 10,
        pass,
        needs_zimni: !pass && zimniMarks === null,
      }
    })

    setStudentDetail(bookResults)
    setLoading(false)
  }, [])

  /**
   * Save zimni marks for a student's failed books
   * Does NOT overwrite original marks — stores in zimni_marks column
   */
  const saveZimniMarks = useCallback(async (studentId, zimniEntries, examTerm, year) => {
    setError('')
    setSuccess('')

    for (const entry of zimniEntries) {
      // Update the term record's zimni_marks
      const { error: err } = await supabase
        .from('student_results')
        .update({
          zimni_marks: entry.zimni_marks !== '' ? Number(entry.zimni_marks) : null,
          final_marks: entry.zimni_marks !== ''
            ? Math.max(entry.original_total, Number(entry.zimni_marks))
            : entry.original_total,
        })
        .eq('student_id', studentId)
        .eq('book_id', entry.book_id)
        .eq('exam_term', examTerm)
        .eq('year', year)
        .eq('paper_type', 'term')

      if (err) { setError(err.message); return false }
    }

    setSuccess('ضمنی نمبرات محفوظ ہو گئے')
    return true
  }, [])

  return {
    loading, error, success, setError, setSuccess,
    summaries, studentDetail,
    calculateResults, fetchSummaries, fetchStudentDetail, saveZimniMarks,
  }
}
