import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../Auth/SupabaseClient'

const PAGE_SIZE = 50

const initialSanad = {
  student_id: '',
  serial_no: '',
  entry_date: '',
  name_with_father: '',
  district: '',
  level_naazrah_hifz: '',
  level_registration_card: '',
  level_tajweed_aamma: '',
  level_khassa_ula_thania: '',
  level_aaliya_ula_thania: '',
  level_sabaa_thalatha: '',
  level_mauqoof_dawra: '',
  source_row: ''
}

const SanadFormFields = ({ formState, onChange }) => {
  return (
    <>
      <div className="form-section">
        <h4 className="form-section-title">📋 Basic Details</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Serial No.</span>
            <input name="serial_no" value={formState.serial_no || ''} onChange={onChange} placeholder="e.g. 101" />
          </label>
          <label className="form-label">
            <span>Entry Date</span>
            <input type="text" name="entry_date" value={formState.entry_date || ''} onChange={onChange} placeholder="Date" />
          </label>
          <label className="form-label">
            <span>Name w/ Father *</span>
            <input name="name_with_father" value={formState.name_with_father || ''} onChange={onChange} required placeholder="Full Name s/o Father" dir="auto" />
          </label>
          <label className="form-label">
            <span>District</span>
            <input name="district" value={formState.district || ''} onChange={onChange} placeholder="District" dir="auto" />
          </label>
          <label className="form-label">
            <span>Related Student ID</span>
            <input type="number" name="student_id" value={formState.student_id || ''} onChange={onChange} placeholder="Optional (Link to main db)" />
          </label>
          <label className="form-label">
            <span>Source Row</span>
            <input type="number" name="source_row" value={formState.source_row || ''} onChange={onChange} placeholder="Row #" />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h4 className="form-section-title">🎓 Sanad Levels Progress</h4>
        <div className="form-grid">
          <label className="form-label">
            <span>Naazrah / Hifz</span>
            <input name="level_naazrah_hifz" value={formState.level_naazrah_hifz || ''} onChange={onChange} placeholder="Status / Grade" dir="auto" />
          </label>
          <label className="form-label">
            <span>Registration Card</span>
            <input name="level_registration_card" value={formState.level_registration_card || ''} onChange={onChange} placeholder="Status" dir="auto" />
          </label>
          <label className="form-label">
            <span>Tajweed / Aamma</span>
            <input name="level_tajweed_aamma" value={formState.level_tajweed_aamma || ''} onChange={onChange} placeholder="Status / Grade" dir="auto" />
          </label>
          <label className="form-label">
            <span>Khassa (Ula / Thania)</span>
            <input name="level_khassa_ula_thania" value={formState.level_khassa_ula_thania || ''} onChange={onChange} placeholder="Status / Grade" dir="auto" />
          </label>
          <label className="form-label">
            <span>Aaliya (Ula / Thania)</span>
            <input name="level_aaliya_ula_thania" value={formState.level_aaliya_ula_thania || ''} onChange={onChange} placeholder="Status / Grade" dir="auto" />
          </label>
          <label className="form-label">
            <span>Sabaa / Thalatha</span>
            <input name="level_sabaa_thalatha" value={formState.level_sabaa_thalatha || ''} onChange={onChange} placeholder="Status / Grade" dir="auto" />
          </label>
          <label className="form-label">
            <span>Mauqoof / Dawra</span>
            <input name="level_mauqoof_dawra" value={formState.level_mauqoof_dawra || ''} onChange={onChange} placeholder="Status / Grade" dir="auto" />
          </label>
        </div>
      </div>
    </>
  )
}

export default function SanadDashboard({ user }) {
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.role === 'admin'

  const [activeTab, setActiveTab] = useState('list') // 'list' | 'add'

  // Data fetching
  const [records, setRecords] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const searchTimer = useRef(null)

  // Modals / Forms
  const [form, setForm] = useState(initialSanad)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [editForm, setEditForm] = useState(null)

  const fetchPage = useCallback(async (page, searchStr) => {
    setLoading(true)
    setError('')

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('sanad_records').select('*', { count: 'exact' })

    if (searchStr && searchStr.trim()) {
      query = query.or(
        `name_with_father.ilike.%${searchStr.trim()}%,district.ilike.%${searchStr.trim()}%,serial_no.ilike.%${searchStr.trim()}%`
      )
    }

    query = query.order('id', { ascending: false }).range(from, to)

    const { data, count, error: fetchErr } = await query

    if (fetchErr) {
      setError(fetchErr.message)
    } else {
      setRecords(data || [])
      setTotalRecords(count || 0)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'list') {
      fetchPage(currentPage, appliedSearch)
    }
  }, [activeTab, currentPage, appliedSearch, fetchPage])

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1)
      setAppliedSearch(value)
    }, 400)
  }

  const handleAddChange = (e) => {
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

    const payload = {
      ...form,
      student_id: form.student_id ? Number(form.student_id) : null,
      source_row: form.source_row ? Number(form.source_row) : null,
    }

    const { error: insertErr } = await supabase.from('sanad_records').insert([payload])

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

    const payload = {
      ...editForm,
      student_id: editForm.student_id ? Number(editForm.student_id) : null,
      source_row: editForm.source_row ? Number(editForm.source_row) : null,
    }

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
  const renderPaginationInfo = () => {
    const startObj = (currentPage - 1) * PAGE_SIZE + 1
    const endObj = Math.min(currentPage * PAGE_SIZE, totalRecords)
    return totalRecords > 0 ? `Showing ${startObj}-${endObj} of ${totalRecords}` : 'No records'
  }

  const getPageNumbers = () => {
    const pages = []
    const limit = 5
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + limit - 1)
    if (end - start + 1 < limit) {
      start = Math.max(1, end - limit + 1)
    }
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div className="dash-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="dash-page-title">Sanad Records Dashboard</h2>
          <p className="dash-page-subtitle">Track historical progress and qualifications</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`dash-submit-btn ${activeTab === 'list' ? '' : 'btn-outline'}`}
            style={{ padding: '8px 16px', background: activeTab === 'list' ? undefined : 'transparent', color: activeTab === 'list' ? undefined : 'var(--dash-text)' }}
            onClick={() => setActiveTab('list')}
          >
            📋 View All
          </button>
          <button
            className={`dash-submit-btn ${activeTab === 'add' ? '' : 'btn-outline'}`}
            style={{ padding: '8px 16px', background: activeTab === 'add' ? undefined : 'transparent', color: activeTab === 'add' ? undefined : 'var(--dash-text)' }}
            onClick={() => setActiveTab('add')}
          >
            ➕ Add Record
          </button>
        </div>
      </div>

      {error && <div className="dash-alert dash-alert-error">{error}</div>}
      {success && <div className="dash-alert dash-alert-success">{success}</div>}

      {activeTab === 'add' && (
        <div className="dash-card">
          <form onSubmit={handleAddSubmit}>
            <SanadFormFields formState={form} onChange={handleAddChange} />
            <button type="submit" className="dash-submit-btn" style={{ marginTop: '20px' }}>
              ➕ Save Sanad Record
            </button>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="dash-content" style={{ padding: 0 }}>
          <div className="dash-header" style={{ background: 'transparent', padding: '0 0 16px 0', border: 'none' }}>
            <p className="dash-page-subtitle">{renderPaginationInfo()}</p>
            <div className="dash-search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="dash-search"
                placeholder="Search name, district, serial no…"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="dash-card">
            {loading ? (
              <div className="dash-loading"><div className="spinner" /> Loading records…</div>
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
                      <th>Naazrah / Hifz</th>
                      <th>Reg Card</th>
                      <th>Tajweed / Aamma</th>
                      <th>Khassa (Ula/Thania)</th>
                      <th>Aaliya (Ula/Thania)</th>
                      <th>Sabaa / Thalatha</th>
                      <th>Mauqoof / Dawra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(item => (
                      <tr key={item.id} className="clickable-row" onClick={() => setSelectedRecord(item)}>
                        <td>{item.serial_no || '—'}</td>
                        <td>{item.entry_date || '—'}</td>
                        <td>
                          <div className="student-name-cell">
                            <div className="student-avatar" style={{ background: 'oklch(0.65 0.1 270)' }}>{(item.name_with_father || '?')[0].toUpperCase()}</div>
                            <span>{item.name_with_father}</span>
                          </div>
                        </td>
                        <td>{item.district || '—'}</td>
                        {/* Levels rendering */}
                        <td><span className="class-chip" style={{ background: item.level_naazrah_hifz ? 'var(--dash-accent)' : 'transparent', color: item.level_naazrah_hifz ? '#fff' : 'inherit' }}>{item.level_naazrah_hifz || '—'}</span></td>
                        <td><span className="class-chip" style={{ background: item.level_registration_card ? 'var(--dash-accent)' : 'transparent', color: item.level_registration_card ? '#fff' : 'inherit' }}>{item.level_registration_card || '—'}</span></td>
                        <td><span className="class-chip" style={{ background: item.level_tajweed_aamma ? 'var(--dash-accent)' : 'transparent', color: item.level_tajweed_aamma ? '#fff' : 'inherit' }}>{item.level_tajweed_aamma || '—'}</span></td>
                        <td><span className="class-chip" style={{ background: item.level_khassa_ula_thania ? 'var(--dash-accent)' : 'transparent', color: item.level_khassa_ula_thania ? '#fff' : 'inherit' }}>{item.level_khassa_ula_thania || '—'}</span></td>
                        <td><span className="class-chip" style={{ background: item.level_aaliya_ula_thania ? 'var(--dash-accent)' : 'transparent', color: item.level_aaliya_ula_thania ? '#fff' : 'inherit' }}>{item.level_aaliya_ula_thania || '—'}</span></td>
                        <td><span className="class-chip" style={{ background: item.level_sabaa_thalatha ? 'var(--dash-accent)' : 'transparent', color: item.level_sabaa_thalatha ? '#fff' : 'inherit' }}>{item.level_sabaa_thalatha || '—'}</span></td>
                        <td><span className="class-chip" style={{ background: item.level_mauqoof_dawra ? 'var(--dash-accent)' : 'transparent', color: item.level_mauqoof_dawra ? '#fff' : 'inherit' }}>{item.level_mauqoof_dawra || '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="dash-pagination">
                <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                  ← Prev
                </button>
                {getPageNumbers().map(p => (
                  <button key={p} className={`page-btn ${p === currentPage ? 'page-active' : ''}`} onClick={() => setCurrentPage(p)}>
                    {p}
                  </button>
                ))}
                <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for viewing & editing */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => { setSelectedRecord(null); setEditForm(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-avatar" style={{ background: 'oklch(0.65 0.1 270)' }}>{(selectedRecord.name_with_father || '?')[0].toUpperCase()}</div>
                <div>
                  <h2 className="modal-title">{selectedRecord.name_with_father || 'Unknown'}</h2>
                  <p className="modal-subtitle">Sanad Record • ID: {selectedRecord.id}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {isAdmin && !editForm && (
                  <button className="sidebar-btn" style={{ padding: '6px 12px', background: 'var(--dash-bg)', color: 'var(--dash-accent)' }} onClick={() => setEditForm({ ...selectedRecord })}>✏️ Edit</button>
                )}
                <button className="modal-close" onClick={() => { setSelectedRecord(null); setEditForm(null); }}>✕</button>
              </div>
            </div>

            <div className="modal-body">
              {editForm ? (
                <form onSubmit={handleUpdate} className="edit-student-form">
                  <div style={{ marginTop: -16 }}></div>
                  <SanadFormFields formState={editForm} onChange={handleEditChange} />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button type="button" className="sidebar-btn" onClick={() => setEditForm(null)}>Cancel</button>
                    <button type="submit" className="dash-submit-btn">💾 Save Changes</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="modal-section">
                    <h4 className="form-section-title">📋 Basic Details</h4>
                    <div className="modal-grid">
                      <div className="modal-field"><span className="modal-field-label">Serial No.</span><span className="modal-field-value">{selectedRecord.serial_no || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Entry Date</span><span className="modal-field-value">{selectedRecord.entry_date || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Related Student ID</span><span className="modal-field-value">{selectedRecord.student_id || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Source Row</span><span className="modal-field-value">{selectedRecord.source_row || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">District</span><span className="modal-field-value">{selectedRecord.district || '—'}</span></div>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h4 className="form-section-title">🎓 Sanad Levels</h4>
                    <div className="modal-grid">
                      <div className="modal-field"><span className="modal-field-label">Naazrah / Hifz</span><span className="modal-field-value">{selectedRecord.level_naazrah_hifz || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Registration Card</span><span className="modal-field-value">{selectedRecord.level_registration_card || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Tajweed / Aamma</span><span className="modal-field-value">{selectedRecord.level_tajweed_aamma || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Khassa (Ula / Thania)</span><span className="modal-field-value">{selectedRecord.level_khassa_ula_thania || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Aaliya (Ula / Thania)</span><span className="modal-field-value">{selectedRecord.level_aaliya_ula_thania || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Sabaa / Thalatha</span><span className="modal-field-value">{selectedRecord.level_sabaa_thalatha || '—'}</span></div>
                      <div className="modal-field"><span className="modal-field-label">Mauqoof / Dawra</span><span className="modal-field-value">{selectedRecord.level_mauqoof_dawra || '—'}</span></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
