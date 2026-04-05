import React from 'react'
import { SANAD_LEVELS } from '../../constants/sanad'

export default function SanadFormFields({ formState, onChange }) {
  return (
    <>
      <div className="form-section">
        <h4 className="form-section-title">📋 Basic Details</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Serial No.</span>
            <input name="serial_no" value={formState.serial_no || ''} onChange={onChange} placeholder="e.g. 101" />
          </label>
          <label className="form-label">
            <span>Entry Date</span>
            <input type="text" name="entry_date" value={formState.entry_date || ''} onChange={onChange} placeholder="Date" />
          </label>
          <label className="form-label">
            <span>Name w/ Father *</span>
            <input name="name_with_father" value={formState.name_with_father || ''} onChange={onChange} required placeholder="Full Name s/o Father" dir="auto" />
          </label>
          <label className="form-label">
            <span>District</span>
            <input name="district" value={formState.district || ''} onChange={onChange} placeholder="District" dir="auto" />
          </label>
          <label className="form-label">
            <span>Related Student ID</span>
            <input type="number" name="student_id" value={formState.student_id || ''} onChange={onChange} placeholder="Optional" />
          </label>
          <label className="form-label">
            <span>Source Row</span>
            <input type="number" name="source_row" value={formState.source_row || ''} onChange={onChange} placeholder="Row #" />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h4 className="form-section-title">🎓 Sanad Levels Progress</h4>
        <div className="form-grid">
          {SANAD_LEVELS.map(level => (
            <label key={level.name} className="form-label">
              <span>{level.label}</span>
              <input name={level.name} value={formState[level.name] || ''} onChange={onChange} placeholder="Status / Grade" dir="auto" />
            </label>
          ))}
        </div>
      </div>
    </>
  )
}
