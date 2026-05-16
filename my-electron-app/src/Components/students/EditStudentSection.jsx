import React, { useState, useEffect, useRef } from 'react'
import StudentFormFields from './StudentFormFields'
import { printStudentForm } from './StudentFormPrint'
import { useLabels } from '../../hooks/useUiLabels'

export default function EditStudentSection({ student, editForm, onChange, onFileChange, onSubmit, onCancel, rooms = [], isOnline = true }) {
  const formRef = useRef(null)
  const { t } = useLabels()
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        if (isOnline && formRef.current) formRef.current.requestSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOnline])

  const handlePrint = async () => {
    setPrinting(true)
    try { await printStudentForm(editForm) } finally { setPrinting(false) }
  }

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">{t('edit.title')}</h2>
          <p className="dash-page-subtitle">ID: {student.id} — {student.name}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--dash-text)', background: 'var(--dash-surface-2)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--dash-border)' }}>
            <kbd style={{ fontFamily: 'monospace' }}>Ctrl+S</kbd> Save
          </span>
          <button className="sidebar-btn" onClick={onCancel} style={{ padding: '8px 18px' }}>{t('edit.cancel')}</button>
        </div>
      </div>

      {!isOnline ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔴</div>
          <h3 style={{ color: 'var(--dash-text-bright)', margin: '0 0 8px' }}>{t('edit.offline')}</h3>
          <p style={{ color: 'var(--dash-text)', fontSize: '14px', margin: 0 }}>{t('edit.offlineMsg')}</p>
          <button className="sidebar-btn" style={{ marginTop: '20px' }} onClick={onCancel}>← Go Back</button>
        </div>
      ) : (
        <div className="dash-card">
          <form ref={formRef} onSubmit={onSubmit}>
            <StudentFormFields formState={editForm} onChange={onChange} onFileChange={onFileChange} rooms={rooms} cnicRequired={false} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="submit" className="dash-submit-btn">{t('edit.save')}</button>
              <button type="button" className="pdf-btn" onClick={handlePrint} disabled={printing}>
                {printing ? <><span className="spinner-sm" /> Generating…</> : t('add.print')}
              </button>
              <button type="button" className="sidebar-btn" onClick={onCancel}>Cancel</button>
              <span style={{ fontSize: '12px', color: 'var(--dash-text)' }}>or Ctrl+S</span>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
