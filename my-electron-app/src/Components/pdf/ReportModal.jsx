import React from 'react'
import { REPORT_FIELDS } from '../../constants/student'

const MAX_FIELDS = 6

export default function ReportModal({ selectedFields, onToggleField, onGenerate, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">📄 Generate PDF Report</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--dash-text)', marginBottom: '16px' }}>
            Select up to {MAX_FIELDS} fields to include in the report.
            ({selectedFields.length}/{MAX_FIELDS} selected)
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
            {Object.entries(REPORT_FIELDS).map(([key, label]) => {
              const checked = selectedFields.includes(key)
              const disabled = !checked && selectedFields.length >= MAX_FIELDS
              return (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${checked ? 'var(--dash-accent)' : 'var(--dash-border)'}`,
                    background: checked ? 'var(--dash-accent-light)' : 'var(--dash-surface-2)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    fontSize: '13px',
                    color: checked ? 'var(--dash-accent)' : 'var(--dash-text-bright)',
                    fontWeight: checked ? 600 : 400,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onToggleField(key)}
                    style={{ accentColor: 'var(--dash-accent)' }}
                  />
                  {label}
                </label>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="sidebar-btn" onClick={onClose}>Cancel</button>
            <button
              className="pdf-btn"
              onClick={onGenerate}
              disabled={loading || selectedFields.length === 0}
            >
              {loading
                ? <><span className="spinner-sm" /> Generating…</>
                : '📥 Download PDF'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
