import { useState } from 'react'
import html2pdf from 'html2pdf.js'
import { REPORT_FIELDS } from '../constants/student'
import { supabase } from '../Auth/SupabaseClient'
import { getLabel } from '../constants/getLabel'
import madarsaLogo from '../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'

const URDU_FONT = "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif"
const LATIN_FONT = "'Public Sans', 'Inter', 'Segoe UI', sans-serif"
const PRIMARY = '#00206e'
const GOLD = '#c9a800'

const DEFAULT_FIELDS = ['name', 'father_name', 'student_type', 'class_level', 'district', 'phone', 'cnic', 'status']
const MONO_FIELDS = new Set(['cnic', 'phone', 'guardian_phone', 'guardian_cnic'])
const RTL_FIELDS = new Set(['name', 'father_name', 'class_level', 'district', 'address',
  'residential_status', 'guardian_name', 'guardian_relation', 'room_number'])

const FIELD_PRIORITY = ['serial_no', 'student_image', 'name', 'father_name']

function sortFields(fields) {
  const ordered = []
  for (const f of FIELD_PRIORITY) { if (fields.includes(f)) ordered.push(f) }
  for (const f of fields) { if (!FIELD_PRIORITY.includes(f)) ordered.push(f) }
  return ordered
}

async function pathToBase64(storagePath) {
  if (!storagePath) return null
  try {
    const { data } = supabase.storage.from('Darul-Uloom-Students').getPublicUrl(storagePath)
    const url = data?.publicUrl
    if (!url) return null
    const resp = await fetch(url)
    if (!resp.ok) return null
    const blob = await resp.blob()
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch { return null }
}

async function buildImageMap(records, fields) {
  if (!fields.includes('student_image')) return {}
  const imageMap = {}
  const withImages = records.filter(s => s.student_image)
  const chunks = []
  for (let i = 0; i < withImages.length; i += 10) chunks.push(withImages.slice(i, i + 10))
  for (const chunk of chunks) {
    await Promise.all(chunk.map(async s => {
      const b64 = await pathToBase64(s.student_image)
      if (b64) imageMap[s.id] = b64
    }))
  }
  return imageMap
}

function buildReportHtml(records, fields, subtitle, filterInfo, imageMap = {}) {
  const now = new Date()
  const sortedFields = sortFields(fields)

  const headersHtml = sortedFields
    .map(f => `<th>${getLabel('field.' + f) || REPORT_FIELDS[f] || f}</th>`)
    .join('')

  const rowsHtml = records.map((s, i) => {
    const cells = sortedFields.map(f => {
      if (f === 'student_image') {
        const b64 = imageMap[s.id]
        return b64
          ? `<td><img src="${b64}" style="width:32px;height:40px;object-fit:cover;border-radius:2px;" /></td>`
          : `<td style="color:#aaa;">—</td>`
      }
      const isRtl = RTL_FIELDS.has(f)
      const isMono = MONO_FIELDS.has(f)
      const cls = [
        isRtl ? 'rtl-cell' : '',
        isMono ? 'mono-cell' : '',
        f === 'name' ? 'name-cell' : '',
      ].filter(Boolean).join(' ')
      return `<td class="${cls}">${s[f] || '—'}</td>`
    }).join('')
    return `<tr><td class="row-num">${i + 1}</td>${cells}</tr>`
  }).join('')

  // Metadata boxes
  const metaItems = []
  if (filterInfo.filterClass) metaItems.push({ label: 'CLASS / GRADE', value: filterInfo.filterClass })
  if (filterInfo.filterType) metaItems.push({ label: 'STUDENT TYPE', value: filterInfo.filterType.toUpperCase() })
  if (filterInfo.filterStatus) metaItems.push({ label: 'STATUS', value: filterInfo.filterStatus.toUpperCase() })
  if (filterInfo.filterDistrict) metaItems.push({ label: 'DISTRICT', value: filterInfo.filterDistrict })
  if (!metaItems.length) metaItems.push({ label: 'FILTER', value: 'ALL STUDENTS' })
  metaItems.push({ label: 'STUDENT COUNT', value: `${records.length} Total` })

  const metaHtml = metaItems.map((m, i) =>
    `<div style="padding:8px 12px;${i < metaItems.length - 1 ? `border-right:1px solid ${PRIMARY};` : ''}">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:2px;">${m.label}</div>
      <div style="font-weight:700;color:${PRIMARY};font-size:13px;">${m.value}</div>
    </div>`
  ).join('')

  return `
    <!-- Report Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${PRIMARY};padding-bottom:14px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:14px;">
        <img src="${madarsaLogo}" alt="logo" style="width:56px;height:56px;object-fit:contain;flex-shrink:0;" />
        <div>
          <div style="font-family:${URDU_FONT};font-size:24px;font-weight:700;color:${PRIMARY};direction:rtl;line-height:1.5;">دارالعلوم اسلامیہ</div>
          <div style="font-family:${URDU_FONT};font-size:13px;color:${GOLD};letter-spacing:0.15em;font-weight:600;direction:rtl;">دفتر نظامت</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${PRIMARY};margin-bottom:2px;">DOCUMENT TYPE</div>
        <div style="font-size:20px;font-weight:600;color:#1b1b1c;margin-bottom:8px;">Student Report</div>
        <div style="display:grid;grid-template-columns:auto auto;gap:0 10px;font-size:10px;text-align:left;">
          <span style="font-weight:700;color:#64748b;text-transform:uppercase;">Issue Date:</span>
          <span>${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </div>

    <!-- Metadata Bar -->
    <div style="display:flex;border:1px solid ${PRIMARY};margin-bottom:16px;background:#f6f3f4;">
      ${metaHtml}
    </div>

    <!-- Data Table -->
    <table>
      <thead><tr><th>#</th>${headersHtml}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>

    <div style="margin-top:6px;text-align:right;font-style:italic;color:#94a3b8;font-size:9px;">
      ${records.length.toLocaleString()} records
    </div>

    <!-- Signatures -->
    <div style="display:flex;justify-content:flex-end;gap:40px;margin-top:30px;">
      <div style="text-align:center;width:160px;">
        <div style="border-bottom:1px solid #94a3b8;height:36px;margin-bottom:4px;"></div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${PRIMARY};">Class Coordinator</div>
      </div>
      <div style="text-align:center;width:160px;">
        <div style="border-bottom:1px solid #94a3b8;height:36px;margin-bottom:4px;"></div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${PRIMARY};">Registrar</div>
      </div>
    </div>
  `
}

async function openReportWindow(records, fields, subtitle, filterInfo, imageMap) {
  const reportHtml = buildReportHtml(records, fields, subtitle, filterInfo, imageMap)

  const win = window.open('', '_blank', 'width=1100,height=900,scrollbars=yes,resizable=yes')
  if (!win) return

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Student Report — دارالعلوم اسلامیہ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #e8e8e8; font-family: ${LATIN_FONT}; color: #1b1b1c; }

    .toolbar {
      position: sticky; top: 0; z-index: 100;
      background: #1f222a; border-bottom: 2px solid ${PRIMARY};
      padding: 10px 24px; display: flex; align-items: center;
      justify-content: space-between;
    }
    .toolbar .title { font-size: 14px; font-weight: 700; color: #e8ecf4; }
    .toolbar .sub { font-size: 11px; color: #a1a7b5; margin-top: 2px; }
    .toolbar .btn {
      padding: 8px 20px; border: none; border-radius: 6px;
      font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
    }
    .btn-print { background: rgba(116,185,255,0.15); color: #74b9ff; border: 1px solid #74b9ff !important; }
    .btn-download { background: linear-gradient(135deg,#e74c3c,#c0392b); color: #fff; }
    .btn-download:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-close { background: #333; color: #ccc; }

    .a4-page {
      width: 297mm; min-height: 210mm;
      padding: 18mm; margin: 20px auto;
      background: #fff; box-shadow: 0 0 12px rgba(0,0,0,0.12);
      border: 1px solid #e2e8f0;
    }

    table { width: 100%; border-collapse: collapse; font-size: 11px; font-family: ${LATIN_FONT}; }
    thead { background: ${PRIMARY}; color: #fff; }
    th {
      padding: 8px 10px; text-align: left; font-size: 9px;
      text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;
      border-bottom: 2px solid ${GOLD};
    }
    td {
      padding: 7px 10px; border-bottom: 1px solid #e2e8f0;
      font-size: 11px; color: #334155;
    }
    tr:nth-child(even) td { background: #f8f8f8; }
    .row-num { color: #94a3b8; font-size: 10px; width: 30px; }
    .name-cell { font-weight: 700; color: #1b1b1c; }
    .rtl-cell { direction: rtl; text-align: right; font-family: ${URDU_FONT}; font-size: 13px; line-height: 1.6; }
    .mono-cell { font-family: monospace; font-size: 11px; white-space: nowrap; }

    @page { size: A4 landscape; margin: 10mm; }
    @media print {
      body { background: #fff !important; }
      .toolbar { display: none !important; }
      .a4-page { margin: 0; box-shadow: none; border: none; width: 100%; padding: 0; }
      tr { page-break-inside: avoid; break-inside: avoid; }
      thead { display: table-header-group; }
      th, tr:nth-child(even) td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <div class="title">📄 Student Report Preview</div>
      <div class="sub">${subtitle}</div>
    </div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-print" onclick="window.print()">🖨️ Print</button>
      <button class="btn btn-download" id="btnDownload">📥 Download PDF</button>
      <button class="btn btn-close" onclick="window.close()">✕ Close</button>
    </div>
  </div>
  <div class="a4-page">
    ${reportHtml}
  </div>
  <script>
    document.getElementById('btnDownload').addEventListener('click', function() {
      this.disabled = true; this.textContent = '⏳ Generating…';
      window.opener && window.opener.postMessage({ type: 'DOWNLOAD_PDF' }, '*');
      setTimeout(() => { this.disabled = false; this.textContent = '📥 Download PDF'; }, 5000);
    });
  </script>
</body>
</html>`)
  win.document.close()
}

export function usePdfReport({ buildFilteredQuery }) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [selectedFields, setSelectedFields] = useState(DEFAULT_FIELDS)
  const [cachedRecords, setCachedRecords] = useState(null)
  const [cachedSubtitle, setCachedSubtitle] = useState('')
  const [cachedFilterInfo, setCachedFilterInfo] = useState({})

  const openPreview = async (setError, reportFilters = {}) => {
    setPdfLoading(true)
    setError('')
    const { filterType, filterDistrict, filterYear, filterRoom, filterClass, filterStatus, filterDateFrom, filterDateTo } = reportFilters

    try {
      let allRecords = []
      const batchSize = 1000
      let page = 0
      let hasMore = true

      while (hasMore) {
        const from = page * batchSize
        const extraFields = selectedFields.includes('student_image') ? [] : ['student_image']
        const selectStr = ['id', 'created_at', ...selectedFields, ...extraFields].join(',')
        let query = buildFilteredQuery(selectStr, {}, {
          appliedSearch: '', filterType, filterDistrict, filterYear, filterClass, showInactive: true,
        })
        if (filterRoom) query = query.eq('room_number', filterRoom)
        if (filterStatus) query = query.eq('status', filterStatus)
        if (filterDateFrom) query = query.gte('created_at', filterDateFrom)
        if (filterDateTo) query = query.lte('created_at', filterDateTo + 'T23:59:59')
        const { data, error: fetchErr } = await query.order('id', { ascending: true }).range(from, from + batchSize - 1)
        if (fetchErr) { setError(fetchErr.message); setPdfLoading(false); return }
        allRecords = allRecords.concat(data || [])
        hasMore = (data?.length || 0) === batchSize
        page++
      }

      if (allRecords.length === 0) { setError('No students found with the selected filters'); setPdfLoading(false); return }

      const parts = []
      if (filterType) parts.push(`Type: ${filterType}`)
      if (filterClass) parts.push(`Class: ${filterClass}`)
      if (filterDistrict) parts.push(`District: ${filterDistrict}`)
      if (filterYear) parts.push(`Year: ${filterYear}`)
      if (filterRoom) parts.push(`Room: ${filterRoom}`)
      if (filterStatus) parts.push(`Status: ${filterStatus}`)
      if (filterDateFrom) parts.push(`From: ${filterDateFrom}`)
      if (filterDateTo) parts.push(`To: ${filterDateTo}`)
      const subtitle = parts.length > 0
        ? `${parts.join(' | ')} — ${allRecords.length.toLocaleString()} students`
        : `All Students — ${allRecords.length.toLocaleString()} total`

      const imageMap = await buildImageMap(allRecords, selectedFields)
      setCachedRecords(allRecords)
      setCachedSubtitle(subtitle)
      setCachedFilterInfo(reportFilters)

      await openReportWindow(allRecords, selectedFields, subtitle, reportFilters, imageMap)
    } catch (err) { setError('Failed to open preview: ' + err.message) }
    setPdfLoading(false)
  }

  const downloadPDF = async (setError) => {
    if (!cachedRecords) return
    setPdfLoading(true)
    try {
      const imageMap = await buildImageMap(cachedRecords, selectedFields)
      const html = buildReportHtml(cachedRecords, selectedFields, cachedSubtitle, cachedFilterInfo, imageMap)
      const container = document.createElement('div')
      container.innerHTML = html
      document.body.appendChild(container)

      await html2pdf().set({
        margin: [2, 2, 2, 2],
        filename: 'student_report.pdf',
        pagebreak: { mode: ['avoid-all', 'css'], avoid: ['tr'] },
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0, allowTaint: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      }).from(container.firstElementChild).save()

      document.body.removeChild(container)
    } catch (err) { setError('Download failed: ' + err.message) }
    setPdfLoading(false)
  }

  return { pdfLoading, selectedFields, setSelectedFields, openPreview, downloadPDF }
}
