import React from 'react'
import html2pdf from 'html2pdf.js'

const val = (v) => v || '—'

function buildFormHtml(form, imageDataUrl) {
  const avatarHtml = imageDataUrl
    ? `<img src="${imageDataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:700;color:#6c5ce7;background:#ede9fe;">
        ${(form.name || '?')[0].toUpperCase()}
       </div>`

  return `
    <div style="font-family:'Noto Naskh Arabic','Inter',sans-serif;color:#1a1a2e;background:#fff;padding:28px 32px;width:794px;box-sizing:border-box;">

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #6c5ce7;padding-bottom:14px;margin-bottom:20px;">
        <div>
          <h1 style="margin:0;font-size:20px;font-weight:800;color:#1a1a2e;">دارالعلوم — Madarsa LMS</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#666;">Student Admission Form — فارمِ داخلہ</p>
        </div>
        <div style="text-align:right;font-size:11px;color:#888;">
          <div>Form No: <strong style="color:#1a1a2e;">${val(form.form_no)}</strong></div>
          <div>Serial No: <strong style="color:#1a1a2e;">${val(form.serial_no)}</strong></div>
          <div>Date: <strong style="color:#1a1a2e;">${new Date().toLocaleDateString()}</strong></div>
        </div>
      </div>

      <!-- Top row: photo + basic info -->
      <div style="display:flex;gap:20px;margin-bottom:18px;">
        <!-- Photo box -->
        <div style="flex-shrink:0;width:110px;height:130px;border:2px solid #6c5ce7;border-radius:6px;overflow:hidden;">
          ${avatarHtml}
        </div>

        <!-- Basic info -->
        <div style="flex:1;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr>
              <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;width:38%;border:1px solid #ddd;">Full Name (نام)</td>
              <td style="padding:6px 8px;border:1px solid #ddd;font-size:13px;font-weight:600;" dir="auto">${val(form.name)}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;border:1px solid #ddd;">Father's Name (ولدیت)</td>
              <td style="padding:6px 8px;border:1px solid #ddd;" dir="auto">${val(form.father_name)}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;border:1px solid #ddd;">Date of Birth (تاریخ پیدائش)</td>
              <td style="padding:6px 8px;border:1px solid #ddd;">${val(form.dob)}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;border:1px solid #ddd;">CNIC / B-Form No.</td>
              <td style="padding:6px 8px;border:1px solid #ddd;font-family:monospace;">${val(form.cnic)}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;border:1px solid #ddd;">Phone (فون)</td>
              <td style="padding:6px 8px;border:1px solid #ddd;font-family:monospace;">${val(form.phone)}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Enrollment Details -->
      <div style="margin-bottom:14px;">
        <div style="background:#6c5ce7;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:5px 10px;border-radius:4px 4px 0 0;">
          🎓 Enrollment Details — تفصیلات داخلہ
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tr>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;width:25%;border:1px solid #ddd;border-top:none;">Student Type</td>
            <td style="padding:6px 8px;border:1px solid #ddd;border-top:none;width:25%;">${val(form.student_type?.toUpperCase())}</td>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;width:25%;border:1px solid #ddd;border-top:none;">Class / Level (درجہ)</td>
            <td style="padding:6px 8px;border:1px solid #ddd;border-top:none;" dir="auto">${val(form.class_level)}</td>
          </tr>
          <tr>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;border:1px solid #ddd;">Entry Year (سالِ داخلہ)</td>
            <td style="padding:6px 8px;border:1px solid #ddd;">${val(form.entry_year)}</td>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;border:1px solid #ddd;">Admission Date (تاریخِ داخلہ)</td>
            <td style="padding:6px 8px;border:1px solid #ddd;">${val(form.tareekh_daakhla)}</td>
          </tr>
        </table>
      </div>

      <!-- Guardian Information -->
      <div style="margin-bottom:14px;">
        <div style="background:#6c5ce7;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:5px 10px;border-radius:4px 4px 0 0;">
          👨‍👩‍👦 Guardian Information — ولی / سرپرست
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tr>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;width:25%;border:1px solid #ddd;border-top:none;">Guardian Name</td>
            <td style="padding:6px 8px;border:1px solid #ddd;border-top:none;width:25%;" dir="auto">${val(form.guardian_name)}</td>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;width:25%;border:1px solid #ddd;border-top:none;">Relation (رشتہ)</td>
            <td style="padding:6px 8px;border:1px solid #ddd;border-top:none;" dir="auto">${val(form.guardian_relation)}</td>
          </tr>
          <tr>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;border:1px solid #ddd;">Guardian CNIC</td>
            <td style="padding:6px 8px;border:1px solid #ddd;font-family:monospace;">${val(form.guardian_cnic)}</td>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;border:1px solid #ddd;">Guardian Phone</td>
            <td style="padding:6px 8px;border:1px solid #ddd;font-family:monospace;">${val(form.guardian_phone)}</td>
          </tr>
        </table>
      </div>

      <!-- Residence -->
      <div style="margin-bottom:14px;">
        <div style="background:#6c5ce7;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:5px 10px;border-radius:4px 4px 0 0;">
          📍 Residence & Location — رہائش اور مقام
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tr>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;width:25%;border:1px solid #ddd;border-top:none;">Residential Status</td>
            <td style="padding:6px 8px;border:1px solid #ddd;border-top:none;width:25%;" dir="auto">${val(form.residential_status)}</td>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;width:25%;border:1px solid #ddd;border-top:none;">District (ضلع)</td>
            <td style="padding:6px 8px;border:1px solid #ddd;border-top:none;" dir="auto">${val(form.district)}</td>
          </tr>
          ${form.residential_status === 'مقیم' ? `
          <tr>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;border:1px solid #ddd;">Room Number</td>
            <td style="padding:6px 8px;border:1px solid #ddd;" dir="auto">${val(form.room_number)}</td>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;border:1px solid #ddd;"></td>
            <td style="padding:6px 8px;border:1px solid #ddd;"></td>
          </tr>` : ''}
          <tr>
            <td style="padding:6px 8px;background:#f5f3ff;font-weight:700;border:1px solid #ddd;">Address (پتہ)</td>
            <td colspan="3" style="padding:6px 8px;border:1px solid #ddd;" dir="auto">${val(form.address)}</td>
          </tr>
        </table>
      </div>

      <!-- Signature row -->
      <div style="display:flex;justify-content:space-between;margin-top:28px;padding-top:16px;border-top:1px solid #ddd;">
        <div style="text-align:center;width:30%;">
          <div style="border-top:1px solid #333;padding-top:6px;font-size:11px;color:#555;">Student Signature / طالب علم کے دستخط</div>
        </div>
        <div style="text-align:center;width:30%;">
          <div style="border-top:1px solid #333;padding-top:6px;font-size:11px;color:#555;">Guardian Signature / ولی کے دستخط</div>
        </div>
        <div style="text-align:center;width:30%;">
          <div style="border-top:1px solid #333;padding-top:6px;font-size:11px;color:#555;">Principal Signature / مہتمم کے دستخط</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top:16px;text-align:center;font-size:10px;color:#aaa;">
        Madarsa LMS — Student Management System • Generated ${new Date().toLocaleString()}
      </div>
    </div>
  `
}

/** Reads a File object as a base64 data URL */
function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

export async function printStudentForm(form) {
  // If a new image file was selected, convert it to base64 for embedding in the PDF
  let imageDataUrl = null
  if (form.student_image_file) {
    imageDataUrl = await readFileAsDataUrl(form.student_image_file)
  }

  const html = buildFormHtml(form, imageDataUrl)
  const container = document.createElement('div')
  container.innerHTML = html

  await html2pdf().set({
    margin: 8,
    filename: `admission_form_${form.name || 'student'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(container.firstElementChild).save()
}
