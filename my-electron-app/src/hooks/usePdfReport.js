import { useState } from 'react'
import html2pdf from 'html2pdf.js'
import { REPORT_FIELDS } from '../constants/student'
import { supabase } from '../Auth/SupabaseClient'
import madarsaLogo from '../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'

const URDU_FONT = "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif"
const LATIN_FONT = "'Inter', 'Segoe UI', sans-serif"

const DEFAULT_FIELDS = ['name', 'father_name', 'student_type', 'class_level', 'district', 'phone', 'cnic', 'status']
const MONO_FIELDS = new Set(['cnic', 'phone', 'guardian_phone', 'guardian_cnic'])
const RTL_FIELDS = new Set(['name', 'father_name', 'class_level', 'district', 'address',
  'residential_status', 'guardian_name', 'guardian_relation', 'room_number'])

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

function buildReportHtml(records, fields, subtitle, imageMap = {}) {
  const now = new Date()

  const headersHtml = fields
    .map(f => `<th>${REPORT_FIELDS[f]}</th>`)
    .join('')

  const rowsHtml = records.map((s, i) => `
    <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
      <td>${i + 1}</td>
      ${fields.map(f => {
        if (f === 'student_image') {
          const b64 = imageMap[s.id]
          return b64
            ? `<td><img src="${b64}" style="width:40px;height:50px;object-fit:cover;border-radius:4px;" /></td>`
            : `<td style="color:#999;">—</td>`
        }
        const mono = MONO_FIELDS.has(f) ? ' class="mono"' : ''
        const isRtl = RTL_FIELDS.has(f)
        const dir = isRtl ? ' dir="rtl"' : ''
        const rtlStyle = isRtl ? ` style="font-family:${URDU_FONT};font-size:15px;text-align:right;line-height:1.9;"` : ''
        return `<td${mono}${dir}${rtlStyle}>${s[f] || '—'}</td>`
      }).join('')}
    </tr>
  `).join('')

  return `
    <div class="report-wrap">
      <div class="report-header">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px;">
          <img src="${madarsaLogo}" alt="logo" style="width:64px;height:64px;object-fit:contain;flex-shrink:0;" />
          <div>
            <h1 style="font-family:${URDU_FONT};direction:rtl;font-size:22px;font-weight:800;color:#1a1a2e;line-height:1.8;margin:0;">دارالعلوم اسلامیہ</h1>
            <p style="margin:2px 0 0;font-size:13px;color:#555;">رپورٹ طلباء — ${subtitle}</p>
            <p style="margin:2px 0 0;font-size:11px;color:#999;">Generated: ${now.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <table>
        <thead><tr><th>#</th>${headersHtml}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="report-footer">
        <span style="font-family:${URDU_FONT};">دارالعلوم اسلامیہ — نظامِ انتظامِ طلباء</span>
        <span>${records.length.toLocaleString()} students</span>
      </div>
    </div>
  `
}

/** Opens a new window with the report and Download PDF + Print buttons */
async function openReportWindow(records, fields, subtitle, imageMap, onDownloadPDF) {
  const reportHtml = buildReportHtml(records, fields, subtitle, imageMap)

  const win = window.open('', '_blank', 'width=1100,height=800,scrollbars=yes,resizable=yes')
  if (!win) return

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Student Report — دارالعلوم اسلامیہ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Noto Naskh Arabic', 'Inter', 'Segoe UI', sans-serif;
      background: #f4f4f8;
      color: #1a1a2e;
    }

    /* ── Toolbar ── */
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #1f222a;
      border-bottom: 2px solid #6c5ce7;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .toolbar-title {
      font-size: 15px;
      font-weight: 700;
      color: #e8ecf4;
    }
    .toolbar-sub {
      font-size: 11px;
      color: #a1a7b5;
      margin-top: 2px;
    }
    .toolbar-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }
    .btn-print {
      padding: 9px 20px;
      border: 1px solid #74b9ff;
      border-radius: 8px;
      background: rgba(116,185,255,0.12);
      color: #74b9ff;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-print:hover { background: rgba(116,185,255,0.25); }
    .btn-download {
      padding: 9px 20px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 3px 12px rgba(231,76,60,0.35);
    }
    .btn-download:hover { opacity: 0.9; }
    .btn-download:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ── Report content ── */
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .report-wrap { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
    .report-header { margin-bottom: 18px; border-bottom: 3px solid #6c5ce7; padding-bottom: 14px; }
    .report-header h1 { font-size: 20px; font-weight: 800; color: #1a1a2e; margin-bottom: 4px; font-family: '${URDU_FONT}'; direction: rtl; }
    .report-header p { font-size: 13px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th {
      background: #6c5ce7; color: #fff; font-weight: 700; font-size: 11px;
      text-transform: uppercase; padding: 9px 7px; text-align: left;
      word-break: break-word; overflow-wrap: break-word;
    }
    td {
      padding: 7px; border-bottom: 1px solid #e8ecf1; font-size: 13px;
      word-break: break-word; overflow-wrap: break-word; color: #1a1a2e;
    }
    tr.even td { background: #f8f8fc; }
    tr.odd td { background: #fff; }
    td.mono { font-family: monospace; font-size: 12px; }
    td[dir="rtl"] { text-align: right; font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif; font-size: 15px; line-height: 1.9; }
    .report-footer {
      margin-top: 16px; padding-top: 10px; border-top: 1px solid #ddd;
      font-size: 12px; color: #999; display: flex; justify-content: space-between;
    }

    /* ── Print styles ── */
    @media print {
      @page { size: A4; margin: 63.5mm 12.7mm 15mm 38.1mm; }
      body { background: #fff; }
      .toolbar { display: none !important; }
      .page { padding: 0; max-width: 100%; }
      .report-wrap { box-shadow: none; border-radius: 0; padding: 0; }
      th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tr.even td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <div class="toolbar-title">📄 Student Report Preview</div>
      <div class="toolbar-sub">${subtitle}</div>
    </div>
    <div class="toolbar-actions">
      <button class="btn-print" onclick="window.print()">🖨️ Print</button>
      <button class="btn-download" id="btnDownload">📥 Download PDF</button>
    </div>
  </div>
  <div class="page">
    ${reportHtml}
  </div>
  <script>
    document.getElementById('btnDownload').addEventListener('click', function() {
      this.disabled = true;
      this.textContent = '⏳ Generating…';
      window.opener && window.opener.postMessage({ type: 'DOWNLOAD_PDF' }, '*');
      setTimeout(() => {
        this.disabled = false;
        this.textContent = '📥 Download PDF';
      }, 5000);
    });
  </script>
</body>
</html>`)
  win.document.close()
}

export function usePdfReport({ buildFilteredQuery }) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [selectedFields, setSelectedFields] = useState(DEFAULT_FIELDS)

  // Stored so the parent window can respond to DOWNLOAD_PDF message
  const [cachedRecords, setCachedRecords] = useState(null)
  const [cachedSubtitle, setCachedSubtitle] = useState('')

  /** Fetch records, build image map, open preview window */
  const openPreview = async (setError, reportFilters = {}) => {
    setPdfLoading(true)
    setError('')

    const { filterType, filterDistrict, filterYear, filterRoom, filterClass, filterStatus } = reportFilters

    try {
      let allRecords = []
      const batchSize = 1000
      let page = 0
      let hasMore = true

      while (hasMore) {
        const from = page * batchSize
        const extraFields = selectedFields.includes('student_image') ? [] : ['student_image']
        const selectStr = ['id', ...selectedFields, ...extraFields].join(',')

        let query = buildFilteredQuery(selectStr, {}, {
          appliedSearch: '', filterType, filterDistrict, filterYear, filterClass, showInactive: true,
        })
        if (filterRoom)   query = query.eq('room_number', filterRoom)
        if (filterStatus) query = query.eq('status', filterStatus)

        const { data, error: fetchErr } = await query
          .order('id', { ascending: true })
          .range(from, from + batchSize - 1)

        if (fetchErr) { setError(fetchErr.message); setPdfLoading(false); return }

        allRecords = allRecords.concat(data || [])
        hasMore = (data?.length || 0) === batchSize
        page++
      }

      if (allRecords.length === 0) {
        setError('No students found with the selected filters')
        setPdfLoading(false)
        return
      }

      const parts = []
      if (filterType)     parts.push(`Type: ${filterType}`)
      if (filterClass)    parts.push(`Class: ${filterClass}`)
      if (filterDistrict) parts.push(`District: ${filterDistrict}`)
      if (filterYear)     parts.push(`Year: ${filterYear}`)
      if (filterRoom)     parts.push(`Room: ${filterRoom}`)
      if (filterStatus)   parts.push(`Status: ${filterStatus}`)
      const subtitle = parts.length > 0
        ? `${parts.join(' | ')} — ${allRecords.length.toLocaleString()} students`
        : `All Students — ${allRecords.length.toLocaleString()} total`

      // Build image map before opening window
      const imageMap = await buildImageMap(allRecords, selectedFields)

      // Cache for PDF download triggered by the preview window
      setCachedRecords(allRecords)
      setCachedSubtitle(subtitle)

      await openReportWindow(allRecords, selectedFields, subtitle, imageMap)

    } catch (err) {
      setError('Failed to open preview: ' + err.message)
    }

    setPdfLoading(false)
  }

  /** Called when the preview window posts DOWNLOAD_PDF message */
  const downloadPDF = async (setError) => {
    if (!cachedRecords) return
    setPdfLoading(true)
    try {
      const imageMap = await buildImageMap(cachedRecords, selectedFields)
      const orientation = (selectedFields.length <= 3 && !selectedFields.includes('student_image')) ? 'portrait' : 'landscape'
      const html = buildReportHtml(cachedRecords, selectedFields, cachedSubtitle, imageMap)
      const container = document.createElement('div')
      container.innerHTML = html
      await html2pdf().set({
        // A4: top 2.5in=63.5mm, right 0.5in=12.7mm, bottom 15mm, left 1.5in=38.1mm
        margin: [63.5, 12.7, 15, 38.1],
        filename: 'student_report.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0, allowTaint: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation },
      }).from(container.firstElementChild).save()
    } catch (err) {
      setError('Download failed: ' + err.message)
    }
    setPdfLoading(false)
  }

  return {
    pdfLoading,
    selectedFields, setSelectedFields,
    openPreview, downloadPDF,
  }
}
