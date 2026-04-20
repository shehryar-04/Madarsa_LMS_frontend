import madarsaLogo from '../../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'

const URDU_FONT = "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif"

/**
 * Opens a print window with the wazifa attendance report.
 * All text is in Urdu, RTL layout.
 * Columns: نمبر شمار | نام طالب علم | ولدیت | وظیفہ | دستخط
 */
export function printWazifaReport({ className, wazifa, students, month, year }) {
  const rowsHtml = students.map((s, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td class="urdu">${s.name || '—'}</td>
      <td class="urdu">${s.father_name || '—'}</td>
      <td class="urdu wazifa-cell">${wazifa || '—'}</td>
      <td class="sig"></td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>وظیفہ رپورٹ — ${className}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: ${URDU_FONT};
      background: #fff;
      color: #1a1a2e;
      direction: rtl;
      padding: 24px;
    }

    /* ── Toolbar (hidden on print) ── */
    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      align-items: center;
    }
    .btn {
      padding: 9px 22px;
      border: none;
      border-radius: 7px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      font-family: ${URDU_FONT};
    }
    .btn-print { background: #6c5ce7; color: #fff; }
    .btn-close  { background: #eee; color: #333; }

    /* ── Report header ── */
    .report-header {
      border-bottom: 3px solid #6c5ce7;
      padding-bottom: 12px;
      margin-bottom: 16px;
      text-align: center;
    }
    .report-header h1 {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1.8;
    }
    .report-header .sub {
      font-size: 16px;
      color: #444;
      margin-top: 4px;
      line-height: 1.8;
    }
    .report-header .meta {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 14px;
      color: #555;
      line-height: 1.8;
    }
    .meta-item strong {
      color: #1a1a2e;
    }

    /* ── Wazifa box ── */
    .wazifa-box {
      border: 2px solid #6c5ce7;
      border-radius: 8px;
      padding: 10px 16px;
      margin-bottom: 16px;
      background: #f5f3ff;
      font-size: 17px;
      line-height: 2;
      color: #1a1a2e;
    }
    .wazifa-box .label {
      font-size: 13px;
      color: #6c5ce7;
      font-weight: 700;
      display: block;
      margin-bottom: 4px;
    }

    /* ── Table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    colgroup col.col-num  { width: 50px; }
    colgroup col.col-name { width: 22%; }
    colgroup col.col-father { width: 22%; }
    colgroup col.col-wazifa { width: 28%; }
    colgroup col.col-sig  { width: 18%; }

    th {
      background: #6c5ce7;
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      padding: 10px 8px;
      text-align: right;
      border: 1px solid #5a4bd1;
      line-height: 1.8;
    }
    td {
      padding: 8px;
      border: 1px solid #ccc;
      font-size: 15px;
      text-align: right;
      vertical-align: middle;
      line-height: 1.8;
    }
    td.num {
      text-align: center;
      font-size: 13px;
      color: #555;
      font-family: 'Inter', sans-serif;
    }
    td.urdu {
      font-family: ${URDU_FONT};
    }
    td.wazifa-cell {
      font-family: ${URDU_FONT};
      color: #3d2b8e;
      font-weight: 600;
    }
    td.sig {
      height: 44px;
    }
    tr:nth-child(even) td {
      background: #f8f7ff;
    }

    /* ── Footer ── */
    .report-footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #999;
    }

    /* ── Print styles ── */
    @page {
      size: A4 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }
    @media print {
      body { padding: 0; }
      .toolbar { display: none !important; }
      th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tr:nth-child(even) td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .wazifa-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <div class="toolbar">
    <button class="btn btn-print" onclick="window.print()">🖨️ پرنٹ کریں</button>
    <button class="btn btn-close" onclick="window.close()">✕ بند کریں</button>
  </div>

  <div class="report-header">
    <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:6px;">
      <img src="${madarsaLogo}" alt="logo" style="width:70px;height:70px;object-fit:contain;flex-shrink:0;" />
      <div>
        <h1>دارالعلوم اسلامیہ</h1>
        <div class="sub">وظیفہ حاضری رپورٹ</div>
      </div>
    </div>
    <div class="meta">
      <span class="meta-item">درجہ: <strong>${className}</strong></span>
      <span class="meta-item">مہینہ: <strong>${month} ${year}</strong></span>
      <span class="meta-item">کل طلباء: <strong>${students.length}</strong></span>
    </div>
  </div>

  <div class="wazifa-box">
    <span class="label">وظیفہ</span>
    ${wazifa || '(وظیفہ درج نہیں)'}
  </div>

  <table>
    <colgroup>
      <col class="col-num"/>
      <col class="col-name"/>
      <col class="col-father"/>
      <col class="col-wazifa"/>
      <col class="col-sig"/>
    </colgroup>
    <thead>
      <tr>
        <th style="text-align:center;">نمبر</th>
        <th>نام طالب علم</th>
        <th>ولدیت</th>
        <th>وظیفہ</th>
        <th>دستخط</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="report-footer">
    <span>دارالعلوم اسلامیہ — نظام انتظام طلباء</span>
    <span>${month} ${year}</span>
  </div>

  <script>
    document.fonts.ready.then(() => window.print())
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=750,scrollbars=yes,resizable=yes')
  if (!win) return
  win.document.write(html)
  win.document.close()
}
