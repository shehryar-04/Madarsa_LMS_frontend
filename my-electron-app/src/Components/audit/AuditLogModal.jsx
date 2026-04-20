import React, { useState } from 'react'

const ACTION_COLORS = {
  INSERT: { bg: 'var(--dash-green-light)', color: 'var(--dash-green)' },
  UPDATE: { bg: 'var(--dash-orange-light)', color: 'var(--dash-orange)' },
  DELETE: { bg: 'var(--dash-red-light)', color: 'var(--dash-red)' },
}

/** Compute which keys changed between old and new */
function diffKeys(oldData, newData) {
  if (!oldData || !newData) return new Set()
  return new Set(
    Object.keys({ ...oldData, ...newData }).filter(k => {
      const o = JSON.stringify(oldData[k])
      const n = JSON.stringify(newData[k])
      return o !== n
    })
  )
}

function JsonView({ data, highlightKeys = new Set(), label }) {
  if (!data) return <p style={{ color: 'var(--dash-text)', fontSize: '13px', margin: 0 }}>—</p>

  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text)', marginBottom: '8px' }}>{label}</p>
      <div style={{
        background: 'var(--dash-surface-2)', borderRadius: '8px', padding: '12px',
        fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', maxHeight: '320px', overflowY: 'auto',
        border: '1px solid var(--dash-border)',
      }}>
        {Object.entries(data).map(([key, val]) => {
          const changed = highlightKeys.has(key)
          return (
            <div key={key} style={{
              display: 'flex', gap: '8px', padding: '3px 6px', borderRadius: '4px',
              background: changed ? 'rgba(253,203,110,0.12)' : 'transparent',
              borderLeft: changed ? '3px solid var(--dash-orange)' : '3px solid transparent',
              marginBottom: '2px',
            }}>
              <span style={{ color: 'var(--dash-accent)', minWidth: '140px', flexShrink: 0 }}>{key}:</span>
              <span style={{ color: changed ? 'var(--dash-orange)' : 'var(--dash-text-bright)', wordBreak: 'break-all' }}>
                {val === null ? <em style={{ color: 'var(--dash-text)' }}>null</em> : JSON.stringify(val)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AuditLogModal({ log, onClose }) {
  const changed = diffKeys(log.old_data, log.new_data)
  const actionStyle = ACTION_COLORS[log.action] || {}

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '860px', width: '94vw', maxHeight: '90vh' }}
      >
        <div className="modal-header">
          <div className="modal-header-info">
            <div>
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                Audit Log Detail
                <span style={{
                  fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '12px',
                  background: actionStyle.bg, color: actionStyle.color,
                }}>
                  {log.action}
                </span>
              </h2>
              <p className="modal-subtitle">
                {log.table_name} • Record {log.record_id} • {new Date(log.changed_at).toLocaleString()}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Table', value: log.table_name },
              { label: 'Action', value: log.action },
              { label: 'Record ID', value: log.record_id || '—' },
              { label: 'Changed By', value: log.changed_by || '—' },
              { label: 'Changed At', value: new Date(log.changed_at).toLocaleString() },
              { label: 'Fields Changed', value: changed.size > 0 ? `${changed.size} field${changed.size !== 1 ? 's' : ''}` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="modal-field">
                <span className="modal-field-label">{label}</span>
                <span className="modal-field-value mono">{value}</span>
              </div>
            ))}
          </div>

          {changed.size > 0 && (
            <div style={{
              background: 'var(--dash-orange-light)', border: '1px solid var(--dash-orange)',
              borderRadius: '8px', padding: '8px 12px', marginBottom: '16px', fontSize: '12px', color: 'var(--dash-orange)',
            }}>
              ✏️ Changed fields: {[...changed].join(', ')}
            </div>
          )}

          {/* Data diff */}
          <div style={{ display: 'grid', gridTemplateColumns: log.old_data && log.new_data ? '1fr 1fr' : '1fr', gap: '16px' }}>
            {log.old_data && <JsonView data={log.old_data} highlightKeys={changed} label="Before (Old Data)" />}
            {log.new_data && <JsonView data={log.new_data} highlightKeys={changed} label="After (New Data)" />}
          </div>
        </div>
      </div>
    </div>
  )
}
