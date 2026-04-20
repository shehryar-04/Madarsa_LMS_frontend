import React, { useState, useEffect, useRef } from 'react'
import SearchBar from '../shared/SearchBar'
import StudentTable from './StudentTable'
import Pagination from '../shared/Pagination'
import LoadingSpinner from '../shared/LoadingSpinner'
import { PAGE_SIZE, REPORT_FIELDS, STUDENT_TYPES } from '../../constants/student'
import { useClasses } from '../../hooks/useClasses'

const MAX_FIELDS = 8

const selStyle = {
  padding: '7px 10px', border: '1px solid var(--dash-border)',
  borderRadius: 'var(--dash-radius-sm)', background: 'var(--dash-surface-2)',
  color: 'var(--dash-text-bright)', fontSize: '12px', fontFamily: 'inherit',
  width: '100%', cursor: 'pointer',
}

export default function AllStudentsSection({
  students, totalStudents, loading,
  searchQuery, onSearchChange,
  showInactive, onToggleInactive,
  filterClass, filterRoom, onClearQuickFilter,
  currentPage, onPageChange,
  onStudentClick,
  // report props
  selectedFields, onToggleField,
  onOpenPreview, onDownloadPDF,
  pdfLoading,
  rooms = [], districtOptions = [], yearOptions = [],
}) {
  const totalPages = Math.ceil(totalStudents / PAGE_SIZE)
  const startRow = (currentPage - 1) * PAGE_SIZE + 1
  const endRow = Math.min(currentPage * PAGE_SIZE, totalStudents)
  const paginationInfo = totalStudents > 0
    ? `Showing ${startRow}–${endRow} of ${totalStudents.toLocaleString()} students`
    : 'No students found'

  const activeQuickFilter = filterClass ? `Class: ${filterClass}` : filterRoom ? `Room: ${filterRoom}` : null

  // ── Ctrl+F → focus search bar ──
  const searchInputRef = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Report panel state ──
  const [showReportPanel, setShowReportPanel] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterRoomReport, setFilterRoomReport] = useState('')
  const [filterClassReport, setFilterClassReport] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')

  const { classNames } = useClasses()

  const reportFilters = { filterType, filterDistrict, filterYear, filterRoom: filterRoomReport, filterClass: filterClassReport, filterStatus }
  const hasFilter = filterType || filterDistrict || filterYear || filterRoomReport || filterClassReport || filterStatus
  const canPreview = hasFilter && selectedFields.length > 0 && !pdfLoading

  // Listen for DOWNLOAD_PDF message posted by the preview window
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'DOWNLOAD_PDF') onDownloadPDF()
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onDownloadPDF])

  // Press Enter in search → open first matching student's modal
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && students.length > 0) {
      onStudentClick(students[0])
    }
  }

  return (
    <div className="dash-content">
      {/* ── Header ── */}
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">All Students</h2>
          <p className="dash-page-subtitle">{paginationInfo}</p>
        </div>
        <div className="dash-header-actions">
          <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Search… Enter to open (Ctrl+F)" inputRef={searchInputRef} onKeyDown={handleSearchKeyDown} />
          <label style={{
            display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', color: showInactive ? 'var(--dash-red)' : 'var(--dash-text)',
            padding: '7px 12px', border: `1px solid ${showInactive ? 'var(--dash-red)' : 'var(--dash-border)'}`,
            borderRadius: 'var(--dash-radius-sm)', background: showInactive ? 'var(--dash-red-light)' : 'transparent', whiteSpace: 'nowrap',
          }}>
            <input type="checkbox" checked={showInactive} onChange={onToggleInactive}
              style={{ accentColor: 'var(--dash-red)', width: '14px', height: '14px' }} />
            Show Inactive
          </label>
          <button
            className={`filter-toggle-btn ${showReportPanel ? 'active' : ''}`}
            onClick={() => setShowReportPanel(v => !v)}
          >
            📄 {showReportPanel ? 'Close Report' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* ── Quick filter tag ── */}
      {activeQuickFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px',
            borderRadius: '20px', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)',
            fontSize: '13px', fontWeight: 600, border: '1px solid var(--dash-accent)',
          }}>
            🔍 {activeQuickFilter}
            <button onClick={onClearQuickFilter}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dash-accent)', fontSize: '14px', padding: 0, lineHeight: 1 }}>
              ✕
            </button>
          </span>
        </div>
      )}

      {/* ── Report Config Panel ── */}
      {showReportPanel && (
        <div className="dash-card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 className="dash-card-title" style={{ margin: 0 }}>📄 Report Configuration</h3>
            <button className="sidebar-btn" style={{ fontSize: '12px', padding: '4px 10px' }}
              onClick={() => setShowReportPanel(false)}>✕ Close</button>
          </div>

          {/* Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Student Type', value: filterType, set: setFilterType,
                options: STUDENT_TYPES.map(t => ({ value: t, label: t.toUpperCase() })) },
              { label: 'Class', value: filterClassReport, set: setFilterClassReport,
                options: classNames.map(c => ({ value: c, label: c })) },
              { label: 'District', value: filterDistrict, set: setFilterDistrict,
                options: districtOptions.map(d => ({ value: d, label: d })) },
              { label: 'Entry Year', value: filterYear, set: setFilterYear,
                options: yearOptions.map(y => ({ value: y, label: y })) },
              { label: 'Room No.', value: filterRoomReport, set: setFilterRoomReport,
                options: rooms.map(r => ({ value: r.room_number, label: `Room ${r.room_number}` })) },
              { label: 'Status', value: filterStatus, set: setFilterStatus,
                options: [{ value: 'active', label: 'Active only' }, { value: 'inactive', label: 'Inactive only' }] },
            ].map(({ label, value, set, options }) => (
              <div key={label}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text)', display: 'block', marginBottom: '4px' }}>{label}</span>
                <select value={value} onChange={e => set(e.target.value)} style={selStyle}>
                  <option value="">All</option>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Column selector */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--dash-text)', margin: '0 0 8px' }}>
              Columns&nbsp;
              <span style={{ color: 'var(--dash-accent)', fontWeight: 600 }}>({selectedFields.length}/{MAX_FIELDS})</span>
              {selectedFields.includes('student_image') && (
                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--dash-orange)' }}>⚠ Photos make PDF slower</span>
              )}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '5px' }}>
              {Object.entries(REPORT_FIELDS).map(([key, label]) => {
                const checked = selectedFields.includes(key)
                const disabled = !checked && selectedFields.length >= MAX_FIELDS
                return (
                  <label key={key} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 9px',
                    borderRadius: '6px', border: `1px solid ${checked ? 'var(--dash-accent)' : 'var(--dash-border)'}`,
                    background: checked ? 'var(--dash-accent-light)' : 'var(--dash-surface-2)',
                    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
                    fontSize: '11px', color: checked ? 'var(--dash-accent)' : 'var(--dash-text-bright)', fontWeight: checked ? 600 : 400,
                  }}>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onToggleField(key)}
                      style={{ accentColor: 'var(--dash-accent)', flexShrink: 0 }} />
                    {label}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="pdf-btn" onClick={() => onOpenPreview(reportFilters)} disabled={!canPreview}>
              {pdfLoading
                ? <><span className="spinner-sm" /> Loading…</>
                : '👁 Preview Report'
              }
            </button>
            {!hasFilter && (
              <span style={{ fontSize: '12px', color: 'var(--dash-red)' }}>⚠ Select at least one filter</span>
            )}
          </div>
        </div>
      )}

      {/* ── Student table ── */}
      <div className="dash-card">
        {loading ? (
          <LoadingSpinner message="Loading students…" />
        ) : students.length === 0 ? (
          <p className="dash-empty">No students match your search.</p>
        ) : (
          <>
            <StudentTable students={students} onRowClick={onStudentClick} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          </>
        )}
      </div>
    </div>
  )
}
