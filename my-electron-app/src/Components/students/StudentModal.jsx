import React from 'react'
import { supabase } from '../../Auth/SupabaseClient'
import StudentFormFields from './StudentFormFields'

function StudentAvatar({ student }) {
  if (student.student_image) {
    const { data } = supabase.storage.from('Darul-Uloom-Students').getPublicUrl(student.student_image)
    return (
      <img
        src={data.publicUrl}
        alt={student.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
      />
    )
  }
  return <>{(student.name || '?')[0].toUpperCase()}</>
}

function ModalField({ label, value, mono }) {
  return (
    <div className="modal-field">
      <span className="modal-field-label">{label}</span>
      <span className={`modal-field-value${mono ? ' mono' : ''}`}>{value || '—'}</span>
    </div>
  )
}

function StudentDetails({ student }) {
  return (
    <>
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
    </>
  )
}

export default function StudentModal({ student, isAdmin, editForm, onClose, onEdit, onEditChange, onEditFileChange, onUpdate, rooms = [] }) {
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
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isAdmin && !editForm && (
              <button
                className="sidebar-btn"
                style={{ padding: '6px 12px', background: 'var(--dash-bg)', color: 'var(--dash-accent)' }}
                onClick={onEdit}
              >
                ✏️ Edit
              </button>
            )}
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-body">
          {editForm ? (
            <form onSubmit={onUpdate} className="edit-student-form">
              <StudentFormFields
                formState={editForm}
                onChange={onEditChange}
                onFileChange={onEditFileChange}
                rooms={rooms}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="sidebar-btn" onClick={() => onEdit(null)}>Cancel</button>
                <button type="submit" className="dash-submit-btn">💾 Save Changes</button>
              </div>
            </form>
          ) : (
            <StudentDetails student={student} />
          )}
        </div>
      </div>
    </div>
  )
}
