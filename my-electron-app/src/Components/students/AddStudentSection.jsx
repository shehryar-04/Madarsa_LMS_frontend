import React, { useState, useEffect } from 'react'
import StudentFormFields from './StudentFormFields'
import { printStudentForm } from './StudentFormPrint'
import { useRooms } from '../../hooks/useRooms'
import { useLabels } from '../../hooks/useUiLabels'

export default function AddStudentSection({ form, onChange, onFileChange, onSubmit, isOnline = true }) {
  const [printing, setPrinting] = useState(false)
  const { rooms, fetchRooms } = useRooms()
  const { t } = useLabels()

  useEffect(() => { fetchRooms() }, [fetchRooms])

  const canPrint = Boolean(form.name && form.cnic && form.district)

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
            <h2 className="dash-page-title">{t('add.title')}</h2>
            <p className="dash-page-subtitle">{t('add.subtitle')}</p>
          </div>
        </div>
        <div className="dash-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔴</div>
          <h3 style={{ color: 'var(--dash-text-bright)', margin: '0 0 8px' }}>{t('add.offline')}</h3>
          <p style={{ color: 'var(--dash-text)', fontSize: '14px', margin: 0 }}>{t('add.offlineMsg')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">{t('add.title')}</h2>
          <p className="dash-page-subtitle">{t('add.subtitle')}</p>
        </div>
      </div>
      <div className="dash-card">
        <form onSubmit={onSubmit}>
          <StudentFormFields formState={form} onChange={onChange} onFileChange={onFileChange} rooms={rooms} />
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="submit" className="dash-submit-btn">{t('add.save')}</button>
            <button type="button" className="pdf-btn" onClick={handlePrint} disabled={!canPrint || printing}>
              {printing ? <><span className="spinner-sm" /> Generating…</> : t('add.print')}
            </button>
            {!canPrint && <span style={{ fontSize: '12px', color: 'var(--dash-text)' }}>{t('add.printHint')}</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
