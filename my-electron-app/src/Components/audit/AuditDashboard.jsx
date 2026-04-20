import React, { useEffect, useState, useCallback } from 'react'
import { useAuditLogs } from '../../hooks/useAuditLogs'
import AuditLogModal from './AuditLogModal'
import Pagination from '../shared/Pagination'
import LoadingSpinner from '../shared/LoadingSpinner'

const ACTION_COLORS = {
  INSERT: { bg: 'var(--dash-green-light)', color: 'var(--dash-green)' },
  UPDATE: { bg: 'var(--dash-orange-light)', color: 'var(--dash-orange)' },
  DELETE: { bg: 'var(--dash-red-light)', color: 'var(--dash-red)' },
}

const TABLE_OPTIONS = ['students', 'sanad_records', 'rooms']
const ACTION_OPTIONS = ['INSERT', 'UPDATE', 'DELETE']

const inputStyle = {
  padding: '8px 10px', border: '1px solid var(--dash-border)',
  borderRadius: 'var(--dash-radius-sm)', background: 'var(--dash-surface-2)',
  color: 'var(--dash-text-bright)', fontSize: '13px', fontFamily: 'inherit', width: '100%',
}

export default function AuditDashboard() {
  const { logs, total, loading, error, fetchLogs, PAGE_SIZE } = useAuditLogs()

  const [page, setPage] = useState(1)
  const [filterUser, setFilterUser] = useState('')
  const [filterTable, setFilterTable] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterRecordId, setFilterRecordId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedLog, setSelectedLog] = useState(null)

  const load = useCallback(() => {
    fetchLogs({ page, filterUser, filterTable, filterAction, filterRecordId, dateFrom, dateTo })
  }, [page, filterUser, filterTable, filterAction, filterRecordId, dateFrom, dateTo, fetchLogs])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }

  const clearFilters = () => {
    setFilterUser(''); setFilterTable(''); setFilterAction('')
    setFilterRecordId(''); setDateFrom(''); setDateTo('')
    setPage(1)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasFilters = filterUser || filterTable || filterAction || filterRecordId || dateFrom || dateTo

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">🔍 Audit Log</h2>
          <p className="dash-page-subtitle">
            {total.toLocaleString()} total entries — full change history
          </p>
        </div>
        <button className="dash-refresh-btn" onClick={load}>
          <span className="refresh-icon">🔄</span> Refresh
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="filter-bar" style={{ marginBottom: '18px' }}>
        <div className="filter-field">
          <span>Table</span>
          <select value={filterTable} onChange={handleFilterChange(setFilterTable)} style={inputStyle}>
            <option value="">All Tables</option>
            {TABLE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-field">
          <span>Action</span>
          <select value={filterAction} onChange={handleFilterChange(setFilterAction)} style={inputStyle}>
            <option value="">All Actions</option>
            {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="filter-field">
          <span>Record ID</span>
          <input
            type="text"
            value={filterRecordId}
            onChange={handleFilterChange(setFilterRecordId)}
            placeholder="Search record ID…"
            style={inputStyle}
          />
        </div>
        <div className="filter-field">
          <span>From Date</span>
          <input type="date" value={dateFrom} onChange={handleFilterChange(setDateFrom)} style={inputStyle} />
        </div>
        <div className="filter-field">
          <span>To Date</span>
          <input type="date" value={dateTo} onChange={handleFilterChange(setDateTo)} style={inputStyle} />
        </div>
        {hasFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>✕ Clear</button>
        )}
      </div>

      {error && <div className="dash-alert dash-alert-error">{error}</div>}

      <div className="dash-card">
        {loading ? (
          <LoadingSpinner message="Loading audit logs…" />
        ) : logs.length === 0 ? (
          <p className="dash-empty">No audit logs found.</p>
        ) : (
          <>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>Table</th>
                    <th>Action</th>
                    <th>Record ID</th>
                    <th>Changed By</th>
                    <th>Fields Changed</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const actionStyle = ACTION_COLORS[log.action] || {}
                    const changedCount = log.action === 'UPDATE' && log.old_data && log.new_data
                      ? Object.keys({ ...log.old_data, ...log.new_data })
                          .filter(k => JSON.stringify(log.old_data[k]) !== JSON.stringify(log.new_data[k])).length
                      : null

                    return (
                      <tr key={log.id} className="clickable-row" onClick={() => setSelectedLog(log)}>
                        <td className="mono" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {new Date(log.changed_at).toLocaleString()}
                        </td>
                        <td>
                          <span style={{
                            fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                            background: 'var(--dash-accent-light)', color: 'var(--dash-accent)',
                          }}>
                            {log.table_name}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                            background: actionStyle.bg, color: actionStyle.color,
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td className="mono" style={{ fontSize: '12px' }}>{log.record_id || '—'}</td>
                        <td className="mono" style={{ fontSize: '11px', color: 'var(--dash-text)' }}>
                          {log.changed_by ? log.changed_by.slice(0, 8) + '…' : '—'}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--dash-text)' }}>
                          {changedCount !== null
                            ? <span style={{ color: 'var(--dash-orange)', fontWeight: 600 }}>{changedCount} field{changedCount !== 1 ? 's' : ''}</span>
                            : '—'
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {selectedLog && (
        <AuditLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  )
}
