import React from 'react'
import madarsaLogo from '../../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'

const BASE_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'allStudents', label: 'All Students', icon: '👥' },
  { id: 'addStudent', label: 'Add Student', icon: '➕' },
  { id: 'sanadRecords', label: 'Sanad Records', icon: '📜' },
  { id: 'rooms', label: 'Rooms', icon: '🚪' },
  { id: 'classes', label: 'Classes', icon: '🎓' },
]

const SUPER_ADMIN_NAV = [
  { id: 'auditLog', label: 'Audit Log', icon: '🔍' },
]

export default function Sidebar({ activeSection, onNavigate, collapsed, onToggleCollapse, isSuperAdmin = false }) {
  const navItems = isSuperAdmin ? [...BASE_NAV, ...SUPER_ADMIN_NAV] : BASE_NAV

  return (
    <aside className="dash-sidebar">
      <div className="sidebar-brand">
        <img src={madarsaLogo} alt="logo" style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }} />
        {!collapsed && <span className="sidebar-title">دارالعلوم اسلامیہ</span>}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
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
