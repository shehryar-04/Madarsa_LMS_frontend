import { useState } from 'react'
import html2pdf from 'html2pdf.js'
import { REPORT_FIELDS } from '../constants/student'

const DEFAULT_FIELDS = ['name', 'father_name', 'student_type', 'class_level', 'district', 'phone']
const MONO_FIELDS = new Set(['cnic', 'phone', 'guardian_phone', 'guardian_cnic'])

function buildReportHtml(records, fields, subtitle) {
  const now = new Date()
  const orientation = fields.length <= 3 ? 'portrait' : 'landscape'
  const containerWidth = fields.length <= 3 ? '794px' : '1040px'

  const headersHtml = fields
    .map(f => `<th style="background:#6c5ce7;color:#fff;font-weight:700;font-size:10px;text-transform:uppercase;padding:8px 6px;text-align:left;">${REPORT_FIELDS[f]}</th>`)
    .join('')

  const rowsHtml = records.map((s, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8f8fc' : '#fff'};">
      <td style="padding:6px;border-bottom:1px solid #e8ecf1;">${i + 1}</td>
      ${fields.map(f => {
        const mono = MONO_FIELDS.has(f) ? 'font-family:monospace;' : ''
        return `<td style="padding:6px;border-bottom:1px solid #e8ecf1;${mono}" dir="auto">${s[f] || '—'}</td>`
      }).join('')}
    </tr>
  `).join('')

  return `
    <div style="font-family:'Inter','Noto Naskh Arabic',sans-serif;color:#1a1a2e;background:#fff;padding:20px;width:${containerWidth};box-sizing:border-box;">
      <div style="margin-bottom:20px;border-bottom:3px solid #6c5ce7;padding-bottom:16px;">
        <h1 style="font-size:22px;font-weight:700;margin:0 0 4px;">Madarsa LMS — Student Report</h1>
        <p style="font-size:12px;color:#666;margin:0;">${subtitle}</p>
        <p style="font-size:12px;color:#666;margin:4px 0 0;">Generated: ${now.toLocaleString()}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:8px;">
        <thead>
          <tr>
            <th style="background:#6c5ce7;color:#fff;font-weight:700;font-size:10px;text-transform:uppercase;padding:8px 6px;text-align:left;">#</th>
            ${headersHtml}
          </tr>
        </thead>
        <tbody style="font-size:11px;">${rowsHtml}</tbody>
      </table>
      <div style="margin-top:18px;padding-top:10px;border-top:1px solid #ddd;font-size:10px;color:#999;display:flex;justify-content:space-between;">
        <span>Madarsa LMS Student Management System</span>
        <span>${records.length.toLocaleString()} students</span>
      </div>
    </div>
  `
}

export function usePdfReport({ buildFilteredQuery, filters }) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedFields, setSelectedFields] = useState(DEFAULT_FIELDS)

  const generatePDF = async (setError) => {
    setPdfLoading(true)
    setError('')

    try {
      // Fetch all matching records in batches
      let allRecords = []
      const batchSize = 1000
      let page = 0
      let hasMore = true

      while (hasMore) {
        const from = page * batchSize
        const selectStr = ['id', ...selectedFields].join(',')
        const { data, error: fetchErr } = await buildFilteredQuery(selectStr, {}, filters)
          .order('id', { ascending: true })
          .range(from, from + batchSize - 1)

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

      setShowReportModal(false)

      // Build subtitle from active filters
      const { filterType, filterDistrict, filterYear, appliedSearch } = filters
      const parts = []
      if (filterType) parts.push(`Type: ${filterType}`)
      if (filterDistrict) parts.push(`District: ${filterDistrict}`)
      if (filterYear) parts.push(`Year: ${filterYear}`)
      if (appliedSearch) parts.push(`Search: "${appliedSearch}"`)
      const subtitle = parts.length > 0
        ? `Filters: ${parts.join(' | ')} — ${allRecords.length.toLocaleString()} students`
        : `All Students — ${allRecords.length.toLocaleString()} total`

      const orientation = selectedFields.length <= 3 ? 'portrait' : 'landscape'
      const html = buildReportHtml(allRecords, selectedFields, subtitle)

      const container = document.createElement('div')
      container.innerHTML = html

      await html2pdf().set({
        margin: 10,
        filename: 'student_report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation },
      }).from(container.firstElementChild).save()

    } catch (err) {
      setError('Report generation failed: ' + err.message)
    }

    setPdfLoading(false)
  }

  return { pdfLoading, showReportModal, setShowReportModal, selectedFields, setSelectedFields, generatePDF }
}
