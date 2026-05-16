import React from 'react'
import { supabase } from '../../Auth/SupabaseClient'
import LoadingSpinner from '../shared/LoadingSpinner'
import { useLabels } from '../../hooks/useUiLabels'
import UpdateManager from '../shared/UpdateManager'

function StatCard({ icon, label, value, colorClass }) {
  return (
    <div className={`dash-stat-card ${colorClass}`}>
      <div className="stat-icon-wrap">{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
      </div>
    </div>
  )
}

function RecentStudentRow({ student, onClick }) {
  const avatarContent = student.student_image
    ? (() => {
        const { data } = supabase.storage.from('Darul-Uloom-Students').getPublicUrl(student.student_image)
        return (
          <img
            src={data.publicUrl}
            alt={student.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
          />
        )
      })()
    : (student.name || '?')[0].toUpperCase()

  return (
    <tr className="clickable-row" onClick={() => onClick(student)}>
      <td>
        <div className="student-name-cell">
          <div className="student-avatar">{avatarContent}</div>
          {student.name}
        </div>
      </td>
      <td>{student.father_name || '—'}</td>
      <td>{student.district || '—'}</td>
      <td className="mono">{student.cnic || '—'}</td>
    </tr>
  )
}

export default function DashboardSection({ stats, recentStudents, loading, onRefresh, onStudentClick, onClassClick }) {
  const { t } = useLabels()
  const classCount = Object.keys(stats.byClass).length
  const avgPerClass = classCount > 0 ? Math.round(stats.total / classCount) : 0

  const knownClasses = Object.entries(stats.byClass)
    .filter(([classLevel]) => classLevel && classLevel !== 'Unknown')
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">Dashboard Overview</h2>
          <p className="dash-page-subtitle">Real-time student analytics at a glance</p>
        </div>
        <button className="dash-refresh-btn" onClick={onRefresh}>
          <span className="refresh-icon">🔄</span> {t('dash.refresh')}
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading stats…" />
      ) : (
        <>
          <div className="dash-stats-grid">
            <StatCard icon="👥" label={t('dash.totalStudents')} value={stats.total.toLocaleString()} colorClass="stat-total" />
            <StatCard icon="🗺️" label={t('dash.districts')} value={stats.districts} colorClass="stat-districts" />
            <StatCard icon="🎓" label={t('dash.classes')} value={classCount} colorClass="stat-classes" />
            <StatCard icon="📈" label={t('dash.avgPerClass')} value={avgPerClass} colorClass="stat-avg" />
          </div>

          <div className="dash-card">
            <h3 className="dash-card-title">{t('dash.studentsByClass')}</h3>
            {classCount === 0 ? (
              <p className="dash-empty">{t('dash.noClassData')}</p>
            ) : knownClasses.length === 0 ? (
              <p className="dash-empty">{t('dash.noClassesFound')}</p>
            ) : (
              <div className="class-chips">
                {knownClasses.map(([classLevel, count]) => (
                    <div
                      className="class-chip"
                      key={classLevel}
                      onClick={() => onClassClick?.(classLevel)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="class-chip-name">{classLevel}</span>
                      <span className="class-chip-count">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="dash-card">
            <h3 className="dash-card-title">{t('dash.recentStudents')}</h3>
            {recentStudents.length === 0 ? (
              <p className="dash-empty">{t('dash.noStudents')}</p>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>{t('table.name')}</th>
                      <th>{t('table.fatherName')}</th>
                      <th>{t('table.district')}</th>
                      <th>{t('table.cnic')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map(s => (
                      <RecentStudentRow key={s.id} student={s} onClick={onStudentClick} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Auto-Update Panel */}
          <UpdateManager />
        </>
      )}
    </div>
  )
}
