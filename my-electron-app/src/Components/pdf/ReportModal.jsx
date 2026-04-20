import React, { useState, useEffect, useRef } from 'react'
import { REPORT_FIELDS, STUDENT_TYPES } from '../../constants/student'
import { supabase } from '../../Auth/SupabaseClient'

const MAX_FIELDS = 8

const filterLabelStyle = {
  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.4px', color: 'var(--dash-text)', marginBottom: '5px', display: 'block',
}

const filterSelectStyle = {
  padding: '8px 10px', border: '1px solid var(--dash-border)',
  borderRadius: 'var(--dash-radius-sm)', background: 'var(--dash-surface-2)',
  color: 'var(--dash-text-bright)', fontSize: '13px', fontFamily: 'inherit',
  width: '100%', cursor: 'pointer',
}

function PreviewAvatar({ student }) {
  const [lightbox, setLightbox] = useState(false)

  if (!student?.student_image) {
    return (
      <div className="student-avatar" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
        {(student?.name || '?')[0].toUpperCase()}
      </div>
    )
  }

  const { data } = supabase.storage.from('Darul-Uloom-Students').getPublicUrl(student.student_image)
  const url = data?.publicUrl

  return (
    <>
      <div
        className="student-avatar"
        style={{ width: '32px', height: '32px', cursor: 'zoom-in', flexShrink: 0 }}
        onClick={e => { e.stopPropagation(); setLightbox(true) }}
        title="Click to enlarge"
      >
        <img src={url} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
      </div>
      {lightbox && (
        <div
          onClick={e => { e.stopPropagation(); setLightbox(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out' }}
        >
          <div style={{ textAlign: 'center' }}>
            <img src={url} alt={student.name} style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: '12px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }} />
            <p style={{ color: '#fff', marginTop: '10px', fontSize: '14px', fontWeight: 600 }}>{student.name}</p>
          </div>
        </div>
      )}
    </>
  )
}

export default function ReportModal({
  selectedFields, onToggleField,
  onGenerate, onDownload, onClose, loading,
  previewRecords, previewSubtitle, onClearPreview,
  rooms = [],
  districtOptions = [], yearOptions = [],
}) {
  const [filterType, setFilterType] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterRoom, setFilterRoom] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')

  const hasFilter = filterType || filterDistrict || filterYear || filterRoom || filterStatus
  const canGenerate = hasFilter && selectedFields.length > 0 && !loading
  const reportFilters = { filterType, filterDistrict, filterYear, filterRoom, filterStatus }

  // Auto-refresh preview when filters or fields change while preview is showing
  const autoRefreshTimer = useRef(null)
  const prevFiltersRef = useRef(null)

  useEffect(() => {
    if (!previewRecords) return // only auto-refresh if preview is already open
    const key = JSON.stringify({ ...reportFilters, selectedFields })
    if (prevFiltersRef.current === key) return
    prevFiltersRef.current = key

    clearTimeout(autoRefreshTimer.current)
    autoRefreshTimer.current = setTimeout(() => {
      if (canGenerate) onGenerate(reportFilters)
    }, 600)

    return () => clearTimeout(autoRefreshTimer.current)
  }, [filterType, filterDistrict, filterYear, filterRoom, filterStatus, selectedFields])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: previewRecords ? '960px' : '580px', width: '94vw', maxHeight: '92vh' }}
      >
        <div className="modal-header">
          <h2 className="modal-title">📄 Generate PDF Report</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* ── Filters ── */}
          <div style={{ background: 'var(--dash-surface-2)', border: '1px solid var(--dash-border)', borderRadius: 'var(--dash-radius-sm)', padding: '14px', marginBottom: '16px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-bright)' }}>
              🔧 Filters
              <span style={{ fontWeight: 400, color: 'var(--dash-text)', marginLeft: '6px' }}>— at least one required</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div>
                <span style={filterLabelStyle}>Student Type</span>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} style={filterSelectStyle}>
                  <option value="">All Types</option>
                  {STUDENT_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <span style={filterLabelStyle}>District</span>
                <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} style={filterSelectStyle}>
                  <option value="">All Districts</option>
                  {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <span style={filterLabelStyle}>Entry Year</span>
                <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={filterSelectStyle}>
                  <option value="">All Years</option>
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <span style={filterLabelStyle}>Room No.</span>
                <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)} style={filterSelectStyle}>
                  <option value="">All Rooms</option>
                  {rooms.map(r => <option key={r.id} value={r.room_number}>Room {r.room_number}</option>)}
                </select>
              </div>
              <div>
                <span style={filterLabelStyle}>Status</span>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={filterSelectStyle}>
                  <option value="">All</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>
              </div>
            </div>
            {!hasFilter && (
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--dash-red)' }}>
                ⚠ Select at least one filter.
              </p>
            )}
          </div>

          {/* ── Field selector ── */}
          <p style={{ fontSize: '13px', color: 'var(--dash-text)', margin: '0 0 8px' }}>
            Columns to include&nbsp;
            <span style={{ color: 'var(--dash-accent)', fontWeight: 600 }}>({selectedFields.length}/{MAX_FIELDS})</span>
            {selectedFields.includes('student_image') && (
              <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--dash-orange)' }}>
                ⚠ Photo column makes PDF larger and slower to generate
              </span>
            )}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '16px' }}>
            {Object.entries(REPORT_FIELDS).map(([key, label]) => {
              const checked = selectedFields.includes(key)
              const disabled = !checked && selectedFields.length >= MAX_FIELDS
              return (
                <label key={key} style={{
                  display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 10px',
                  borderRadius: '7px', border: `1px solid ${checked ? 'var(--dash-accent)' : 'var(--dash-border)'}`,
                  background: checked ? 'var(--dash-accent-light)' : 'var(--dash-surface-2)',
                  cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
                  fontSize: '12px', color: checked ? 'var(--dash-accent)' : 'var(--dash-text-bright)',
                  fontWeight: checked ? 600 : 400,
                }}>
                  <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onToggleField(key)}
                    style={{ accentColor: 'var(--dash-accent)', flexShrink: 0 }} />
                  {label}
                </label>
              )
            })}
          </div>

          {/* ── Preview / Actions ── */}
          {previewRecords ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-bright)' }}>
                    👁 Preview — {previewRecords.length.toLocaleString()} students
                  </span>
                  {loading && <span style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--dash-text)' }}>🔄 Refreshing…</span>}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--dash-text)' }}>{previewSubtitle}</p>
              </div>

              {/* Preview table — same style as All Students */}
              <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid var(--dash-border)', borderRadius: 'var(--dash-radius-sm)', marginBottom: '12px' }}>
                <table className="dash-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 10px', background: 'var(--dash-surface-2)', fontSize: '11px' }}>#</th>
                      {selectedFields.map(f => (
                        <th key={f} style={{ padding: '8px 10px', background: 'var(--dash-surface-2)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                          {REPORT_FIELDS[f]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRecords.slice(0, 50).map((s, i) => (
                      <tr key={s.id} style={{ background: i % 2 === 0 ? 'var(--dash-surface)' : 'var(--dash-surface-2)' }}>
                        <td style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--dash-text)' }}>{i + 1}</td>
                        {selectedFields.map(f => (
                          <td key={f} style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--dash-text-bright)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {f === 'student_image'
                              ? <PreviewAvatar student={s} />
                              : f === 'name'
                                ? (
                                  <div className="student-name-cell">
                                    <PreviewAvatar student={s} />
                                    <span>{s.name || '—'}</span>
                                  </div>
                                )
                              : (s[f] || '—')
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewRecords.length > 50 && (
                  <p style={{ textAlign: 'center', padding: '8px', fontSize: '11px', color: 'var(--dash-text)', margin: 0 }}>
                    Showing first 50 of {previewRecords.length.toLocaleString()} — all rows in PDF
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="sidebar-btn" onClick={onClearPreview}>← Back</button>
                <button className="pdf-btn" onClick={onDownload} disabled={loading}>
                  {loading ? <><span className="spinner-sm" /> Generating…</> : '📥 Download PDF'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="sidebar-btn" onClick={onClose}>Cancel</button>
              <button className="pdf-btn" onClick={() => onGenerate(reportFilters)} disabled={!canGenerate}>
                {loading ? <><span className="spinner-sm" /> Loading…</> : '👁 Preview Report'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
