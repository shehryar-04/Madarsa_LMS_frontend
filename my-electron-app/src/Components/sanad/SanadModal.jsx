import React from 'react'
import { SANAD_LEVELS } from '../../constants/sanad'
import SanadFormFields from './SanadFormFields'

function ModalField({ label, value }) {
  return (
    <div className="modal-field">
      <span className="modal-field-label">{label}</span>
      <span className="modal-field-value">{value || '—'}</span>
    </div>
  )
}

function LevelBadge({ value }) {
  const active = Boolean(value)
  return (
    <span
      className="class-chip"
      style={{
        background: active ? 'var(--dash-accent)' : 'transparent',
        color: active ? '#fff' : 'inherit',
      }}
    >
      {value || '—'}
    </span>
  )
}

export default function SanadModal({ record, isAdmin, editForm, onClose, onEdit, onEditChange, onUpdate }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-avatar" style={{ background: 'oklch(0.65 0.1 270)' }}>
              {(record.name_with_father || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="modal-title">{record.name_with_father || 'Unknown'}</h2>
              <p className="modal-subtitle">Sanad Record • ID: {record.id}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isAdmin && !editForm && (
              <button
                className="sidebar-btn"
                style={{ padding: '6px 12px', background: 'var(--dash-bg)', color: 'var(--dash-accent)' }}
                onClick={() => onEdit({ ...record })}
              >
                ✏️ Edit
              </button>
            )}
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-body">
          {editForm ? (
            <form onSubmit={onUpdate}>
              <SanadFormFields formState={editForm} onChange={onEditChange} />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="sidebar-btn" onClick={() => onEdit(null)}>Cancel</button>
                <button type="submit" className="dash-submit-btn">💾 Save Changes</button>
              </div>
            </form>
          ) : (
            <>
              <div className="modal-section">
                <h4 className="form-section-title">📋 Basic Details</h4>
                <div className="modal-grid">
                  <ModalField label="Serial No." value={record.serial_no} />
                  <ModalField label="Entry Date" value={record.entry_date} />
                  <ModalField label="Related Student ID" value={record.student_id} />
                  <ModalField label="Source Row" value={record.source_row} />
                  <ModalField label="District" value={record.district} />
                </div>
              </div>

              <div className="modal-section">
                <h4 className="form-section-title">🎓 Sanad Levels</h4>
                <div className="modal-grid">
                  {SANAD_LEVELS.map(level => (
                    <div key={level.name} className="modal-field">
                      <span className="modal-field-label">{level.label}</span>
                      <LevelBadge value={record[level.name]} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
