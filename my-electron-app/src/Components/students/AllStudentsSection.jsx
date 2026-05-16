import React, { useState, useEffect, useRef } from 'react'
import SearchBar from '../shared/SearchBar'
import StudentTable from './StudentTable'
import Pagination from '../shared/Pagination'
import LoadingSpinner from '../shared/LoadingSpinner'
import { PAGE_SIZE, STUDENT_TYPES } from '../../constants/student'
import { useClasses } from '../../hooks/useClasses'
import { useLabels } from '../../hooks/useUiLabels'

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
  selectedFields, onToggleField,
  onOpenPreview, onDownloadPDF,
  pdfLoading,
  rooms = [], districtOptions = [], yearOptions = [],
}) {
  const { t, tJSON, reportFields } = useLabels()
  const REPORT_FIELDS = reportFields()
  const studentTypes = tJSON('opt.studentTypes') || STUDENT_TYPES

  const totalPages = Math.ceil(totalStudents / PAGE_SIZE)
  const startRow = (currentPage - 1) * PAGE_SIZE + 1
  const endRow = Math.min(currentPage * PAGE_SIZE, totalStudents)
  const paginationInfo = totalStudents > 0
    ? `Showing ${startRow}–${endRow} of ${totalStudents.toLocaleString()} students`
    : t('all.noStudents')

  const activeQuickFilter = filterClass ? `Class: ${filterClass}` : filterRoom ? `Room: ${filterRoom}` : null

  const searchInputRef = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'f') { e.preventDefault(); searchInputRef.current?.focus(); searchInputRef.current?.select() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const [showReportPanel, setShowReportPanel] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterRoomReport, setFilterRoomReport] = useState('')
  const [filterClassReport, setFilterClassReport] = useState('')
  const [filterStatus, setFilterStatus] = useState('current')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const { classNames } = useClasses()

  const reportFiltersObj = { filterType, filterDistrict, filterYear, filterRoom: filterRoomReport, filterClass: filterClassReport, filterStatus, filterDateFrom, filterDateTo }
  const hasFilter = filterType || filterDistrict || filterYear || filterRoomReport || filterClassReport || filterStatus || filterDateFrom || filterDateTo
  const canPreview = hasFilter && selectedFields.length > 0 && !pdfLoading

  useEffect(() => {
    const handler = (e) => { if (e.data?.type === 'DOWNLOAD_PDF') onDownloadPDF() }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onDownloadPDF])

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && students.length > 0) onStudentClick(students[0])
  }

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">{t('all.title')}</h2>
          <p className="dash-page-subtitle">{paginationInfo}</p>
        </div>
        <div className="dash-header-actions">
          <SearchBar value={searchQuery} onChange={onSearchChange} placeholder={t('all.searchPlaceholder')} inputRef={searchInputRef} onKeyDown={handleSearchKeyDown} />
          <label style={{
            display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', color: showInactive ? 'var(--dash-red)' : 'var(--dash-text)',
            padding: '7px 12px', border: `1px solid ${showInactive ? 'var(--dash-red)' : 'var(--dash-border)'}`,
            borderRadius: 'var(--dash-radius-sm)', background: showInactive ? 'var(--dash-red-light)' : 'transparent', whiteSpace: 'nowrap',
          }}>
            <input type="checkbox" checked={showInactive} onChange={onToggleInactive}
              style={{ accentColor: 'var(--dash-red)', width: '14px', height: '14px' }} />
            {t('all.showInactive')}
          </label>
          <button className={`filter-toggle-btn ${showReportPanel ? 'active' : ''}`} onClick={() => setShowReportPanel(v => !v)}>
            {showReportPanel ? t('all.closeReport') : t('all.exportReport')}
          </button>
        </div>
      </div>

      {activeQuickFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px',
            borderRadius: '20px', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)',
            fontSize: '13px', fontWeight: 600, border: '1px solid var(--dash-accent)',
          }}>
            🔍 {activeQuickFilter}
            <button onClick={onClearQuickFilter} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dash-accent)', fontSize: '14px', padding: 0, lineHeight: 1 }}>✕</button>
          </span>
        </div>
      )}

      {showReportPanel && (
        <div className="dash-card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 className="dash-card-title" style={{ margin: 0 }}>{t('report.title')}</h3>
            <button className="sidebar-btn" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={() => setShowReportPanel(false)}>✕ Close</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: t('report.studentType'), value: filterType, set: setFilterType,
                options: studentTypes.map(tp => ({ value: tp, label: tp.toUpperCase() })) },
              { label: t('report.class'), value: filterClassReport, set: setFilterClassReport,
                options: classNames.map(c => ({ value: c, label: c })) },
              { label: t('report.district'), value: filterDistrict, set: setFilterDistrict,
                options: districtOptions.map(d => ({ value: d, label: d })) },
              { label: t('report.entryYear'), value: filterYear, set: setFilterYear,
                options: yearOptions.map(y => ({ value: y, label: y })) },
              { label: t('report.roomNo'), value: filterRoomReport, set: setFilterRoomReport,
                options: rooms.map(r => ({ value: r.room_number, label: `Room ${r.room_number}` })) },
              { label: t('report.status'), value: filterStatus, set: setFilterStatus,
                options: [{ value: 'current', label: t('report.activeOnly') }, { value: 'rusticated', label: t('report.inactiveOnly') }, { value: 'passed', label: t('report.passedOnly') }] },
            ].map(({ label, value, set, options }) => (
              <div key={label}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text)', display: 'block', marginBottom: '4px' }}>{label}</span>
                <select value={value} onChange={e => set(e.target.value)} style={selStyle}>
                  <option value="">{t('report.all')}</option>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
            {/* Date range filter */}
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text)', display: 'block', marginBottom: '4px' }}>From Date</span>
              <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={{ ...selStyle, cursor: 'text' }} />
            </div>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text)', display: 'block', marginBottom: '4px' }}>To Date</span>
              <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={{ ...selStyle, cursor: 'text' }} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--dash-text)', margin: '0 0 8px' }}>
              {t('report.columns')}&nbsp;
              <span style={{ color: 'var(--dash-accent)', fontWeight: 600 }}>({selectedFields.length}/{MAX_FIELDS})</span>
              {selectedFields.includes('student_image') && (
                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--dash-orange)' }}>{t('report.photoWarning')}</span>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="pdf-btn" onClick={() => onOpenPreview(reportFiltersObj)} disabled={!canPreview}>
              {pdfLoading ? <><span className="spinner-sm" /> Loading…</> : t('report.preview')}
            </button>
            {!hasFilter && <span style={{ fontSize: '12px', color: 'var(--dash-red)' }}>{t('report.filterRequired')}</span>}
          </div>
        </div>
      )}

      <div className="dash-card">
        {loading ? (
          <LoadingSpinner message="Loading students…" />
        ) : students.length === 0 ? (
          <p className="dash-empty">{t('all.noMatch')}</p>
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
