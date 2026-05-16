import madarsaLogo from '../../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'
import { getLabel } from '../../constants/getLabel'
import { supabase } from '../../Auth/SupabaseClient'

const URDU_FONT = "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif"
const LATIN_FONT = "'Public Sans', 'Inter', sans-serif"
const PRIMARY = '#00206e'
const GOLD = '#c9a800'
const CACHE_KEY = 'report_configs_cache'

function getWazifaConfig() {
  const defaultCols = [
    { field: '_row_num', label: 'نمبر', type: 'number' },
    { field: 'student_image', label: 'تصویر', type: 'image' },
    { field: 'name', label: 'نام طالب علم', type: 'text' },
    { field: 'father_name', label: 'ولدیت', type: 'text' },
    { field: '_wazifa', label: 'وظیفہ', type: 'wazifa' },
    { field: '_received', label: 'وصول شدہ رقم', type: 'signature' },
    { field: '_signature', label: 'دستخط', type: 'signature' },
  ]
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return { columns: defaultCols, student_fields: ['name', 'father_name', 'class_level'] }
    const rows = JSON.parse(raw)
    const row = rows.find(r => r.report_type === 'wazifa_report')
    if (!row?.config) return { columns: defaultCols, student_fields: ['name', 'father_name', 'class_level'] }
    const cfg = typeof row.config === 'string' ? JSON.parse(row.config) : row.config
    return {
      columns: cfg.columns || defaultCols,
      student_fields: cfg.student_fields || deriveStudentFields(cfg.columns || defaultCols),
    }
  } catch { return { columns: defaultCols, student_fields: ['name', 'father_name', 'class_level'] } }
}

function deriveStudentFields(columns) {
  const fields = new Set(['class_level'])
  for (const col of columns) {
    if (col.type === 'text' && col.field && !col.field.startsWith('_')) fields.add(col.field)
    if (col.type === 'image') fields.add('student_image')
  }
  return [...fields]
}

export function getWazifaStudentFields() {
  return getWazifaConfig().student_fields
}

/** Fetch student images as base64 for embedding in print */
export async function buildWazifaImageMap(students) {
  const imageMap = {}
  const withImages = students.filter(s => s.student_image)
  for (const s of withImages) {
    try {
      const { data } = supabase.storage.from('Darul-Uloom-Students').getPublicUrl(s.student_image)
      if (!data?.publicUrl) continue
      const resp = await fetch(data.publicUrl)
      if (!resp.ok) continue
      const blob = await resp.blob()
      const b64 = await new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
      if (b64) imageMap[s.id] = b64
    } catch { /* skip */ }
  }
  return imageMap
}

export function printWazifaReport({ className, wazifa, students, month, year, imageMap = {} }) {
  const L = getLabel
  const { columns } = getWazifaConfig()
  const now = new Date()

  const headerHtml = columns.map(col =>
    `<th style="${col.type === 'number' ? 'width:36px;text-align:center;' : col.type === 'signature' ? 'width:16%;' : ''}">${col.label}</th>`
  ).join('')

  const rowsHtml = students.map((s, i) => {
    const cells = columns.map(col => {
      switch (col.type) {
        case 'number':
          return `<td class="row-num">${i + 1}</td>`
        case 'text':
          return `<td class="urdu-cell${col.field === 'name' ? ' name-cell' : ''}">${s[col.field] || '—'}</td>`
        case 'wazifa':
          return `<td class="urdu-cell wazifa-cell">${wazifa || '—'}</td>`
        case 'signature':
          return `<td style="height:32px;"></td>`
        case 'image': {
          const b64 = imageMap[s.id]
          return b64
            ? `<td style="text-align:center;padding:2px;"><img src="${b64}" style="width:32px;height:40px;object-fit:cover;border-radius:2px;" /></td>`
            : `<td style="text-align:center;color:#aaa;font-size:11px;">—</td>`
        }
        default:
          return `<td>${s[col.field] || '—'}</td>`
      }
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>${L('wazifa.reportTitle')} — ${className}</title>
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
      padding: 18mm; margin: 20px auto;
      background: #fff; box-shadow: 0 0 12px rgba(0,0,0,0.12);
      border: 1px solid #e2e8f0; direction: rtl;
    }

    table { width: 100%; border-collapse: collapse; font-family: ${URDU_FONT}; }
    thead { background: ${PRIMARY}; color: #fff; }
    th {
      padding: 8px 10px; text-align: right; font-size: 12px;
      font-weight: 700; border-bottom: 2px solid ${GOLD};
      font-family: ${URDU_FONT}; line-height: 1.6;
    }
    td {
      padding: 6px 10px; border-bottom: 1px solid #e2e8f0;
      font-size: 13px; vertical-align: middle; line-height: 1.6;
    }
    tr:nth-child(even) td { background: #f8f8f8; }
    .row-num { text-align: center; color: #94a3b8; font-size: 11px; font-family: ${LATIN_FONT}; width: 36px; }
    .urdu-cell { font-family: ${URDU_FONT}; text-align: right; direction: rtl; }
    .name-cell { font-weight: 700; color: #1b1b1c; }
    .wazifa-cell { color: #3d2b8e; font-weight: 600; }

    .meta-bar { display: flex; border: 1px solid ${PRIMARY}; margin-bottom: 14px; background: #f6f3f4; }
    .meta-item { padding: 8px 12px; }
    .meta-item + .meta-item { border-right: 1px solid ${PRIMARY}; }
    .meta-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 2px; font-family: ${URDU_FONT}; direction: rtl; }
    .meta-value { font-weight: 700; color: ${PRIMARY}; font-size: 13px; font-family: ${URDU_FONT}; direction: rtl; }

    @page { size: A4 portrait; margin: 12mm; }
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
      <div class="title">📄 ${L('wazifa.reportTitle')}</div>
      <div class="sub">${className} — ${month} ${year}</div>
    </div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-print" onclick="window.print()">${L('wazifa.printBtn')}</button>
      <button class="btn btn-close" onclick="window.close()">${L('wazifa.closeBtn')}</button>
    </div>
  </div>

  <div class="a4-page">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${PRIMARY};padding-bottom:12px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="${madarsaLogo}" alt="logo" style="width:52px;height:52px;object-fit:contain;flex-shrink:0;" />
        <div>
          <div style="font-family:${URDU_FONT};font-size:22px;font-weight:700;color:${PRIMARY};line-height:1.5;">${L('print.title')}</div>
          <div style="font-family:${URDU_FONT};font-size:12px;color:${GOLD};letter-spacing:0.1em;font-weight:600;">${L('wazifa.reportTitle')}</div>
        </div>
      </div>
      <div style="text-align:left;direction:ltr;">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${PRIMARY};margin-bottom:2px;">DOCUMENT TYPE</div>
        <div style="font-size:16px;font-weight:600;color:#1b1b1c;margin-bottom:6px;">Wazifa Report</div>
        <div style="font-size:10px;color:#64748b;">
          <span style="font-weight:700;">Date:</span> ${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </div>

    <!-- Metadata Bar -->
    <div class="meta-bar">
      <div class="meta-item" style="flex:1;">
        <div class="meta-label">درجہ</div>
        <div class="meta-value">${className}</div>
      </div>
      <div class="meta-item" style="flex:1;">
        <div class="meta-label">مہینہ / سال</div>
        <div class="meta-value">${month} ${year}</div>
      </div>
      <div class="meta-item" style="flex:1;">
        <div class="meta-label">کل طلباء</div>
        <div class="meta-value">${students.length}</div>
      </div>
    </div>

    <!-- Wazifa Box -->
    <div style="border:1px solid ${PRIMARY};padding:6px 12px;margin-bottom:12px;background:#f6f3f4;">
      <span style="font-family:${URDU_FONT};font-size:10px;color:${PRIMARY};font-weight:700;">${L('wazifa.wazifaLabel')}:</span>
      <span style="font-family:${URDU_FONT};font-size:14px;color:#1b1b1c;margin-right:8px;">${wazifa || L('wazifa.noWazifa')}</span>
    </div>

    <!-- Table -->
    <table>
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>

    <div style="margin-top:4px;text-align:left;direction:ltr;font-style:italic;color:#94a3b8;font-size:9px;">
      ${students.length} records
    </div>

    <!-- Signatures -->
    <div style="display:flex;justify-content:flex-start;gap:32px;margin-top:24px;direction:rtl;">
      <div style="text-align:center;width:140px;">
        <div style="border-bottom:1px solid #94a3b8;height:32px;margin-bottom:4px;"></div>
        <div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:${PRIMARY};">استاذ</div>
      </div>
      <div style="text-align:center;width:140px;">
        <div style="border-bottom:1px solid #94a3b8;height:32px;margin-bottom:4px;"></div>
        <div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:${PRIMARY};">ناظمِ اعلیٰ</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="position:absolute;bottom:18mm;left:18mm;right:18mm;border-top:1px solid #e2e8f0;padding-top:6px;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8;direction:ltr;">
      <span style="font-family:${URDU_FONT};direction:rtl;">${L('wazifa.footer')}</span>
      <span>${month} ${year}</span>
    </div>
  </div>

  <script>document.fonts.ready.then(() => window.print())</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=900,scrollbars=yes,resizable=yes')
  if (!win) return
  win.document.write(html)
  win.document.close()
}
