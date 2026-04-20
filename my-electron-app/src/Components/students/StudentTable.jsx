import React, { useState } from 'react'
import { supabase } from '../../Auth/SupabaseClient'

function AvatarCell({ student }) {
  const [lightbox, setLightbox] = useState(false)

  if (!student.student_image) {
    return (
      <div className="student-avatar">
        {(student.name || '?')[0].toUpperCase()}
      </div>
    )
  }

  const { data } = supabase.storage.from('Darul-Uloom-Students').getPublicUrl(student.student_image)
  const url = data?.publicUrl

  return (
    <>
      <div
        className="student-avatar"
        onClick={e => { e.stopPropagation(); setLightbox(true) }}
        style={{ cursor: 'zoom-in' }}
        title="Click to enlarge"
      >
        <img src={url} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
      </div>

      {lightbox && (
        <div
          onClick={e => { e.stopPropagation(); setLightbox(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 999, cursor: 'zoom-out',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <img
              src={url}
              alt={student.name}
              style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: '12px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)', display: 'block' }}
            />
            <p style={{ color: '#fff', marginTop: '12px', fontSize: '14px', fontWeight: 600 }}>{student.name}</p>
          </div>
        </div>
      )}
    </>
  )
}

export default function StudentTable({ students, onRowClick }) {
  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Father Name</th>
            <th>Serial No</th>
            <th>Type</th>
            <th>Class</th>
            <th>District</th>
            <th>CNIC</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const inactive = student.status === 'inactive'
            return (
              <tr
                key={student.id}
                className="cligckable-row"
                onClick={() => onRowClick(student)}
                style={{ opacity: inactive ? 0.55 : 1 }}
              >
                <td className="mono" style={{ color: 'var(--dash-text)', fontSize: '12px' }}>{student.id}</td>
                <td>
                  <div className="student-name-cell">
                    <AvatarCell student={student} />
                    {student.name}
                  </div>
                </td>
                <td>{student.father_name || '—'}</td>
                <td className="mono">{student.serial_no || '—'}</td>
                <td>
                  {student.student_type && (
                    <span className="class-badge">{student.student_type.toUpperCase()}</span>
                  )}
                </td>
                <td>{student.class_level || '—'}</td>
                <td>{student.district || '—'}</td>
                <td className="mono">{student.cnic || '—'}</td>
                <td>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                    background: inactive ? 'var(--dash-red-light)' : 'var(--dash-green-light)',
                    color: inactive ? 'var(--dash-red)' : 'var(--dash-green)',
                  }}>
                    {inactive ? 'Inactive' : 'Active'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
