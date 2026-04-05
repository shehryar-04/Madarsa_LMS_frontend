import React from 'react'
import { STUDENT_TYPES, CLASS_OPTIONS, GUARDIAN_RELATIONS } from '../../constants/student'

export default function StudentFormFields({ formState, onChange, onFileChange }) {
  return (
    <>
      {/* ── Basic Information ── */}
      <div className="form-section">
        <h4 className="form-section-title">👤 Basic Information — بنیادی معلومات</h4>
        <div className="form-grid">
          <label className="form-label form-label-wide">
            <span>Student Image (تصویر طالب علم)</span>
            <input
              type="file"
              accept="image/*"
              onChange={e => onFileChange?.('student_image_file', e.target.files[0])}
            />
            {formState.student_image && !formState.student_image_file && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--dash-green)' }}>
                ✓ Image stored in bucket
              </div>
            )}
          </label>

          <label className="form-label">
            <span>Full Name (نام) *</span>
            <input name="name" value={formState.name || ''} onChange={onChange} required placeholder="e.g. محمد عدنان" dir="auto" />
          </label>
          <label className="form-label">
            <span>Father's Name (ولدیت) *</span>
            <input name="father_name" value={formState.father_name || ''} onChange={onChange} required placeholder="e.g. محمد یوسف" dir="auto" />
          </label>
          <label className="form-label">
            <span>Date of Birth (تاریخ پیدائش)</span>
            <input type="date" name="dob" value={formState.dob || ''} onChange={onChange} />
          </label>
          <label className="form-label">
            <span>Student CNIC / B-Form No.</span>
            <input name="cnic" value={formState.cnic || ''} onChange={onChange} required placeholder="e.g. 35201-1234567-1" />
          </label>
          <label className="form-label">
            <span>Phone Number (فون نمبر)</span>
            <input name="phone" value={formState.phone || ''} onChange={onChange} placeholder="03XX-XXXXXXX" />
          </label>
        </div>
      </div>

      {/* ── Enrollment Details ── */}
      <div className="form-section">
        <h4 className="form-section-title">🎓 Enrollment Details — تفصیلات داخلہ</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Student Type *</span>
            <select name="student_type" value={formState.student_type || ''} onChange={onChange} required>
              <option value="">— Select Type —</option>
              {STUDENT_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>Class / Level (درجہ)</span>
            <select name="class_level" value={formState.class_level || ''} onChange={onChange}>
              <option value="">— Select Class —</option>
              {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>Entry Year (سالِ داخلہ)</span>
            <input name="entry_year" value={formState.entry_year || ''} onChange={onChange} placeholder="e.g. 2024" />
          </label>
          <label className="form-label">
            <span>Admission Date (تاریخِ داخلہ)</span>
            <input type="date" name="tareekh_daakhla" value={formState.tareekh_daakhla || ''} onChange={onChange} />
          </label>
          <label className="form-label">
            <span>Leaving Date (تاریخِ اجراء)</span>
            <input type="date" name="tareekh_ijaara" value={formState.tareekh_ijaara || ''} onChange={onChange} />
          </label>
          <label className="form-label">
            <span>Serial No. (سلسلہ نمبر)</span>
            <input name="serial_no" value={formState.serial_no || ''} onChange={onChange} placeholder="e.g. 1423" />
          </label>
          <label className="form-label">
            <span>Form No. (فارم نمبر)</span>
            <input name="form_no" value={formState.form_no || ''} onChange={onChange} placeholder="e.g. F-234" />
          </label>
        </div>
      </div>

      {/* ── Guardian Information ── */}
      <div className="form-section">
        <h4 className="form-section-title">👨‍👩‍👦 Guardian Information — ولی / سرپرست کی معلومات</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Guardian's Name</span>
            <input name="guardian_name" value={formState.guardian_name || ''} onChange={onChange} placeholder="e.g. محمد یوسف" dir="auto" />
          </label>
          <label className="form-label">
            <span>Relation (رشتہ)</span>
            <select name="guardian_relation" value={formState.guardian_relation || ''} onChange={onChange}>
              <option value="">— Select Relation —</option>
              {GUARDIAN_RELATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>Guardian CNIC No.</span>
            <input name="guardian_cnic" value={formState.guardian_cnic || ''} onChange={onChange} placeholder="e.g. 35201-9876543-1" />
          </label>
          <label className="form-label">
            <span>Guardian's Phone</span>
            <input name="guardian_phone" value={formState.guardian_phone || ''} onChange={onChange} placeholder="e.g. 0300-1234567" />
          </label>
        </div>
      </div>

      {/* ── Residence & Location ── */}
      <div className="form-section">
        <h4 className="form-section-title">📍 Residence & Location — رہائش اور مقام</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Residential Status (مقیم/غیرمقیم)</span>
            <select name="residential_status" value={formState.residential_status || ''} onChange={onChange}>
              <option value="">— Select —</option>
              <option value="مقیم">مقیم (Resident)</option>
              <option value="غیر مقیم">غیر مقیم (Non-Resident)</option>
            </select>
          </label>
          {formState.residential_status === 'مقیم' && (
            <label className="form-label">
              <span>Room Number (کمرہ نمبر)</span>
              <input name="room_number" value={formState.room_number || ''} onChange={onChange} placeholder="e.g. A-12" dir="auto" />
            </label>
          )}
          <label className="form-label">
            <span>District (ضلع) *</span>
            <input name="district" value={formState.district || ''} onChange={onChange} required placeholder="e.g. لاہور" dir="auto" />
          </label>
          <label className="form-label form-label-wide">
            <span>Address (پتہ)</span>
            <textarea name="address" value={formState.address || ''} onChange={onChange} placeholder="Full home address..." dir="auto" />
          </label>
        </div>
      </div>

      {/* ── Additional Details ── */}
      <div className="form-section">
        <h4 className="form-section-title">🔗 Additional Details</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Source Sheet</span>
            <input name="source_sheet" value={formState.source_sheet || ''} onChange={onChange} placeholder="Source sheet" />
          </label>
          <label className="form-label">
            <span>Source Row</span>
            <input type="number" name="source_row" value={formState.source_row || ''} onChange={onChange} placeholder="Row #" />
          </label>
          <label className="form-label">
            <span>DOB Raw</span>
            <input name="dob_raw" value={formState.dob_raw || ''} onChange={onChange} placeholder="As on document" />
          </label>
        </div>
      </div>
    </>
  )
}
