import React, { useState, useEffect } from 'react'
import StudentFormFields from './StudentFormFields'
import { printStudentForm } from './StudentFormPrint'
import { useRooms } from '../../hooks/useRooms'

export default function AddStudentSection({ form, onChange, onFileChange, onSubmit, isOnline = true }) {
  const [printing, setPrinting] = useState(false)
  const { rooms, fetchRooms } = useRooms()

  useEffect(() => { fetchRooms() }, [fetchRooms])

  const canPrint = Boolean(form.name && form.cnic && form.district)

  // Print without saving — just generates the PDF from current form state
  const handlePrint = async (e) => {
    e.preventDefault()
    setPrinting(true)
    try { await printStudentForm(form) } finally { setPrinting(false) }
  }

  if (!isOnline) {
    return (
      <div className="dash-content">
        <div className="dash-header">
          <div>
            <h2 className="dash-page-title">Add New Student</h2>
            <p className="dash-page-subtitle">Fill in the details below to register a student</p>
          </div>
        </div>
        <div className="dash-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔴</div>
          <h3 style={{ color: 'var(--dash-text-bright)', margin: '0 0 8px' }}>You are offline</h3>
          <p style={{ color: 'var(--dash-text)', fontSize: '14px', margin: 0 }}>
            Adding students requires an internet connection. Please reconnect and try again.
          </p>
        </div>
      </div>
    )
  }

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
          <StudentFormFields
            formState={form}
            onChange={onChange}
            onFileChange={onFileChange}
            rooms={rooms}
          />
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Save — submits the form to the DB */}
            <button type="submit" className="dash-submit-btn">➕ Save Student</button>

            {/* Print — generates PDF from current form state, does NOT save */}
            <button
              type="button"
              className="pdf-btn"
              onClick={handlePrint}
              disabled={!canPrint || printing}
              title={canPrint ? 'Print admission form without saving' : 'Fill Name, CNIC and District first'}
            >
              {printing
                ? <><span className="spinner-sm" /> Generating…</>
                : '🖨️ Print Form'
              }
            </button>

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
