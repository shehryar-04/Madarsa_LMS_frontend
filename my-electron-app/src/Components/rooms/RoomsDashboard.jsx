import React, { useEffect, useState } from 'react'
import { supabase } from '../../Auth/SupabaseClient'
import { useRooms, initialRoom } from '../../hooks/useRooms'
import Alert from '../shared/Alert'
import LoadingSpinner from '../shared/LoadingSpinner'

function getRoomImageUrl(path) {
  if (!path) return null
  const { data } = supabase.storage.from('rooms').getPublicUrl(path)
  return data?.publicUrl || null
}

function OccupancyBar({ current, capacity }) {
  const pct = capacity > 0 ? Math.min(100, Math.round((current / capacity) * 100)) : 0
  const color = pct >= 100 ? 'var(--dash-red)' : pct >= 80 ? 'var(--dash-orange)' : 'var(--dash-green)'
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--dash-text)', marginBottom: '4px' }}>
        <span>{current} / {capacity} occupied</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ height: '6px', background: 'var(--dash-surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

function RoomCard({ room, isAdmin, onEdit, onDelete, onViewStudents }) {
  const imageUrl = getRoomImageUrl(room.image)
  const isFull = room.current_occupancy >= room.capacity

  return (
    <div style={{
      background: 'var(--dash-surface)',
      border: '1px solid var(--dash-border)',
      borderRadius: 'var(--dash-radius)',
      overflow: 'hidden',
      transition: 'transform var(--dash-transition), box-shadow var(--dash-transition)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--dash-shadow)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      {/* Room image */}
      <div style={{ height: '140px', background: 'var(--dash-surface-2)', position: 'relative', overflow: 'hidden' }}>
        {imageUrl
          ? <img src={imageUrl} alt={room.room_number} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🚪</div>
        }
        {isFull && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--dash-red)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>
            FULL
          </div>
        )}
      </div>

      {/* Room info */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--dash-text-bright)' }}>
            Room {room.room_number}
          </h3>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dash-accent)', background: 'var(--dash-accent-light)', padding: '2px 8px', borderRadius: '10px' }}>
            Cap: {room.capacity}
          </span>
        </div>

        {room.notes && (
          <p style={{ margin: '4px 0 8px', fontSize: '12px', color: 'var(--dash-text)', lineHeight: 1.4 }}>{room.notes}</p>
        )}

        <OccupancyBar current={room.current_occupancy} capacity={room.capacity} />

        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              className="sidebar-btn"
              style={{ flex: 1, padding: '6px', fontSize: '12px', justifyContent: 'center', background: 'var(--dash-surface-2)' }}
              onClick={() => onEdit(room)}
            >
              ✏️ Edit
            </button>
            <button
              className="sidebar-btn"
              style={{ flex: 1, padding: '6px', fontSize: '12px', justifyContent: 'center', color: 'var(--dash-red)' }}
              onClick={() => onDelete(room.id)}
            >
              🗑️ Delete
            </button>
          </div>
        )}
        <button
          className="sidebar-btn"
          style={{ width: '100%', marginTop: isAdmin ? '8px' : '12px', padding: '7px', fontSize: '12px', justifyContent: 'center', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)' }}
          onClick={() => onViewStudents(room.room_number)}
        >
          👥 View Students
        </button>
      </div>
    </div>
  )
}

function RoomForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initial)
  const [preview, setPreview] = useState(null)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFile = e => {
    const file = e.target.files[0]
    if (!file) return
    setForm(prev => ({ ...prev, image_file: file }))
    setPreview(URL.createObjectURL(file))
  }

  const existingImageUrl = !preview && initial.image
    ? getRoomImageUrl(initial.image)
    : null

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }}>
      <div className="form-grid">
        <label className="form-label">
          <span>Room Number *</span>
          <input name="room_number" value={form.room_number} onChange={handleChange} required placeholder="e.g. A-12" />
        </label>
        <label className="form-label">
          <span>Capacity (total beds)</span>
          <input type="number" name="capacity" value={form.capacity} onChange={handleChange} required min="1" placeholder="e.g. 10" />
        </label>
        <label className="form-label">
          <span>Current Occupancy</span>
          <input type="number" name="current_occupancy" value={form.current_occupancy} onChange={handleChange} min="0" placeholder="e.g. 7" />
        </label>
        <label className="form-label">
          <span>Notes</span>
          <input name="notes" value={form.notes || ''} onChange={handleChange} placeholder="Optional notes about the room" />
        </label>
        <label className="form-label form-label-wide">
          <span>Room Image</span>
          <input type="file" accept="image/*" onChange={handleFile} />
          {(preview || existingImageUrl) && (
            <img
              src={preview || existingImageUrl}
              alt="preview"
              style={{ marginTop: '8px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--dash-border)' }}
            />
          )}
        </label>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button type="submit" className="dash-submit-btn">{submitLabel}</button>
        <button type="button" className="sidebar-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

export default function RoomsDashboard({ user, onRoomClick }) {
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.role === 'admin'
  const { rooms, loading, error, success, fetchRooms, addRoom, updateRoom, deleteRoom } = useRooms()

  const [view, setView] = useState('list') // 'list' | 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null)

  useEffect(() => { fetchRooms() }, [fetchRooms])

  const handleAdd = async (form) => {
    const ok = await addRoom(form)
    if (ok) setView('list')
  }

  const handleUpdate = async (form) => {
    const ok = await updateRoom(form)
    if (ok) { setView('list'); setEditTarget(null) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return
    await deleteRoom(id)
  }

  const handleEdit = (room) => {
    setEditTarget({ ...room, image_file: null })
    setView('edit')
  }

  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0)
  const totalOccupied = rooms.reduce((s, r) => s + r.current_occupancy, 0)
  const available = totalCapacity - totalOccupied

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">Rooms Management</h2>
          <p className="dash-page-subtitle">
            {rooms.length} rooms · {totalOccupied} occupied · {available} available
          </p>
        </div>
        {isAdmin && view === 'list' && (
          <button className="dash-submit-btn" style={{ padding: '9px 20px' }} onClick={() => setView('add')}>
            ➕ Add Room
          </button>
        )}
        {view !== 'list' && (
          <button className="sidebar-btn" onClick={() => { setView('list'); setEditTarget(null) }}>
            ← Back
          </button>
        )}
      </div>

      <Alert error={error} success={success} />

      {/* Add form */}
      {view === 'add' && (
        <div className="dash-card">
          <h3 className="dash-card-title">New Room</h3>
          <RoomForm
            initial={{ ...initialRoom }}
            onSubmit={handleAdd}
            onCancel={() => setView('list')}
            submitLabel="🚪 Add Room"
          />
        </div>
      )}

      {/* Edit form */}
      {view === 'edit' && editTarget && (
        <div className="dash-card">
          <h3 className="dash-card-title">Edit Room {editTarget.room_number}</h3>
          <RoomForm
            initial={editTarget}
            onSubmit={handleUpdate}
            onCancel={() => { setView('list'); setEditTarget(null) }}
            submitLabel="💾 Save Changes"
          />
        </div>
      )}

      {/* Room grid */}
      {view === 'list' && (
        loading ? <LoadingSpinner message="Loading rooms…" /> :
        rooms.length === 0 ? (
          <div className="dash-card">
            <p className="dash-empty">No rooms added yet.{isAdmin ? ' Click "Add Room" to get started.' : ''}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {rooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewStudents={onRoomClick}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}
