import React from 'react'
import madarsaLogo from '../../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'
import { useLabels } from '../../hooks/useUiLabels'
import UpdateManager from '../shared/UpdateManager'

export default function Topbar({ user, dbRole, onLogout, isOnline, syncing, lastSync, onSyncNow }) {
  const { t } = useLabels()
  const displayName = user?.user_metadata?.full_name || user?.email || 'User'
  const role = dbRole || user?.user_metadata?.role || 'user'

  const syncLabel = syncing
    ? t('topbar.syncing')
    : isOnline
      ? t('topbar.online')
      : t('topbar.offline')

  const lastSyncText = lastSync
    ? `Last backup: ${new Date(lastSync).toLocaleTimeString()}`
    : t('topbar.notSynced')

  return (
    <header className="dash-topbar">
      <div className="topbar-left">
        <img src={madarsaLogo} alt="logo" style={{ width: '36px', height: '36px', objectFit: 'contain', marginRight: '10px', flexShrink: 0 }} />
        <span className="topbar-greeting">
          {t('topbar.welcome')} <strong>{displayName}</strong>
        </span>
      </div>
      <div className="topbar-right">
        <UpdateManager compact />
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
        <button className="topbar-logout" onClick={onLogout}>{t('topbar.logout')}</button>
      </div>
    </header>
  )
}
