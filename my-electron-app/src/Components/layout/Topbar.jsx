import React from 'react'
import madarsaLogo from '../../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'

export default function Topbar({ user, dbRole, onLogout, isOnline, syncing, lastSync, onSyncNow }) {
  const displayName = user?.user_metadata?.full_name || user?.email || 'User'
  const role = dbRole || user?.user_metadata?.role || 'user'

  const syncLabel = syncing
    ? '🔄 Syncing…'
    : isOnline
      ? '🟢 Online'
      : '🔴 Offline'

  const lastSyncText = lastSync
    ? `Last backup: ${new Date(lastSync).toLocaleTimeString()}`
    : 'Not synced yet'

  return (
    <header className="dash-topbar">
      <div className="topbar-left">
        <img src={madarsaLogo} alt="logo" style={{ width: '36px', height: '36px', objectFit: 'contain', marginRight: '10px', flexShrink: 0 }} />
        <span className="topbar-greeting">
          Welcome, <strong>{displayName}</strong>
        </span>
      </div>
      <div className="topbar-right">
        {/* Sync status — only shown when running in Electron */}
        {typeof window !== 'undefined' && window.localDb && (
          <>
            <button
              className="sidebar-btn"
              onClick={onSyncNow}
              disabled={syncing || !isOnline}
              title={lastSyncText}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                color: isOnline ? 'var(--dash-green)' : 'var(--dash-red)',
                opacity: syncing ? 0.7 : 1,
              }}
            >
              {syncLabel}
            </button>
            <button
              className="sidebar-btn"
              onClick={() => window.localDb.openBackupFolder()}
              title="Open local backup folder"
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              📂
            </button>
          </>
        )}
        <span className="topbar-role">{role}</span>
        <button className="topbar-logout" onClick={onLogout}>Logout</button>
      </div>
    </header>
  )
}
