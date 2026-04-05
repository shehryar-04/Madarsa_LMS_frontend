import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../Auth/SupabaseClient'
import { initialSanad, SANAD_LEVELS } from '../../constants/sanad'
import { PAGE_SIZE } from '../../constants/student'
import SanadFormFields from './SanadFormFields'
import SanadModal from './SanadModal'
import SearchBar from '../shared/SearchBar'
import Pagination from '../shared/Pagination'
import LoadingSpinner from '../shared/LoadingSpinner'
import Alert from '../shared/Alert'

function LevelBadge({ value }) {
  return (
    <span
      className="class-chip"
      style={{
        background: value ? 'var(--dash-accent)' : 'transparent',
        color: value ? '#fff' : 'inherit',
      }}
    >
      {value || '—'}
    </span>
  )
}

function preparePayload(form) {
  return {
    ...form,
    student_id: form.student_id ? Number(form.student_id) : null,
    source_row: form.source_row ? Number(form.source_row) : null,
  }
}

export default function SanadDashboard({ user }) {
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.role === 'admin'

  const [activeTab, setActiveTab] = useState('list')
  const [records, setRecords] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const searchTimer = useRef(null)

  const [form, setForm] = useState(initialSanad)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [editForm, setEditForm] = useState(null)

  const fetchPage = useCallback(async (page, searchStr) => {
    setLoading(true)
    setError('')

    const from = (page - 1) * PAGE_SIZE
    let query = supabase.from('sanad_records').select('*', { count: 'exact' })

    if (searchStr?.trim()) {
      const term = searchStr.trim()
      query = query.or(
        `name_with_father.ilike.%${term}%,district.ilike.%${term}%,serial_no.ilike.%${term}%`
      )
    }

    const { data, count, error: fetchErr } = await query
      .order('id', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (fetchErr) {
      setError(fetchErr.message)
    } else {
      setRecords(data || [])
      setTotalRecords(count || 0)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'list') fetchPage(currentPage, appliedSearch)
  }, [activeTab, currentPage, appliedSearch, fetchPage])

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1)
      setAppliedSearch(value)
    }, 400)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name_with_father) {
      setError('Name is required')
      return
    }

    const { error: insertErr } = await supabase.from('sanad_records').insert([preparePayload(form)])
    if (insertErr) {
      setError(insertErr.message)
      return
    }

    setSuccess('Sanad record added successfully')
    setForm(initialSanad)
    setActiveTab('list')
    setCurrentPage(1)
    fetchPage(1, appliedSearch)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!editForm.name_with_father) {
      setError('Name is required')
      return
    }

    const payload = preparePayload(editForm)
    const { error: updateErr } = await supabase.from('sanad_records').update(payload).eq('id', payload.id)
    if (updateErr) {
      setError(updateErr.message)
      return
    }

    setSuccess('Sanad record updated successfully')
    setEditForm(null)
    setSelectedRecord(null)
    fetchPage(currentPage, appliedSearch)
  }

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE)
  const startRow = (currentPage - 1) * PAGE_SIZE + 1
  const endRow = Math.min(currentPage * PAGE_SIZE, totalRecords)
  const paginationInfo = totalRecords > 0 ? `Showing ${startRow}–${endRow} of ${totalRecords}` : 'No records'

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div className="dash-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="dash-page-title">Sanad Records</h2>
          <p className="dash-page-subtitle">Track historical progress and qualifications</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="dash-submit-btn"
            style={{ padding: '8px 16px', background: activeTab === 'list' ? undefined : 'transparent', color: activeTab === 'list' ? undefined : 'var(--dash-text)' }}
            onClick={() => setActiveTab('list')}
          >
            📋 View All
          </button>
          <button
            className="dash-submit-btn"
            style={{ padding: '8px 16px', background: activeTab === 'add' ? undefined : 'transparent', color: activeTab === 'add' ? undefined : 'var(--dash-text)' }}
            onClick={() => setActiveTab('add')}
          >
            ➕ Add Record
          </button>
        </div>
      </div>

      <Alert error={error} success={success} />

      {activeTab === 'add' && (
        <div className="dash-card">
          <form onSubmit={handleAddSubmit}>
            <SanadFormFields formState={form} onChange={handleFormChange} />
            <button type="submit" className="dash-submit-btn" style={{ marginTop: '20px' }}>
              ➕ Save Sanad Record
            </button>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="dash-content" style={{ padding: 0 }}>
          <div className="dash-header" style={{ background: 'transparent', padding: '0 0 16px 0', border: 'none' }}>
            <p className="dash-page-subtitle">{paginationInfo}</p>
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search name, district, serial no…"
            />
          </div>

          <div className="dash-card">
            {loading ? (
              <LoadingSpinner message="Loading records…" />
            ) : records.length === 0 ? (
              <p className="dash-empty">No Sanad records found.</p>
            ) : (
              <div className="dash-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="dash-table" style={{ whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr>
                      <th>Sr No</th>
                      <th>Entry Date</th>
                      <th>Name / Father</th>
                      <th>District</th>
                      {SANAD_LEVELS.map(l => <th key={l.name}>{l.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(item => (
                      <tr key={item.id} className="clickable-row" onClick={() => setSelectedRecord(item)}>
                        <td>{item.serial_no || '—'}</td>
                        <td>{item.entry_date || '—'}</td>
                        <td>
                          <div className="student-name-cell">
                            <div className="student-avatar" style={{ background: 'oklch(0.65 0.1 270)' }}>
                              {(item.name_with_father || '?')[0].toUpperCase()}
                            </div>
                            <span>{item.name_with_father}</span>
                          </div>
                        </td>
                        <td>{item.district || '—'}</td>
                        {SANAD_LEVELS.map(l => (
                          <td key={l.name}><LevelBadge value={item[l.name]} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      )}

      {selectedRecord && (
        <SanadModal
          record={selectedRecord}
          isAdmin={isAdmin}
          editForm={editForm}
          onClose={() => { setSelectedRecord(null); setEditForm(null) }}
          onEdit={setEditForm}
          onEditChange={handleEditChange}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
