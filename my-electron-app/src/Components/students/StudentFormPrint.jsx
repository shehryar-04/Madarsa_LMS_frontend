import madarsaLogo from '../../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'
import { getLabel } from '../../constants/getLabel'
import { supabase } from '../../Auth/SupabaseClient'

const URDU_FONT = "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif"
const LATIN_FONT = "'Public Sans', 'Inter', 'Segoe UI', sans-serif"
const val = (v) => v || ''

function buildFormHtml(form, imageDataUrl) {
  const L = getLabel

  const avatarHtml = imageDataUrl
    ? `<img src="${imageDataUrl}" style="width:100%;height:100%;object-fit:cover;" />`
    : `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#666;font-size:9px;font-family:${URDU_FONT};text-align:center;line-height:1.4;"><span style="font-size:24px;margin-bottom:2px;">📷</span>تصویر</div>`

  const row = (label, value, isUrdu = false) => {
    const font = isUrdu ? URDU_FONT : LATIN_FONT
    const size = isUrdu ? '14px' : '12px'
    return `<div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px;direction:rtl;">
      <div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:#333;white-space:nowrap;line-height:1.3;flex-shrink:0;">${label}:</div>
      <div style="flex:1;border-bottom:1.5px solid #000;padding:2px 0;min-height:18px;font-family:${font};font-size:${size};text-align:center;color:#000;line-height:1.4;">${val(value)}</div>
    </div>`
  }

  const row2 = (l1, v1, u1, l2, v2, u2) => {
    const mk = (l, v, u) => {
      const f = u ? URDU_FONT : LATIN_FONT; const s = u ? '14px' : '12px'
      return `<div style="flex:1;display:flex;align-items:baseline;gap:4px;">
        <div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:#333;white-space:nowrap;line-height:1.3;flex-shrink:0;">${l}:</div>
        <div style="flex:1;border-bottom:1.5px solid #000;padding:2px 0;min-height:18px;font-family:${f};font-size:${s};text-align:center;color:#000;line-height:1.4;">${val(v)}</div>
      </div>`
    }
    return `<div style="display:flex;gap:12px;margin-bottom:8px;direction:rtl;">${mk(l1,v1,u1)}${mk(l2,v2,u2)}</div>`
  }

  const row3 = (l1, v1, u1, l2, v2, u2, l3, v3, u3) => {
    const mk = (l, v, u) => {
      const f = u ? URDU_FONT : LATIN_FONT; const s = u ? '14px' : '12px'
      return `<div style="flex:1;display:flex;align-items:baseline;gap:4px;">
        <div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:#333;white-space:nowrap;line-height:1.3;flex-shrink:0;">${l}:</div>
        <div style="flex:1;border-bottom:1.5px solid #000;padding:2px 0;min-height:18px;font-family:${f};font-size:${s};text-align:center;color:#000;line-height:1.4;">${val(v)}</div>
      </div>`
    }
    return `<div style="display:flex;gap:12px;margin-bottom:8px;direction:rtl;">${mk(l1,v1,u1)}${mk(l2,v2,u2)}${mk(l3,v3,u3)}</div>`
  }

  // Section header: full-width top line, text-width bottom line, more top space
  const section = (titleUr) =>
    `<div style="border-top:2.7px solid #000;margin:16px 0 0;"></div>
     <div style="direction:rtl;margin:0 0 8px;">
       <span style="font-family:${URDU_FONT};font-size:12px;font-weight:700;color:#000;line-height:1.5;border-bottom:1px solid #000;padding:2px 0 1px;display:inline-block;">${titleUr}</span>
     </div>`

  const cnicRow = (() => {
    const mk = (l, v, u, flex) => {
      const f = u ? URDU_FONT : LATIN_FONT; const s = u ? '14px' : '12px'
      return `<div style="flex:${flex};display:flex;align-items:baseline;gap:4px;">
        <div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:#333;white-space:nowrap;line-height:1.3;flex-shrink:0;">${l}:</div>
        <div style="flex:1;border-bottom:1.5px solid #000;padding:2px 0;min-height:18px;font-family:${f};font-size:${s};text-align:center;color:#000;line-height:1.4;">${val(v)}</div>
      </div>`
    }
    return `<div style="display:flex;gap:12px;margin-bottom:8px;direction:rtl;">
      ${mk(L('print.dob'), form.dob, false, '2')}
      ${mk(L('print.cnic'), form.cnic, false, '4')}
      ${mk(L('print.phone'), form.phone, false, '2')}
    </div>`
  })()

  return `<div style="font-family:${LATIN_FONT};color:#111;position:relative;min-height:100%;">

  <!-- HEADER -->
  <header style="padding-bottom:10px;margin-bottom:8px;direction:rtl;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div style="border:2px solid #000;width:78px;height:96px;overflow:hidden;flex-shrink:0;">${avatarHtml}</div>
      <div style="text-align:center;flex:1;padding:0 10px;">
        <!-- Logo + Title -->
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;">
          <img src="${madarsaLogo}" alt="logo" style="width:50px;height:50px;object-fit:contain;" />
          <div style="font-family:${URDU_FONT};font-size:24px;font-weight:700;color:#000;line-height:1.2;">${L('print.title')}</div>
        </div>
        <!-- Line under title, only text width -->
        <div style="text-align:center;margin-top:2px;"><div style="display:inline-block;border-bottom:1.5px solid #000;width:auto;padding:0 30px;">&nbsp;</div></div>
        <!-- Serial | Dakhla Form | Date — all in one line -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;direction:rtl;">
          <div style="font-family:${URDU_FONT};font-size:11px;font-weight:700;color:#000;line-height:1.4;">سلسلہ نمبر: ${val(form.serial_no)}</div>
          <div style="font-family:${URDU_FONT};font-size:16px;font-weight:700;color:#000;">داخلہ فارم</div>
          <div style="font-family:${URDU_FONT};font-size:11px;color:#000;line-height:1.4;">تاریخ: ${new Date().toLocaleDateString('ur-PK')}</div>
        </div>
      </div>
    </div>
  </header>

  <!-- PERSONAL INFORMATION -->
  ${section(L('print.personalSection') || 'ذاتی معلومات')}
  ${row3(L('print.fullName'), form.name, true, L('print.fatherName'), form.father_name, true, L('print.bloodGroup'), form.blood_group, false)}
  ${cnicRow}
  ${row(L('print.address'), form.address, true)}

  <!-- ENROLLMENT DETAILS -->
  ${section(L('print.enrollmentSection'))}
  ${row2(L('print.classLevel'), form.class_level, true, L('print.entryYear'), form.entry_year, false)}
  ${row2(L('print.admissionDate'), form.tareekh_daakhla, false, L('print.miyarEKamyabi'), form.miyar_e_kamyabi, true)}
  ${row2(L('print.lastYearMarks'), form.last_year_marks, true, L('print.previousStudies'), form.previous_studies, true)}
  ${row(L('print.previousInstitution'), form.previous_institution, true)}

  <!-- GUARDIAN INFORMATION -->
  ${section(L('print.guardianSection'))}
  ${row2(L('print.guardianName'), form.guardian_name, true, L('print.relation'), form.guardian_relation, true)}
  ${row2(L('print.guardianCnic'), form.guardian_cnic, false, L('print.guardianPhone'), form.guardian_phone, false)}

  <!-- RESIDENCE -->
  ${section(L('print.residenceSection'))}
  ${row3(L('print.residentialStatus'), form.residential_status, true, L('print.district'), form.district, true, L('print.roomNumber'), form.room_number || '', false)}

  <!-- SIGNATURES -->
  <div style="display:flex;justify-content:space-between;gap:16px;margin-top:20px;border-top:2.5px solid #000;padding-top:4px;">
    <div style="text-align:center;flex:1;"><div style="height:60px;"></div><div style="border-top:1.5px solid #000;padding-top:2px;"><div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:#000;direction:rtl;">${L('print.studentSig')}</div></div></div>
    <div style="text-align:center;flex:1;"><div style="height:60px;"></div><div style="border-top:1.5px solid #000;padding-top:2px;"><div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:#000;direction:rtl;">${L('print.guardianSig')}</div></div></div>
    <div style="text-align:center;flex:1;"><div style="height:60px;"></div><div style="border-top:1.5px solid #000;padding-top:2px;"><div style="font-family:${URDU_FONT};font-size:10px;font-weight:700;color:#000;direction:rtl;">${L('print.principalSig')}</div></div></div>
  </div>

  </div>
</div>`
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
  const L = getLabel
  let imageDataUrl = null
  if (form.student_image_file) {
    imageDataUrl = await readFileAsDataUrl(form.student_image_file)
  } else if (form.student_image) {
    try {
      const { data } = supabase.storage.from('Darul-Uloom-Students').getPublicUrl(form.student_image)
      if (data?.publicUrl) {
        const resp = await fetch(data.publicUrl)
        if (resp.ok) {
          const blob = await resp.blob()
          imageDataUrl = await new Promise(resolve => {
            const reader = new FileReader()
            reader.onload = e => resolve(e.target.result)
            reader.onerror = () => resolve(null)
            reader.readAsDataURL(blob)
          })
        }
      }
    } catch { /* print without image */ }
  }

  const bodyContent = buildFormHtml(form, imageDataUrl)
  const win = window.open('', '_blank', 'width=900,height=1000,scrollbars=yes,resizable=yes')
  if (!win) return

  win.document.write(`<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title> </title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #e8e8e8; font-family: 'Public Sans', sans-serif; color: #111; }
    .no-print-toolbar {
      position: sticky; top: 0; z-index: 100; background: #1f222a; border-bottom: 2px solid #000;
      padding: 10px 24px; display: flex; align-items: center; justify-content: space-between;
    }
    .no-print-toolbar .title { font-size: 14px; font-weight: 700; color: #e8ecf4; }
    .no-print-toolbar .sub { font-size: 11px; color: #a1a7b5; margin-top: 2px; }
    .no-print-toolbar .btn { padding: 8px 20px; border: none; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .btn-print { background: rgba(116,185,255,0.15); color: #74b9ff; border: 1px solid #74b9ff !important; }
    .btn-close { background: #333; color: #ccc; }
    .a4-page { width: 210mm; height: 297mm; padding: 16mm; margin: 20px auto; background: #fff; box-shadow: 0 0 12px rgba(0,0,0,0.12); border: 2px solid #000; position: relative; overflow: hidden; }
    @page { size: A4 portrait; margin: 0; }
    @media print { body { background: #fff !important; } .no-print-toolbar { display: none !important; } .a4-page { margin: 0; box-shadow: none; border: none; width: 100%; height: auto; padding: 2.5in 0.5in 0.5in 1.5in; } }
  </style>
</head>
<body>
  <div class="no-print-toolbar">
    <div><div class="title">📄 ${L('print.formTitle')}</div><div class="sub">${form.name || ''}</div></div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-print" onclick="window.print()">${L('print.printBtn')}</button>
      <button class="btn btn-close" onclick="window.close()">${L('print.closeBtn')}</button>
    </div>
  </div>
  <div class="a4-page">${bodyContent}</div>
  <script>document.fonts.ready.then(() => window.print())</script>
</body>
</html>`)
  win.document.close()
}
