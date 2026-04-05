import React from 'react'

export default function Topbar({ user, dbRole, onLogout }) {
  const displayName = user?.user_metadata?.full_name || user?.email || 'User'
  const role = dbRole || user?.user_metadata?.role || 'user'

  return (
    <header className="dash-topbar">
      <div className="topbar-left">
        <span className="topbar-greeting">
          Welcome, <strong>{displayName}</strong>
        </span>
      </div>
      <div className="topbar-right">
        <span className="topbar-role">{role}</span>
        <button className="topbar-logout" onClick={onLogout}>Logout</button>
      </div>
    </header>
  )
}
