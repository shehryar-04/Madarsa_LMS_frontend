import React from 'react'
import madarsaLogo from '../../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'
import { useLabels } from '../../hooks/useUiLabels'

export default function Sidebar({ activeSection, onNavigate, collapsed, onToggleCollapse, isSuperAdmin = false, isResultsAdmin = false }) {
  const { t } = useLabels()

  const BASE_NAV = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: '📊' },
    { id: 'allStudents', label: t('nav.allStudents'), icon: '👥' },
    { id: 'addStudent', label: t('nav.addStudent'), icon: '➕' },
    { id: 'sanadRecords', label: t('nav.sanadRecords'), icon: '📜' },
    { id: 'rooms', label: t('nav.rooms'), icon: '🚪' },
    { id: 'classes', label: t('nav.classes'), icon: '🎓' },
  ]

  const RESULTS_NAV = [
    { id: 'results', label: t('nav.results'), icon: '📝' },
    { id: 'grading', label: t('nav.grading'), icon: '📊' },
  ]

  const SUPER_ADMIN_NAV = [
    { id: 'auditLog', label: t('nav.auditLog'), icon: '🔍' },
  ]

  const navItems = [
    ...BASE_NAV,
    ...(isResultsAdmin ? RESULTS_NAV : []),
    ...(isSuperAdmin ? SUPER_ADMIN_NAV : []),
  ]

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
          title={collapsed ? t('nav.expand') : t('nav.collapse')}
        >
          <span className="sidebar-btn-icon">{collapsed ? '▶' : '◀'}</span>
          {!collapsed && <span className="sidebar-btn-label">{t('nav.collapse')}</span>}
        </button>
      </div>
    </aside>
  )
}
