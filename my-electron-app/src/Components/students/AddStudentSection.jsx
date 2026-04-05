import React, { useState, useEffect } from 'react'
import StudentFormFields from './StudentFormFields'
import { printStudentForm } from './StudentFormPrint'
import { useRooms } from '../../hooks/useRooms'

export default function AddStudentSection({ form, onChange, onFileChange, onSubmit }) {
  const [printing, setPrinting] = useState(false)
  const { rooms, fetchRooms } = useRooms()

  useEffect(() => { fetchRooms() }, [fetchRooms])

  const canPrint = Boolean(form.name && form.cnic && form.district)

  const handlePrint = async () => {
    setPrinting(true)
    try {
      await printStudentForm(form)
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">Add New Student</h2>
          <p className="dash-page-subtitle">Fill in the details below to register a student</p>
        </div>
        <button
          type="button"
          className="pdf-btn"
          onClick={handlePrint}
          disabled={!canPrint || printing}
          title={canPrint ? 'Print admission form as PDF' : 'Fill Name, CNIC and District first'}
        >
          {printing
            ? <><span className="spinner-sm" /> Generating…</>
            : '🖨️ Print Form'
          }
        </button>
      </div>

      <div className="dash-card">
        <form onSubmit={onSubmit}>
          <StudentFormFields
            formState={form}
            onChange={onChange}
            onFileChange={onFileChange}
            rooms={rooms}
          />
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button type="submit" className="dash-submit-btn">➕ Add Student</button>
            {!canPrint && (
              <span style={{ fontSize: '12px', color: 'var(--dash-text)' }}>
                Fill Name, CNIC & District to enable printing
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
