import React from 'react'
import { supabase } from '../../Auth/SupabaseClient'

function StudentAvatar({ student }) {
  if (student.student_image) {
    const { data } = supabase.storage.from('Darul-Uloom-Students').getPublicUrl(student.student_image)
    return (
      <img
        src={data.publicUrl}
        alt={student.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
      />
    )
  }
  return <>{(student.name || '?')[0].toUpperCase()}</>
}

export default function StudentTable({ students, onRowClick }) {
  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Father Name</th>
            <th>Type</th>
            <th>Class</th>
            <th>District</th>
            <th>CNIC</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id} className="clickable-row" onClick={() => onRowClick(student)}>
              <td>
                <div className="student-name-cell">
                  <div className="student-avatar">
                    <StudentAvatar student={student} />
                  </div>
                  {student.name}
                </div>
              </td>
              <td>{student.father_name || '—'}</td>
              <td>
                {student.student_type && (
                  <span className="class-badge">{student.student_type.toUpperCase()}</span>
                )}
              </td>
              <td>{student.class_level || '—'}</td>
              <td>{student.district || '—'}</td>
              <td className="mono">{student.cnic || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
