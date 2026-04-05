import React from 'react'
import { supabase } from '../../Auth/SupabaseClient'
import LoadingSpinner from '../shared/LoadingSpinner'

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

export default function DashboardSection({ stats, recentStudents, loading, onRefresh, onStudentClick }) {
  const classCount = Object.keys(stats.byClass).length
  const avgPerClass = classCount > 0 ? Math.round(stats.total / classCount) : 0

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">Dashboard Overview</h2>
          <p className="dash-page-subtitle">Real-time student analytics at a glance</p>
        </div>
        <button className="dash-refresh-btn" onClick={onRefresh}>
          <span className="refresh-icon">🔄</span> Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading stats…" />
      ) : (
        <>
          <div className="dash-stats-grid">
            <StatCard icon="👥" label="Total Students" value={stats.total.toLocaleString()} colorClass="stat-total" />
            <StatCard icon="🗺️" label="Districts" value={stats.districts} colorClass="stat-districts" />
            <StatCard icon="🎓" label="Classes" value={classCount} colorClass="stat-classes" />
            <StatCard icon="📈" label="Avg per Class" value={avgPerClass} colorClass="stat-avg" />
          </div>

          <div className="dash-card">
            <h3 className="dash-card-title">Students by Class</h3>
            {classCount === 0 ? (
              <p className="dash-empty">No class data yet</p>
            ) : (
              <div className="class-chips">
                {Object.entries(stats.byClass)
                  .sort((a, b) => b[1] - a[1])
                  .map(([classLevel, count]) => (
                    <div className="class-chip" key={classLevel}>
                      <span className="class-chip-name">{classLevel || 'Unknown'}</span>
                      <span className="class-chip-count">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="dash-card">
            <h3 className="dash-card-title">Recent Students</h3>
            {recentStudents.length === 0 ? (
              <p className="dash-empty">No students found.</p>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Father Name</th><th>District</th><th>CNIC</th>
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
        </>
      )}
    </div>
  )
}
