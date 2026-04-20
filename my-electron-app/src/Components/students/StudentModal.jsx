import React, { useState } from 'react'
import { supabase } from '../../Auth/SupabaseClient'

function ModalField({ label, value, mono }) {
  return (
    <div className="modal-field">
      <span className="modal-field-label">{label}</span>
      <span className={`modal-field-value${mono ? ' mono' : ''}`}>{value || '—'}</span>
    </div>
  )
}

function StudentAvatar({ student }) {
  const [lightbox, setLightbox] = useState(false)

  if (!student.student_image) {
    return <>{(student.name || '?')[0].toUpperCase()}</>
  }

  const { data } = supabase.storage.from('Darul-Uloom-Students').getPublicUrl(student.student_image)
  const url = data?.publicUrl

  return (
    <>
      <img
        src={url}
        alt={student.name}
        onClick={e => { e.stopPropagation(); setLightbox(true) }}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', cursor: 'zoom-in' }}
      />
      {lightbox && (
        <div
          onClick={e => { e.stopPropagation(); setLightbox(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 999, cursor: 'zoom-out',
          }}
        >
          <img
            src={url}
            alt={student.name}
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
          />
        </div>
      )}
    </>
  )
}

export default function StudentModal({ student, isAdmin, onClose, onEdit }) {
  const inactive = student.status === 'inactive'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-avatar">
              <StudentAvatar student={student} />
            </div>
            <div>
              <h2 className="modal-title">{student.name || 'Unknown'}</h2>
              <p className="modal-subtitle">
                {student.student_type?.toUpperCase()} • ID: {student.id}
              </p>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                background: inactive ? 'var(--dash-red-light)' : 'var(--dash-green-light)',
                color: inactive ? 'var(--dash-red)' : 'var(--dash-green)',
              }}>
                {inactive ? '🔴 Inactive' : '🟢 Active'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isAdmin && (
              <button
                className="sidebar-btn"
                style={{ padding: '6px 14px', background: 'var(--dash-bg)', color: 'var(--dash-accent)' }}
                onClick={onEdit}
              >
                ✏️ Edit
              </button>
            )}
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h4 className="modal-section-title">👤 Basic Information</h4>
            <div className="modal-grid">
              <ModalField label="Full Name" value={student.name} />
              <ModalField label="Father's Name" value={student.father_name} />
              <ModalField label="Date of Birth" value={student.dob} />
              <ModalField label="CNIC / B-Form" value={student.cnic} mono />
              <ModalField label="Phone" value={student.phone} mono />
            </div>
          </div>

          <div className="modal-section">
            <h4 className="modal-section-title">🎓 Enrollment</h4>
            <div className="modal-grid">
              <ModalField label="Student Type" value={student.student_type?.toUpperCase()} />
              <ModalField label="Class / Level" value={student.class_level} />
              <ModalField label="Entry Year" value={student.entry_year} />
              <ModalField label="Serial No." value={student.serial_no} />
              <ModalField label="Form No." value={student.form_no} />
              <ModalField label="Admission Date" value={student.tareekh_daakhla} />
              <ModalField label="Leaving Date" value={student.tareekh_ijaara} />
            </div>
          </div>

          <div className="modal-section">
            <h4 className="modal-section-title">👨‍👩‍👦 Guardian</h4>
            <div className="modal-grid">
              <ModalField label="Guardian Name" value={student.guardian_name} />
              <ModalField label="Relation" value={student.guardian_relation} />
              <ModalField label="Guardian CNIC" value={student.guardian_cnic} mono />
              <ModalField label="Guardian Phone" value={student.guardian_phone} mono />
            </div>
          </div>

          <div className="modal-section">
            <h4 className="modal-section-title">📍 Residence</h4>
            <div className="modal-grid">
              <ModalField label="Status" value={student.residential_status} />
              <ModalField label="Room No." value={student.room_number} />
              <ModalField label="District" value={student.district} />
              <ModalField label="Address" value={student.address} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
