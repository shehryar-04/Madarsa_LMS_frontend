import madarsaLogo from '../../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'

const URDU_FONT = "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif"

// Imported at build time by Vite — resolves to a hashed URL or base64

const val = (v) => v || '—'

const lbl = (text) =>
  `<td style="padding:5px 9px;background:#f5f3ff;font-weight:700;font-size:14px;font-family:${URDU_FONT};border:1px solid #ccc;white-space:nowrap;direction:rtl;text-align:right;line-height:1.8;">${text}</td>`

const rtlVal = (text, extra = '') =>
  `<td style="padding:5px 9px;border:1px solid #ccc;font-size:15px;font-family:${URDU_FONT};direction:rtl;text-align:right;word-break:break-word;overflow-wrap:break-word;line-height:1.8;${extra}">${val(text)}</td>`

// numbers/dates still render LTR but inside RTL cell
const numVal = (text, extra = '') =>
  `<td style="padding:5px 9px;border:1px solid #ccc;font-size:13px;font-family:monospace,sans-serif;text-align:left;word-break:break-word;${extra}">${val(text)}</td>`

function buildFormHtml(form, imageDataUrl) {
  const avatarHtml = imageDataUrl
    ? `<img src="${imageDataUrl}" style="width:100%;height:100%;object-fit:cover;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:700;color:#6c5ce7;background:#ede9fe;font-family:${URDU_FONT};">${(form.name || '؟')[0]}</div>`

  const sectionHead = (urdu) =>
    `<div style="background:#6c5ce7;color:#fff;font-size:15px;font-weight:700;padding:6px 10px;border-radius:3px 3px 0 0;font-family:${URDU_FONT};direction:rtl;text-align:right;line-height:1.8;">
      ${urdu}
    </div>`

  return `
    <div style="font-family:${URDU_FONT};color:#1a1a2e;background:#fff;width:100%;box-sizing:border-box;direction:rtl;">

      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:3px solid #6c5ce7;padding-bottom:8px;margin-bottom:10px;direction:rtl;">
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${madarsaLogo}" alt="logo" style="width:64px;height:64px;object-fit:contain;flex-shrink:0;" />
          <div>
            <div style="font-size:24px;font-weight:800;color:#1a1a2e;font-family:${URDU_FONT};line-height:1.8;">دارالعلوم اسلامیہ</div>
            <div style="font-size:15px;color:#444;margin-top:2px;font-family:${URDU_FONT};line-height:1.8;">فارمِ داخلہ</div>
          </div>
        </div>
        <div style="text-align:left;font-size:13px;color:#555;line-height:1.8;font-family:${URDU_FONT};">
          <div>فارم نمبر: <strong>${val(form.form_no)}</strong></div>
          <div>سلسلہ نمبر: <strong>${val(form.serial_no)}</strong></div>
          <div>تاریخ: <strong>${new Date().toLocaleDateString('ur-PK')}</strong></div>
        </div>
      </div>

      <!-- Photo + Basic Info -->
      <div style="display:flex;gap:12px;margin-bottom:8px;align-items:flex-start;direction:rtl;">
        <div style="flex-shrink:0;width:90px;height:108px;border:2px solid #6c5ce7;border-radius:4px;overflow:hidden;">
          ${avatarHtml}
        </div>
        <div style="flex:1;min-width:0;">
          <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
            <colgroup><col style="width:38%"/><col style="width:62%"/></colgroup>
            <tr>${lbl('مکمل نام')}${rtlVal(form.name, 'font-size:16px;font-weight:600;')}</tr>
            <tr>${lbl('ولدیت')}${rtlVal(form.father_name)}</tr>
            <tr>${lbl('تاریخ پیدائش')}${numVal(form.dob)}</tr>
            <tr>${lbl('شناختی کارڈ / بی فارم نمبر')}${numVal(form.cnic)}</tr>
            <tr>${lbl('فون نمبر')}${numVal(form.phone)}</tr>
          </table>
        </div>
      </div>

      <!-- Enrollment Details -->
      <div style="margin-bottom:7px;">
        ${sectionHead('تفصیلاتِ داخلہ')}
        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <colgroup><col style="width:22%"/><col style="width:28%"/><col style="width:22%"/><col style="width:28%"/></colgroup>
          <tr>
            ${lbl('قسمِ طالب علم')}${rtlVal(form.student_type)}
            ${lbl('درجہ')}${rtlVal(form.class_level)}
          </tr>
          <tr>
            ${lbl('سالِ داخلہ')}${numVal(form.entry_year)}
            ${lbl('تاریخِ داخلہ')}${numVal(form.tareekh_daakhla)}
          </tr>
        </table>
      </div>

      <!-- Guardian Information -->
      <div style="margin-bottom:7px;">
        ${sectionHead('ولی / سرپرست کی تفصیل')}
        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <colgroup><col style="width:22%"/><col style="width:28%"/><col style="width:22%"/><col style="width:28%"/></colgroup>
          <tr>
            ${lbl('ولی کا نام')}${rtlVal(form.guardian_name)}
            ${lbl('رشتہ')}${rtlVal(form.guardian_relation)}
          </tr>
          <tr>
            ${lbl('ولی کا شناختی کارڈ')}${numVal(form.guardian_cnic)}
            ${lbl('ولی کا فون نمبر')}${numVal(form.guardian_phone)}
          </tr>
        </table>
      </div>

      <!-- Residence & Location -->
      <div style="margin-bottom:7px;">
        ${sectionHead('رہائش اور مقام')}
        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <colgroup><col style="width:22%"/><col style="width:28%"/><col style="width:22%"/><col style="width:28%"/></colgroup>
          <tr>
            ${lbl('رہائشی حیثیت')}${rtlVal(form.residential_status)}
            ${lbl('ضلع')}${rtlVal(form.district)}
          </tr>
          ${form.residential_status === 'مقیم' ? `
          <tr>
            ${lbl('کمرہ نمبر')}${numVal(form.room_number)}
            <td style="border:1px solid #ccc;"></td><td style="border:1px solid #ccc;"></td>
          </tr>` : ''}
          <tr>
            ${lbl('پتہ')}
            <td colspan="3" style="padding:5px 9px;border:1px solid #ccc;font-size:15px;font-family:${URDU_FONT};direction:rtl;text-align:right;word-break:break-word;line-height:1.8;">${val(form.address)}</td>
          </tr>
        </table>
      </div>

      <!-- Signature row -->
      <div style="display:flex;justify-content:space-between;margin-top:14px;padding-top:10px;border-top:1px solid #ddd;direction:rtl;">
        <div style="text-align:center;width:30%;height:120px;display:flex;flex-direction:column;justify-content:flex-end;">
          <div style="border-top:1px solid #333;padding-top:7px;font-size:14px;color:#333;font-family:${URDU_FONT};line-height:1.8;">
            طالب علم کے دستخط
          </div>
        </div>
        <div style="text-align:center;width:30%;height:120px;display:flex;flex-direction:column;justify-content:flex-end;">
          <div style="border-top:1px solid #333;padding-top:7px;font-size:14px;color:#333;font-family:${URDU_FONT};line-height:1.8;">
            ولی کے دستخط
          </div>
        </div>
        <div style="text-align:center;width:30%;height:120px;display:flex;flex-direction:column;justify-content:flex-end;">
          <div style="border-top:1px solid #333;padding-top:7px;font-size:14px;color:#333;font-family:${URDU_FONT};line-height:1.8;">
            مہتمم کے دستخط
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top:8px;text-align:center;font-size:12px;color:#aaa;font-family:${URDU_FONT};line-height:1.8;">
        دارالعلوم اسلامیہ — نظامِ انتظامِ طلباء
      </div>
    </div>
  `
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

export async function printStudentForm(form) {
  let imageDataUrl = null
  if (form.student_image_file) {
    imageDataUrl = await readFileAsDataUrl(form.student_image_file)
  }

  const html = buildFormHtml(form, imageDataUrl)

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return

  win.document.write(`<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>فارمِ داخلہ — ${form.name || 'طالب علم'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Noto Nastaliq Urdu', serif;
      background: #fff;
      padding: 20px;
      direction: rtl;
    }
    @page {
      size: A4 portrait;
      margin: 2.5in 0.5in 0.5in 1.5in;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
    .toolbar {
      display: flex; gap: 10px; margin-bottom: 16px; align-items: center; direction: ltr;
    }
    .btn {
      padding: 8px 18px; border: none; border-radius: 6px; font-size: 14px;
      font-weight: 700; cursor: pointer; font-family: 'Noto Nastaliq Urdu', serif;
    }
    .btn-print { background: #6c5ce7; color: #fff; }
    .btn-close  { background: #eee; color: #333; }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <button class="btn btn-print" onclick="window.print()">🖨️ پرنٹ کریں</button>
    <button class="btn btn-close" onclick="window.close()">✕ بند کریں</button>
  </div>
  ${html}
  <script>
    document.fonts.ready.then(() => window.print())
  </script>
</body>
</html>`)
  win.document.close()
}
