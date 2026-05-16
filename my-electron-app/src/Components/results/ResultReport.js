/**
 * ResultReport.js — Printable A4 result card for individual students.
 * 
 * Two modes:
 *  - Normal exam result (no label)
 *  - Zimni (supplementary) result (shows "ضمنی" label)
 * 
 * Usage:
 *   printResultReport({ student, books, bookResults, summary, examTerm, year, isZimni })
 */

import madarsaLogo from '../../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'
import { supabase } from '../../Auth/SupabaseClient'

const URDU_FONT = "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif"
const LATIN_FONT = "'Public Sans', 'Inter', 'Segoe UI', sans-serif"
const PRIMARY = '#00206e'
const GOLD = '#c9a800'
const BORDER_COLOR = '#222'

/**
 * Fetch student image as base64
 */
async function getStudentImageBase64(imagePath) {
  if (!imagePath) return null
  try {
    const { data } = supabase.storage.from('Darul-Uloom-Students').getPublicUrl(imagePath)
    if (!data?.publicUrl) return null
    const resp = await fetch(data.publicUrl)
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

/**
 * Build the HTML for a single student result card
 */
function buildResultCardHtml({ student, books, bookResults, summary, examTerm, year, isZimni, imageBase64 }) {
  const now = new Date()

  // Avatar
  const avatarHtml = imageBase64
    ? `<img src="${imageBase64}" style="width:100%;height:100%;object-fit:cover;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0f0f0;color:#999;font-size:28px;">📷</div>`

  // Zimni badge
  const zimniLabel = isZimni
    ? `<div style="position:absolute;top:12px;left:12px;background:#c0392b;color:#fff;font-family:${URDU_FONT};font-size:14px;font-weight:700;padding:4px 14px;border-radius:4px;line-height:1.5;">ضمنی امتحان</div>`
    : ''

  // Build table rows for books
  const bookRowsHtml = bookResults.map((br, idx) => {
    const marks = isZimni ? (br.final_marks ?? br.original_total) : br.original_total
    const total = br.book_total
    const pct = total > 0 ? Math.round((marks / total) * 100) : 0
    const passStatus = pct >= 40
    const statusColor = passStatus ? '#27ae60' : '#c0392b'
    const statusText = passStatus ? 'کامیاب' : 'ناکام'

    return `<tr>
      <td style="text-align:center;font-family:${LATIN_FONT};font-size:11px;color:#666;">${idx + 1}</td>
      <td style="font-family:${URDU_FONT};font-size:14px;font-weight:600;text-align:right;direction:rtl;line-height:1.6;">${br.book.book_name}</td>
      <td style="text-align:center;font-family:${LATIN_FONT};font-size:12px;font-weight:600;">${total}</td>
      <td style="text-align:center;font-family:${LATIN_FONT};font-size:12px;">${br.term_marks ?? '—'}</td>
      <td style="text-align:center;font-family:${LATIN_FONT};font-size:12px;">${br.final_paper_marks ?? '—'}</td>
      ${isZimni ? `<td style="text-align:center;font-family:${LATIN_FONT};font-size:12px;color:#8e44ad;font-weight:600;">${br.zimni_marks ?? '—'}</td>` : ''}
      <td style="text-align:center;font-family:${LATIN_FONT};font-size:13px;font-weight:700;">${marks}</td>
      <td style="text-align:center;font-family:${URDU_FONT};font-size:12px;font-weight:700;color:${statusColor};line-height:1.6;">${statusText}</td>
    </tr>`
  }).join('')

  // Summary row
  const totalObtained = summary.total_obtained
  const totalPossible = summary.total_possible
  const percentage = summary.percentage
  const grade = summary.grade
  const overallStatus = summary.status === 'pass' ? 'کامیاب' : 'ناکام'
  const overallColor = summary.status === 'pass' ? '#27ae60' : '#c0392b'

  // Table header
  const tableHeader = `<tr style="background:${PRIMARY};">
    <th style="width:36px;text-align:center;color:#fff;font-family:${LATIN_FONT};font-size:9px;font-weight:700;padding:8px 4px;">#</th>
    <th style="text-align:right;color:#fff;font-family:${URDU_FONT};font-size:12px;font-weight:700;padding:8px;direction:rtl;line-height:1.5;">کتاب</th>
    <th style="width:55px;text-align:center;color:#fff;font-family:${URDU_FONT};font-size:11px;font-weight:700;padding:8px 4px;line-height:1.5;">کل نمبر</th>
    <th style="width:55px;text-align:center;color:#fff;font-family:${URDU_FONT};font-size:11px;font-weight:700;padding:8px 4px;line-height:1.5;">ٹرم</th>
    <th style="width:55px;text-align:center;color:#fff;font-family:${URDU_FONT};font-size:11px;font-weight:700;padding:8px 4px;line-height:1.5;">فائنل</th>
    ${isZimni ? `<th style="width:55px;text-align:center;color:#fff;font-family:${URDU_FONT};font-size:11px;font-weight:700;padding:8px 4px;line-height:1.5;background:#8e44ad;">ضمنی</th>` : ''}
    <th style="width:60px;text-align:center;color:#fff;font-family:${URDU_FONT};font-size:11px;font-weight:700;padding:8px 4px;line-height:1.5;">حاصل شدہ</th>
    <th style="width:65px;text-align:center;color:#fff;font-family:${URDU_FONT};font-size:11px;font-weight:700;padding:8px 4px;line-height:1.5;">حیثیت</th>
  </tr>`

  return `
  <div style="font-family:${LATIN_FONT};color:#111;position:relative;min-height:100%;direction:rtl;">

    ${zimniLabel}

    <!-- ═══ HEADER ═══ -->
    <header style="text-align:center;padding-bottom:12px;margin-bottom:12px;border-bottom:3px double ${PRIMARY};">
      <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:6px;">
        <img src="${madarsaLogo}" alt="logo" style="width:56px;height:56px;object-fit:contain;" />
        <div>
          <div style="font-family:${URDU_FONT};font-size:26px;font-weight:700;color:${PRIMARY};line-height:1.4;">دارالعلوم اسلامیہ</div>
          <div style="font-family:${URDU_FONT};font-size:12px;color:${GOLD};font-weight:600;letter-spacing:0.05em;line-height:1.4;">نتائج امتحانات</div>
        </div>
      </div>
      <div style="font-family:${URDU_FONT};font-size:18px;font-weight:700;color:${PRIMARY};margin-top:4px;line-height:1.5;">
        نتیجہ کارڈ — ${examTerm} ${year}ء
      </div>
    </header>

    <!-- ═══ STUDENT INFO ═══ -->
    <div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:16px;direction:rtl;">
      <!-- Photo -->
      <div style="width:72px;height:88px;border:2px solid ${BORDER_COLOR};flex-shrink:0;overflow:hidden;">
        ${avatarHtml}
      </div>
      <!-- Info fields -->
      <div style="flex:1;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-family:${URDU_FONT};font-size:11px;font-weight:700;color:#333;padding:4px 8px 4px 0;white-space:nowrap;width:70px;line-height:1.5;">نام:</td>
            <td style="font-family:${URDU_FONT};font-size:15px;font-weight:700;color:#000;padding:4px 0;border-bottom:1px solid #ccc;line-height:1.6;">${student.name || '—'}</td>
            <td style="font-family:${URDU_FONT};font-size:11px;font-weight:700;color:#333;padding:4px 8px 4px 0;white-space:nowrap;width:70px;line-height:1.5;">ولدیت:</td>
            <td style="font-family:${URDU_FONT};font-size:15px;font-weight:600;color:#000;padding:4px 0;border-bottom:1px solid #ccc;line-height:1.6;">${student.father_name || '—'}</td>
          </tr>
          <tr>
            <td style="font-family:${URDU_FONT};font-size:11px;font-weight:700;color:#333;padding:4px 8px 4px 0;white-space:nowrap;line-height:1.5;">درجہ:</td>
            <td style="font-family:${URDU_FONT};font-size:14px;color:#000;padding:4px 0;border-bottom:1px solid #ccc;line-height:1.6;">${summary.class_level || '—'}</td>
            <td style="font-family:${URDU_FONT};font-size:11px;font-weight:700;color:#333;padding:4px 8px 4px 0;white-space:nowrap;line-height:1.5;">رول نمبر:</td>
            <td style="font-family:${LATIN_FONT};font-size:12px;color:#000;padding:4px 0;border-bottom:1px solid #ccc;">${student.serial_no || '—'}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- ═══ MARKS TABLE ═══ -->
    <table style="width:100%;border-collapse:collapse;border:2px solid ${BORDER_COLOR};margin-bottom:16px;">
      <thead>${tableHeader}</thead>
      <tbody>
        ${bookRowsHtml}
      </tbody>
      <tfoot>
        <tr style="background:#f0f4ff;border-top:2px solid ${PRIMARY};">
          <td colspan="${isZimni ? '5' : '4'}" style="text-align:right;font-family:${URDU_FONT};font-size:13px;font-weight:700;padding:8px;color:${PRIMARY};direction:rtl;line-height:1.5;">مجموعہ</td>
          <td style="text-align:center;font-family:${LATIN_FONT};font-size:12px;font-weight:700;padding:8px;">${totalPossible}</td>
          <td style="text-align:center;font-family:${LATIN_FONT};font-size:13px;font-weight:700;padding:8px;color:${PRIMARY};">${totalObtained}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <!-- ═══ RESULT SUMMARY BOX ═══ -->
    <div style="border:2px solid ${PRIMARY};padding:12px 16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;direction:rtl;">
      <div style="display:flex;gap:24px;align-items:center;">
        <div>
          <div style="font-family:${URDU_FONT};font-size:10px;color:#666;line-height:1.4;">فیصد نمبر</div>
          <div style="font-family:${LATIN_FONT};font-size:18px;font-weight:700;color:${PRIMARY};">${percentage}%</div>
        </div>
        <div>
          <div style="font-family:${URDU_FONT};font-size:10px;color:#666;line-height:1.4;">درجہ</div>
          <div style="font-family:${URDU_FONT};font-size:16px;font-weight:700;color:${PRIMARY};line-height:1.5;">${grade}</div>
        </div>
      </div>
      <div style="text-align:center;">
        <div style="font-family:${URDU_FONT};font-size:10px;color:#666;line-height:1.4;">حتمی نتیجہ</div>
        <div style="font-family:${URDU_FONT};font-size:18px;font-weight:700;color:${overallColor};padding:4px 16px;border:2px solid ${overallColor};border-radius:6px;line-height:1.5;">${overallStatus}</div>
      </div>
    </div>

    <!-- ═══ SIGNATURES ═══ -->
    <div style="display:flex;justify-content:space-between;gap:20px;margin-top:24px;direction:rtl;">
      <div style="text-align:center;flex:1;">
        <div style="height:50px;"></div>
        <div style="border-top:1.5px solid #000;padding-top:4px;">
          <div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:#333;line-height:1.4;">استاذِ محترم</div>
        </div>
      </div>
      <div style="text-align:center;flex:1;">
        <div style="height:50px;"></div>
        <div style="border-top:1.5px solid #000;padding-top:4px;">
          <div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:#333;line-height:1.4;">ناظمِ امتحانات</div>
        </div>
      </div>
      <div style="text-align:center;flex:1;">
        <div style="height:50px;"></div>
        <div style="border-top:1.5px solid #000;padding-top:4px;">
          <div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:#333;line-height:1.4;">مہتمم</div>
        </div>
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="position:absolute;bottom:0;left:0;right:0;text-align:center;font-family:${URDU_FONT};font-size:9px;color:#999;border-top:1px solid #eee;padding-top:6px;direction:rtl;line-height:1.4;">
      دارالعلوم اسلامیہ — نظامِ انتظامِ طلباء &nbsp;|&nbsp; ${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
    </div>
  </div>`
}

/**
 * Print a single student's result card.
 * 
 * @param {Object} opts
 * @param {Object} opts.student - { id, name, father_name, serial_no, student_image, class_level }
 * @param {Array}  opts.bookResults - Array from useGrading.fetchStudentDetail
 * @param {Object} opts.summary - From student_result_summary
 * @param {string} opts.examTerm - e.g. 'سالانہ'
 * @param {number} opts.year - e.g. 2026
 * @param {boolean} opts.isZimni - If true, shows "ضمنی امتحان" label
 */
export async function printResultReport({ student, bookResults, summary, examTerm, year, isZimni = false }) {
  // Fetch student image
  const imageBase64 = await getStudentImageBase64(student.student_image)

  const bodyContent = buildResultCardHtml({
    student,
    bookResults,
    summary,
    examTerm,
    year,
    isZimni,
    imageBase64,
  })

  const typeLabel = isZimni ? 'ضمنی' : ''
  const titleText = `نتیجہ کارڈ ${typeLabel} — ${student.name}`

  const win = window.open('', '_blank', 'width=900,height=1000,scrollbars=yes,resizable=yes')
  if (!win) return

  win.document.write(`<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>${titleText}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #e8e8e8; font-family: ${LATIN_FONT}; color: #111; }

    .toolbar {
      position: sticky; top: 0; z-index: 100;
      background: #1f222a; border-bottom: 2px solid ${PRIMARY};
      padding: 10px 24px; display: flex; align-items: center;
      justify-content: space-between; direction: ltr;
    }
    .toolbar .title { font-size: 14px; font-weight: 700; color: #e8ecf4; }
    .toolbar .sub { font-size: 11px; color: #a1a7b5; margin-top: 2px; }
    .toolbar .btn {
      padding: 8px 20px; border: none; border-radius: 6px;
      font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
    }
    .btn-print { background: rgba(116,185,255,0.15); color: #74b9ff; border: 1px solid #74b9ff !important; }
    .btn-close { background: #333; color: #ccc; }

    .a4-page {
      width: 210mm; min-height: 297mm;
      padding: 14mm 16mm; margin: 20px auto;
      background: #fff; box-shadow: 0 0 12px rgba(0,0,0,0.12);
      border: 1px solid #e2e8f0; position: relative;
    }

    table { border-collapse: collapse; }
    table td, table th {
      border: 1px solid ${BORDER_COLOR};
      padding: 6px 8px;
      vertical-align: middle;
    }
    tbody tr:nth-child(even) td { background: #fafbff; }

    @page { size: A4 portrait; margin: 10mm; }
    @media print {
      body { background: #fff !important; }
      .toolbar { display: none !important; }
      .a4-page { margin: 0; box-shadow: none; border: none; width: 100%; min-height: auto; padding: 10mm 12mm; }
      table td, table th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tbody tr:nth-child(even) td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <div class="title">📄 نتیجہ کارڈ ${typeLabel}</div>
      <div class="sub">${student.name} — ${examTerm} ${year}</div>
    </div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-print" onclick="window.print()">🖨️ پرنٹ کریں</button>
      <button class="btn btn-close" onclick="window.close()">✕ بند کریں</button>
    </div>
  </div>
  <div class="a4-page">
    ${bodyContent}
  </div>
  <script>document.fonts.ready.then(() => window.print())</script>
</body>
</html>`)
  win.document.close()
}

/**
 * Print result cards for multiple students (batch).
 * Opens one window with multiple A4 pages.
 */
export async function printBatchResultReport({ students, allBookResults, allSummaries, examTerm, year, isZimni = false }) {
  // Build all cards
  const cards = []
  for (let i = 0; i < students.length; i++) {
    const student = students[i]
    const bookResults = allBookResults[i]
    const summary = allSummaries[i]
    const imageBase64 = await getStudentImageBase64(student.student_image)
    cards.push(buildResultCardHtml({ student, bookResults, summary, examTerm, year, isZimni, imageBase64 }))
  }

  const typeLabel = isZimni ? 'ضمنی' : ''
  const pagesHtml = cards.map(card => `<div class="a4-page">${card}</div>`).join('')

  const win = window.open('', '_blank', 'width=900,height=1000,scrollbars=yes,resizable=yes')
  if (!win) return

  win.document.write(`<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>نتائج ${typeLabel} — ${examTerm} ${year}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #e8e8e8; font-family: ${LATIN_FONT}; color: #111; }

    .toolbar {
      position: sticky; top: 0; z-index: 100;
      background: #1f222a; border-bottom: 2px solid ${PRIMARY};
      padding: 10px 24px; display: flex; align-items: center;
      justify-content: space-between; direction: ltr;
    }
    .toolbar .title { font-size: 14px; font-weight: 700; color: #e8ecf4; }
    .toolbar .sub { font-size: 11px; color: #a1a7b5; margin-top: 2px; }
    .toolbar .btn {
      padding: 8px 20px; border: none; border-radius: 6px;
      font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
    }
    .btn-print { background: rgba(116,185,255,0.15); color: #74b9ff; border: 1px solid #74b9ff !important; }
    .btn-close { background: #333; color: #ccc; }

    .a4-page {
      width: 210mm; min-height: 297mm;
      padding: 14mm 16mm; margin: 20px auto;
      background: #fff; box-shadow: 0 0 12px rgba(0,0,0,0.12);
      border: 1px solid #e2e8f0; position: relative;
      page-break-after: always;
    }
    .a4-page:last-child { page-break-after: auto; }

    table { border-collapse: collapse; }
    table td, table th {
      border: 1px solid ${BORDER_COLOR};
      padding: 6px 8px;
      vertical-align: middle;
    }
    tbody tr:nth-child(even) td { background: #fafbff; }

    @page { size: A4 portrait; margin: 10mm; }
    @media print {
      body { background: #fff !important; }
      .toolbar { display: none !important; }
      .a4-page { margin: 0; box-shadow: none; border: none; width: 100%; min-height: auto; padding: 10mm 12mm; page-break-after: always; }
      .a4-page:last-child { page-break-after: auto; }
      table td, table th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tbody tr:nth-child(even) td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <div class="title">📄 نتائج ${typeLabel} — ${students.length} طلباء</div>
      <div class="sub">${examTerm} ${year}</div>
    </div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-print" onclick="window.print()">🖨️ پرنٹ کریں</button>
      <button class="btn btn-close" onclick="window.close()">✕ بند کریں</button>
    </div>
  </div>
  ${pagesHtml}
  <script>document.fonts.ready.then(() => window.print())</script>
</body>
</html>`)
  win.document.close()
}
