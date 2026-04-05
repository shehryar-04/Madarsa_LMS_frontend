import React from 'react'
import StudentFormFields from './StudentFormFields'

export default function AddStudentSection({ form, onChange, onFileChange, onSubmit }) {
  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">Add New Student</h2>
          <p className="dash-page-subtitle">Fill in the details below to register a student</p>
        </div>
      </div>

      <div className="dash-card">
        <form onSubmit={onSubmit}>
          <StudentFormFields formState={form} onChange={onChange} onFileChange={onFileChange} />
          <div style={{ marginTop: '24px' }}>
            <button type="submit" className="dash-submit-btn">➕ Add Student</button>
          </div>
        </form>
      </div>
    </div>
  )
}
