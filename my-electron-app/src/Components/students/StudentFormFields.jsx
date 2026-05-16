import React, { useState } from 'react'
import { STUDENT_TYPES, GUARDIAN_RELATIONS } from '../../constants/student'
import { useClasses } from '../../hooks/useClasses'
import { useLabels } from '../../hooks/useUiLabels'
import { supabase } from '../../Auth/SupabaseClient'

function ExistingImage({ path }) {
  const { data } = supabase.storage.from('Darul-Uloom-Students').getPublicUrl(path)
  return (
    <img
      src={data?.publicUrl}
      alt="student"
      style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--dash-accent)' }}
    />
  )
}

function formatCnic(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 5) return digits
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 4) return digits
  return `${digits.slice(0, 4)}-${digits.slice(4)}`
}

export default function StudentFormFields({ formState, onChange, onFileChange, rooms = [], cnicRequired = true }) {
  const [imagePreview, setImagePreview] = useState(null)
  const { classNames } = useClasses()
  const { t, tJSON } = useLabels()

  // Use dynamic options from labels if available, fallback to static constants
  const studentTypes = tJSON('opt.studentTypes') || STUDENT_TYPES
  const guardianRelations = tJSON('opt.guardianRelations') || GUARDIAN_RELATIONS

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    onFileChange?.('student_image_file', file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    onFileChange?.('student_image_file', null)
    onChange({ target: { name: 'student_image', value: '' } })
    setImagePreview(null)
  }

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
        <h4 className="form-section-title">{t('form.basicInfo')}</h4>
        <div className="form-grid">
          <label className="form-label form-label-wide">
            <span>{t('form.studentImage')}</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <div style={{ marginTop: '10px', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <img src={imagePreview} alt="preview" style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--dash-accent)' }} />
                <button type="button" onClick={handleRemoveImage}
                  style={{ fontSize: '12px', color: 'var(--dash-red)', background: 'var(--dash-red-light)', border: '1px solid var(--dash-red)', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer' }}>
                  {t('form.removeImage')}
                </button>
              </div>
            )}
            {formState.student_image && !formState.student_image_file && !imagePreview && (
              <div style={{ marginTop: '10px', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <ExistingImage path={formState.student_image} />
                <button type="button" onClick={handleRemoveImage}
                  style={{ fontSize: '12px', color: 'var(--dash-red)', background: 'var(--dash-red-light)', border: '1px solid var(--dash-red)', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer' }}>
                  {t('form.removeImage')}
                </button>
              </div>
            )}
          </label>

          <label className="form-label">
            <span>{t('form.fullName')}</span>
            <input name="name" value={formState.name || ''} onChange={handleChange} required placeholder="e.g. محمد عدنان" dir="auto" />
          </label>
          <label className="form-label">
            <span>{t('form.fatherName')}</span>
            <input name="father_name" value={formState.father_name || ''} onChange={handleChange} required placeholder="e.g. محمد یوسف" dir="auto" />
          </label>
          <label className="form-label">
            <span>{t('form.dob')}</span>
            <input type="date" name="dob" value={formState.dob || ''} onChange={handleChange} />
          </label>
          <label className="form-label">
            <span>{t('form.cnic')}</span>
            <input name="cnic" value={formState.cnic || ''} onChange={handleChange} required={cnicRequired} placeholder="35201-1234567-1" maxLength={15} className="mono" />
          </label>
          <label className="form-label">
            <span>{t('form.phone')}</span>
            <input name="phone" value={formState.phone || ''} onChange={handleChange} placeholder="0300-1234567" maxLength={12} className="mono" />
          </label>
          <label className="form-label">
            <span>{t('form.bloodGroup')}</span>
            <select name="blood_group" value={formState.blood_group || ''} onChange={handleChange}>
              <option value="">— Select —</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </label>
        </div>
      </div>

      {/* ── Enrollment Details ── */}
      <div className="form-section">
        <h4 className="form-section-title">{t('form.enrollment')}</h4>
        <div className="form-grid">
          <label className="form-label form-label-wide" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--dash-radius-sm)', border: `1px solid ${formState.status === 'current' ? 'var(--dash-green)' : formState.status === 'passed' ? 'var(--dash-accent)' : 'var(--dash-red)'}`, background: formState.status === 'current' ? 'var(--dash-green-light)' : formState.status === 'passed' ? 'var(--dash-accent-light)' : 'var(--dash-red-light)' }}>
            <span style={{ color: formState.status === 'current' ? 'var(--dash-green)' : formState.status === 'passed' ? 'var(--dash-accent)' : 'var(--dash-red)', fontWeight: 700 }}>
              {formState.status === 'current' ? `🟢 ${t('table.active')}` : formState.status === 'passed' ? `🎓 ${t('table.passed')}` : `🔴 ${t('table.inactive')}`}
            </span>
            <select name="status" value={formState.status || 'current'} onChange={handleChange}
              style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              <option value="current">{t('table.active')}</option>
              <option value="rusticated">{t('table.inactive')}</option>
              <option value="passed">{t('table.passed')}</option>
            </select>
          </label>
          <label className="form-label">
            <span>{t('form.studentType')}</span>
            <select name="student_type" value={formState.student_type || ''} onChange={handleChange} required>
              <option value="">{t('form.selectType')}</option>
              {studentTypes.map(tp => <option key={tp} value={tp}>{tp.toUpperCase()}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>{t('form.classLevel')}</span>
            <select name="class_level" value={formState.class_level || ''} onChange={handleChange}>
              <option value="">{t('form.selectClass')}</option>
              {classNames.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>{t('form.entryYear')}</span>
            <input name="entry_year" value={formState.entry_year || ''} onChange={handleChange} placeholder="e.g. 2024" />
          </label>
          <label className="form-label">
            <span>{t('form.admissionDate')}</span>
            <input type="date" name="tareekh_daakhla" value={formState.tareekh_daakhla || ''} onChange={handleChange} />
          </label>
          <label className="form-label">
            <span>{t('form.leavingDate')}</span>
            <input type="date" name="tareekh_ijaara" value={formState.tareekh_ijaara || ''} onChange={handleChange} />
          </label>
          <label className="form-label">
            <span>{t('form.serialNo')}</span>
            <input name="serial_no" value={formState.serial_no || ''} onChange={handleChange} placeholder="e.g. 1423" />
          </label>
          <label className="form-label">
            <span>{t('form.previousInstitution')}</span>
            <input name="previous_institution" value={formState.previous_institution || ''} onChange={handleChange} placeholder="سابقہ ادارے کا نام" dir="auto" />
          </label>
          <label className="form-label form-label-wide">
            <span>{t('form.previousStudies')}</span>
            <textarea name="previous_studies" value={formState.previous_studies || ''} onChange={handleChange} placeholder="سابقہ تعلیم کی تفصیل" dir="auto" />
          </label>
          <label className="form-label">
            <span>{t('form.lastYearMarks')}</span>
            <input name="last_year_marks" value={formState.last_year_marks || ''} onChange={handleChange} placeholder="گزشتہ سال کے نمبرات" dir="auto" />
          </label>
          <label className="form-label">
            <span>{t('form.miyarEKamyabi')}</span>
            <input name="miyar_e_kamyabi" value={formState.miyar_e_kamyabi || ''} onChange={handleChange} placeholder="معیارِ کامیابی" dir="auto" />
          </label>
        </div>
      </div>

      {/* ── Guardian Information ── */}
      <div className="form-section">
        <h4 className="form-section-title">{t('form.guardian')}</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>{t('form.guardianName')}</span>
            <input name="guardian_name" value={formState.guardian_name || ''} onChange={handleChange} placeholder="e.g. محمد یوسف" dir="auto" />
          </label>
          <label className="form-label">
            <span>{t('form.guardianRelation')}</span>
            <select name="guardian_relation" value={formState.guardian_relation || ''} onChange={handleChange}>
              <option value="">{t('form.selectRelation')}</option>
              {guardianRelations.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>{t('form.guardianCnic')}</span>
            <input name="guardian_cnic" value={formState.guardian_cnic || ''} onChange={handleChange} placeholder="35201-9876543-1" maxLength={15} className="mono" />
          </label>
          <label className="form-label">
            <span>{t('form.guardianPhone')}</span>
            <input name="guardian_phone" value={formState.guardian_phone || ''} onChange={handleChange} placeholder="0300-1234567" maxLength={12} className="mono" />
          </label>
        </div>
      </div>

      {/* ── Residence & Location ── */}
      <div className="form-section">
        <h4 className="form-section-title">{t('form.residence')}</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>{t('form.residentialStatus')}</span>
            <select name="residential_status" value={formState.residential_status || ''} onChange={handleChange}>
              <option value="">{t('form.selectResidence')}</option>
              <option value="مقیم">{t('form.resident')}</option>
              <option value="غیر مقیم">{t('form.nonResident')}</option>
            </select>
          </label>
          {formState.residential_status === 'مقیم' && (
            <label className="form-label">
              <span>{t('form.roomNumber')}</span>
              {rooms.length > 0 ? (
                <select name="room_number" value={formState.room_number || ''} onChange={handleChange}>
                  <option value="">{t('form.selectRoom')}</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.room_number} disabled={r.current_occupancy >= r.capacity}>
                      Room {r.room_number} — {r.current_occupancy}/{r.capacity}
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
            <span>{t('form.districtField')}</span>
            <input name="district" value={formState.district || ''} onChange={handleChange} required placeholder="e.g. لاہور" dir="auto" />
          </label>
          <label className="form-label form-label-wide">
            <span>{t('form.address')}</span>
            <textarea name="address" value={formState.address || ''} onChange={handleChange} placeholder="Full home address..." dir="auto" />
          </label>
        </div>
      </div>
    </>
  )
}
