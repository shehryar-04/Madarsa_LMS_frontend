import React from 'react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'allStudents', label: 'All Students', icon: '👥' },
  { id: 'addStudent', label: 'Add Student', icon: '➕' },
  { id: 'sanadRecords', label: 'Sanad Records', icon: '📜' },
  { id: 'rooms', label: 'Rooms', icon: '🚪' },
]

export default function Sidebar({ activeSection, onNavigate, collapsed, onToggleCollapse }) {
  return (
    <aside className="dash-sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">📚</span>
        {!collapsed && <span className="sidebar-title">Madarsa LMS</span>}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar-btn ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            title={item.label}
          >
            <span className="sidebar-btn-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-btn-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-btn sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <span className="sidebar-btn-icon">{collapsed ? '▶' : '◀'}</span>
          {!collapsed && <span className="sidebar-btn-label">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
