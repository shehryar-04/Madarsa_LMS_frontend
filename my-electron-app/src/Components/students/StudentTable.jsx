import React, { useState } from 'react'
import { supabase } from '../../Auth/SupabaseClient'
import { useLabels } from '../../hooks/useUiLabels'

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
  const { t } = useLabels()

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>{t('table.serialNo')}</th>
            <th>{t('table.name')}</th>
            <th>{t('table.fatherName')}</th>
            <th>{t('table.type')}</th>
            <th>{t('table.class')}</th>
            <th>{t('table.district')}</th>
            <th>{t('table.cnic')}</th>
            <th>{t('table.status')}</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const isCurrent = student.status === 'current'
            const isPassed = student.status === 'passed'
            return (
              <tr
                key={student.id}
                className="clickable-row"
                onClick={() => onRowClick(student)}
                style={{ opacity: (!isCurrent && !isPassed) ? 0.55 : 1 }}
              >
                <td className="mono" style={{ color: 'var(--dash-text)', fontSize: '12px' }}>{student.serial_no || '—'}</td>
                <td>
                  <div className="student-name-cell">
                    <AvatarCell student={student} />
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
                <td>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                    background: isCurrent ? 'var(--dash-green-light)' : isPassed ? 'var(--dash-accent-light)' : 'var(--dash-red-light)',
                    color: isCurrent ? 'var(--dash-green)' : isPassed ? 'var(--dash-accent)' : 'var(--dash-red)',
                  }}>
                    {isCurrent ? t('table.active') : isPassed ? t('table.passed') : t('table.inactive')}
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
