import React, { useState } from 'react'
import { STUDENT_TYPES, GUARDIAN_RELATIONS } from '../../constants/student'
import { useClasses } from '../../hooks/useClasses'

/** Auto-formats CNIC as 35201-1234567-1 */
function formatCnic(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 5) return digits
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}

/** Auto-formats phone as 0300-1234567 */
function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 4) return digits
  return `${digits.slice(0, 4)}-${digits.slice(4)}`
}

export default function StudentFormFields({ formState, onChange, onFileChange, rooms = [], cnicRequired = true }) {
  const [imagePreview, setImagePreview] = useState(null)
  const { classNames } = useClasses()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    onFileChange?.('student_image_file', file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Intercept CNIC and phone changes to auto-format
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'cnic' || name === 'guardian_cnic') {
      onChange({ target: { name, value: formatCnic(value) } })
    } else if (name === 'phone' || name === 'guardian_phone') {
      onChange({ target: { name, value: formatPhone(value) } })
    } else {
      onChange(e)
    }
  }

  return (
    <>
      {/* ── Basic Information ── */}
      <div className="form-section">
        <h4 className="form-section-title">👤 Basic Information — بنیادی معلومات</h4>
        <div className="form-grid">
          <label className="form-label form-label-wide">
            <span>Student Image (تصویر طالب علم)</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <img src={imagePreview} alt="preview" style={{ marginTop: '10px', width: '100px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--dash-accent)' }} />
            )}
            {formState.student_image && !formState.student_image_file && !imagePreview && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--dash-green)' }}>✓ Image stored in bucket</div>
            )}
          </label>

          <label className="form-label">
            <span>Full Name (نام) *</span>
            <input name="name" value={formState.name || ''} onChange={handleChange} required placeholder="e.g. محمد عدنان" dir="auto" />
          </label>
          <label className="form-label">
            <span>Father's Name (ولدیت) *</span>
            <input name="father_name" value={formState.father_name || ''} onChange={handleChange} required placeholder="e.g. محمد یوسف" dir="auto" />
          </label>
          <label className="form-label">
            <span>Date of Birth (تاریخ پیدائش)</span>
            <input type="date" name="dob" value={formState.dob || ''} onChange={handleChange} />
          </label>
          <label className="form-label">
            <span>Student CNIC / B-Form No.</span>
            <input
              name="cnic"
              value={formState.cnic || ''}
              onChange={handleChange}
              required={cnicRequired}
              placeholder="35201-1234567-1"
              maxLength={15}
              className="mono"
            />
          </label>
          <label className="form-label">
            <span>Phone Number (فون نمبر)</span>
            <input
              name="phone"
              value={formState.phone || ''}
              onChange={handleChange}
              placeholder="0300-1234567"
              maxLength={12}
              className="mono"
            />
          </label>
        </div>
      </div>

      {/* ── Enrollment Details ── */}
      <div className="form-section">
        <h4 className="form-section-title">🎓 Enrollment Details — تفصیلات داخلہ</h4>
        <div className="form-grid">
          <label className="form-label form-label-wide" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--dash-radius-sm)', border: `1px solid ${formState.status === 'inactive' ? 'var(--dash-red)' : 'var(--dash-green)'}`, background: formState.status === 'inactive' ? 'var(--dash-red-light)' : 'var(--dash-green-light)' }}>
            <span style={{ color: formState.status === 'inactive' ? 'var(--dash-red)' : 'var(--dash-green)', fontWeight: 700 }}>
              {formState.status === 'inactive' ? '🔴 Inactive' : '🟢 Active'}
            </span>
            <select name="status" value={formState.status || 'active'} onChange={handleChange}
              style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="form-label">
            <span>Student Type *</span>
            <select name="student_type" value={formState.student_type || ''} onChange={handleChange} required>
              <option value="">— Select Type —</option>
              {STUDENT_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>Class / Level (درجہ)</span>
            <select name="class_level" value={formState.class_level || ''} onChange={handleChange}>
              <option value="">— Select Class —</option>
              {classNames.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>Entry Year (سالِ داخلہ)</span>
            <input name="entry_year" value={formState.entry_year || ''} onChange={handleChange} placeholder="e.g. 2024" />
          </label>
          <label className="form-label">
            <span>Admission Date (تاریخِ داخلہ)</span>
            <input type="date" name="tareekh_daakhla" value={formState.tareekh_daakhla || ''} onChange={handleChange} />
          </label>
          <label className="form-label">
            <span>Leaving Date (تاریخِ اجراء)</span>
            <input type="date" name="tareekh_ijaara" value={formState.tareekh_ijaara || ''} onChange={handleChange} />
          </label>
          <label className="form-label">
            <span>Serial No. (سلسلہ نمبر)</span>
            <input name="serial_no" value={formState.serial_no || ''} onChange={handleChange} placeholder="e.g. 1423" />
          </label>
          <label className="form-label">
            <span>Form No. (فارم نمبر)</span>
            <input name="form_no" value={formState.form_no || ''} onChange={handleChange} placeholder="e.g. F-234" />
          </label>
        </div>
      </div>

      {/* ── Guardian Information ── */}
      <div className="form-section">
        <h4 className="form-section-title">👨‍👩‍👦 Guardian Information — ولی / سرپرست کی معلومات</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Guardian's Name</span>
            <input name="guardian_name" value={formState.guardian_name || ''} onChange={handleChange} placeholder="e.g. محمد یوسف" dir="auto" />
          </label>
          <label className="form-label">
            <span>Relation (رشتہ)</span>
            <select name="guardian_relation" value={formState.guardian_relation || ''} onChange={handleChange}>
              <option value="">— Select Relation —</option>
              {GUARDIAN_RELATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>Guardian CNIC No.</span>
            <input
              name="guardian_cnic"
              value={formState.guardian_cnic || ''}
              onChange={handleChange}
              placeholder="35201-9876543-1"
              maxLength={15}
              className="mono"
            />
          </label>
          <label className="form-label">
            <span>Guardian's Phone</span>
            <input
              name="guardian_phone"
              value={formState.guardian_phone || ''}
              onChange={handleChange}
              placeholder="0300-1234567"
              maxLength={12}
              className="mono"
            />
          </label>
        </div>
      </div>

      {/* ── Residence & Location ── */}
      <div className="form-section">
        <h4 className="form-section-title">📍 Residence & Location — رہائش اور مقام</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Residential Status (مقیم/غیرمقیم)</span>
            <select name="residential_status" value={formState.residential_status || ''} onChange={handleChange}>
              <option value="">— Select —</option>
              <option value="مقیم">مقیم (Resident)</option>
              <option value="غیر مقیم">غیر مقیم (Non-Resident)</option>
            </select>
          </label>
          {formState.residential_status === 'مقیم' && (
            <label className="form-label">
              <span>Room Number (کمرہ نمبر)</span>
              {rooms.length > 0 ? (
                <select name="room_number" value={formState.room_number || ''} onChange={handleChange}>
                  <option value="">— Select Room —</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.room_number} disabled={r.current_occupancy >= r.capacity}>
                      Room {r.room_number} — {r.current_occupancy}/{r.capacity} occupied
                      {r.current_occupancy >= r.capacity ? ' (Full)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input name="room_number" value={formState.room_number || ''} onChange={handleChange} placeholder="e.g. A-12" dir="auto" />
              )}
            </label>
          )}
          <label className="form-label">
            <span>District (ضلع) *</span>
            <input name="district" value={formState.district || ''} onChange={handleChange} required placeholder="e.g. لاہور" dir="auto" />
          </label>
          <label className="form-label form-label-wide">
            <span>Address (پتہ)</span>
            <textarea name="address" value={formState.address || ''} onChange={handleChange} placeholder="Full home address..." dir="auto" />
          </label>
        </div>
      </div>
    </>
  )
}
