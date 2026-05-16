import React, { useState, useEffect, useCallback } from 'react'

/**
 * UpdateManager — Auto-update UI component for Electron app.
 * 
 * Shows:
 * - Current version
 * - Check for updates button
 * - Download progress bar
 * - Install & restart button
 * - Status messages in Urdu
 * 
 * Communicates with main process via window.updater API (preload bridge).
 */

const isElectron = () => typeof window !== 'undefined' && Boolean(window.updater)

const STATUS_ICONS = {
  idle: '🔄',
  checking: '🔍',
  available: '🆕',
  downloading: '⬇️',
  downloaded: '✅',
  'backing-up': '💾',
  installing: '🔧',
  'not-available': '✓',
  error: '⚠️',
  dev: 'ℹ️',
}

export default function UpdateManager({ compact = false }) {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(null)
  const [version, setVersion] = useState('')
  const [newVersion, setNewVersion] = useState('')
  const [expanded, setExpanded] = useState(false)

  // Fetch current version on mount
  useEffect(() => {
    if (!isElectron()) return
    window.updater.getVersion().then(v => setVersion(v))
  }, [])

  // Subscribe to updater events from main process
  useEffect(() => {
    if (!isElectron()) return

    const unsubscribe = window.updater.onStatus((data) => {
      setStatus(data.status)
      setMessage(data.message || '')
      if (data.progress) setProgress(data.progress)
      if (data.version) setNewVersion(data.version)

      // Auto-expand when update is available or downloading
      if (['available', 'downloading', 'downloaded'].includes(data.status)) {
        setExpanded(true)
      }
    })

    return unsubscribe
  }, [])

  const handleCheck = useCallback(async () => {
    if (!isElectron()) return
    setStatus('checking')
    setMessage('اپ ڈیٹ چیک ہو رہی ہے…')
    setProgress(null)
    await window.updater.checkForUpdates()
  }, [])

  const handleDownload = useCallback(async () => {
    if (!isElectron()) return
    setStatus('downloading')
    setProgress({ percent: 0 })
    await window.updater.downloadUpdate()
  }, [])

  const handleInstall = useCallback(async () => {
    if (!isElectron()) return
    await window.updater.installUpdate()
  }, [])

  // Don't render anything if not in Electron
  if (!isElectron()) return null

  // Compact mode: just a small indicator in the topbar
  if (compact) {
    return <CompactUpdater status={status} message={message} onClick={() => setExpanded(true)} />
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <div style={styles.headerLeft}>
          <span style={styles.icon}>{STATUS_ICONS[status] || '🔄'}</span>
          <span style={styles.title}>سافٹ ویئر اپ ڈیٹ</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.versionBadge}>v{version}</span>
          <span style={styles.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={styles.body}>
          {/* Status message */}
          {message && (
            <div style={{
              ...styles.statusMsg,
              background: status === 'error' ? '#fef2f2' : status === 'downloaded' ? '#f0fdf4' : '#f8fafc',
              color: status === 'error' ? '#dc2626' : status === 'downloaded' ? '#16a34a' : '#334155',
              borderColor: status === 'error' ? '#fecaca' : status === 'downloaded' ? '#bbf7d0' : '#e2e8f0',
            }}>
              <span>{STATUS_ICONS[status]}</span>
              <span dir="rtl" style={styles.statusText}>{message}</span>
            </div>
          )}

          {/* Progress bar */}
          {status === 'downloading' && progress && (
            <div style={styles.progressContainer}>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress.percent}%` }} />
              </div>
              <div style={styles.progressInfo}>
                <span>{progress.percent}%</span>
                {progress.total > 0 && (
                  <span style={styles.progressBytes}>
                    {formatBytes(progress.transferred)} / {formatBytes(progress.total)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={styles.actions}>
            {/* Check button — show when idle, not-available, or error */}
            {['idle', 'not-available', 'error'].includes(status) && (
              <button style={styles.btnCheck} onClick={handleCheck}>
                🔍 اپ ڈیٹ چیک کریں
              </button>
            )}

            {/* Download button — show when update is available */}
            {status === 'available' && (
              <button style={styles.btnDownload} onClick={handleDownload}>
                ⬇️ ڈاؤن لوڈ کریں (v{newVersion})
              </button>
            )}

            {/* Install button — show when download is complete */}
            {status === 'downloaded' && (
              <button style={styles.btnInstall} onClick={handleInstall}>
                🔧 انسٹال اور ری سٹارٹ
              </button>
            )}

            {/* Loading states */}
            {['checking', 'backing-up', 'installing'].includes(status) && (
              <button style={styles.btnDisabled} disabled>
                ⏳ {message}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** Compact indicator for topbar */
function CompactUpdater({ status, message, onClick }) {
  // Only show if there's something interesting
  if (['idle', 'not-available'].includes(status)) return null

  return (
    <button onClick={onClick} style={styles.compactBtn} title={message}>
      <span>{STATUS_ICONS[status]}</span>
      {status === 'available' && <span style={styles.compactDot} />}
      {status === 'downloaded' && <span style={styles.compactLabel}>اپ ڈیٹ</span>}
    </button>
  )
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// ── Styles ────────────────────────────────────────────────────────────────────

const URDU_FONT = "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif"

const styles = {
  container: {
    background: 'var(--dash-surface, #fff)',
    border: '1px solid var(--dash-border, #e2e8f0)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    userSelect: 'none',
    direction: 'rtl',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  icon: {
    fontSize: '16px',
  },
  title: {
    fontFamily: URDU_FONT,
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--dash-text-bright, #1e293b)',
    lineHeight: '1.5',
  },
  versionBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '10px',
    background: 'var(--dash-accent-light, #eff6ff)',
    color: 'var(--dash-accent, #2563eb)',
    fontFamily: 'monospace',
  },
  chevron: {
    fontSize: '10px',
    color: 'var(--dash-text, #64748b)',
  },
  body: {
    padding: '0 16px 16px',
    direction: 'rtl',
  },
  statusMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '12px',
    fontSize: '13px',
  },
  statusText: {
    fontFamily: URDU_FONT,
    lineHeight: '1.5',
  },
  progressContainer: {
    marginBottom: '12px',
  },
  progressBar: {
    height: '8px',
    background: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#64748b',
  },
  progressBytes: {
    fontFamily: 'monospace',
    fontSize: '10px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  btnCheck: {
    padding: '8px 16px',
    border: '1px solid var(--dash-border, #e2e8f0)',
    borderRadius: '8px',
    background: 'var(--dash-surface-2, #f8fafc)',
    color: 'var(--dash-text-bright, #1e293b)',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: URDU_FONT,
    cursor: 'pointer',
    lineHeight: '1.5',
  },
  btnDownload: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: URDU_FONT,
    cursor: 'pointer',
    lineHeight: '1.5',
  },
  btnInstall: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: URDU_FONT,
    cursor: 'pointer',
    lineHeight: '1.5',
    animation: 'pulse 2s infinite',
  },
  btnDisabled: {
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#f1f5f9',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: URDU_FONT,
    cursor: 'not-allowed',
    lineHeight: '1.5',
  },
  compactBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    border: '1px solid var(--dash-border, #e2e8f0)',
    borderRadius: '6px',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    position: 'relative',
  },
  compactDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#ef4444',
    position: 'absolute',
    top: '2px',
    right: '2px',
  },
  compactLabel: {
    fontFamily: URDU_FONT,
    fontSize: '11px',
    fontWeight: 600,
    color: '#16a34a',
    lineHeight: '1.4',
  },
}
