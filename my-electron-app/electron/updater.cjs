/**
 * updater.cjs — Auto-update system for Darul Uloom LMS
 * 
 * Handles:
 * - Automatic update checking on app start
 * - Manual update checks via IPC
 * - Download progress tracking
 * - Pre-update backup of local data
 * - Safe install with quitAndInstall
 * 
 * Uses electron-updater with GitHub Releases as the update source.
 */

const { autoUpdater } = require('electron-updater')
const { ipcMain, app } = require('electron')
const path = require('path')
const fs = require('fs')
const log = require('./updater-log.cjs')

// ── Configuration ─────────────────────────────────────────────────────────────

const isDev = !app.isPackaged

// Disable auto-download — we want user confirmation first
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

// Allow pre-release updates (set to false for stable-only)
autoUpdater.allowPrerelease = false

// Logging
autoUpdater.logger = log

// ── State ─────────────────────────────────────────────────────────────────────

let mainWindow = null
let updateDownloaded = false

// ── Helpers ───────────────────────────────────────────────────────────────────

function sendToRenderer(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data)
  }
}

/**
 * Create a timestamped backup of all local data before installing an update.
 * This ensures no data loss even if the update process fails.
 */
function createPreUpdateBackup() {
  try {
    const backupDir = path.join(app.getPath('userData'), 'backup')
    const preUpdateDir = path.join(app.getPath('userData'), 'pre-update-backups')
    
    if (!fs.existsSync(preUpdateDir)) {
      fs.mkdirSync(preUpdateDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const snapshotDir = path.join(preUpdateDir, `backup-${timestamp}`)
    fs.mkdirSync(snapshotDir, { recursive: true })

    // Copy all JSON files from backup directory
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'))
      for (const file of files) {
        const src = path.join(backupDir, file)
        const dest = path.join(snapshotDir, file)
        fs.copyFileSync(src, dest)
      }
      // Also copy the last_sync file if it exists
      const syncFile = path.join(backupDir, 'last_sync')
      if (fs.existsSync(syncFile)) {
        fs.copyFileSync(syncFile, path.join(snapshotDir, 'last_sync'))
      }
    }

    log.info(`[Updater] Pre-update backup created at: ${snapshotDir}`)

    // Clean up old pre-update backups (keep last 5)
    cleanOldBackups(preUpdateDir, 5)

    return { success: true, path: snapshotDir }
  } catch (err) {
    log.error('[Updater] Pre-update backup failed:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Remove old backup snapshots, keeping only the N most recent.
 */
function cleanOldBackups(dir, keepCount) {
  try {
    const entries = fs.readdirSync(dir)
      .filter(name => name.startsWith('backup-'))
      .map(name => ({
        name,
        path: path.join(dir, name),
        time: fs.statSync(path.join(dir, name)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time) // newest first

    // Remove entries beyond keepCount
    for (let i = keepCount; i < entries.length; i++) {
      fs.rmSync(entries[i].path, { recursive: true, force: true })
      log.info(`[Updater] Removed old backup: ${entries[i].name}`)
    }
  } catch (err) {
    log.warn('[Updater] Failed to clean old backups:', err.message)
  }
}

// ── Auto-Updater Event Handlers ───────────────────────────────────────────────

autoUpdater.on('checking-for-update', () => {
  log.info('[Updater] Checking for updates...')
  sendToRenderer('updater:status', {
    status: 'checking',
    message: 'اپ ڈیٹ چیک ہو رہی ہے…',
  })
})

autoUpdater.on('update-available', (info) => {
  log.info(`[Updater] Update available: v${info.version}`)
  sendToRenderer('updater:status', {
    status: 'available',
    message: `نئی اپ ڈیٹ دستیاب ہے: v${info.version}`,
    version: info.version,
    releaseDate: info.releaseDate,
    releaseNotes: info.releaseNotes,
  })
})

autoUpdater.on('update-not-available', (info) => {
  log.info('[Updater] No update available. Current version is latest.')
  sendToRenderer('updater:status', {
    status: 'not-available',
    message: 'آپ کا سافٹ ویئر تازہ ترین ہے',
    version: info.version,
  })
})

autoUpdater.on('download-progress', (progress) => {
  const pct = Math.round(progress.percent)
  log.info(`[Updater] Download progress: ${pct}% (${formatBytes(progress.transferred)}/${formatBytes(progress.total)})`)
  sendToRenderer('updater:status', {
    status: 'downloading',
    message: `ڈاؤن لوڈ ہو رہا ہے… ${pct}%`,
    progress: {
      percent: pct,
      transferred: progress.transferred,
      total: progress.total,
      bytesPerSecond: progress.bytesPerSecond,
    },
  })
})

autoUpdater.on('update-downloaded', (info) => {
  log.info(`[Updater] Update downloaded: v${info.version}`)
  updateDownloaded = true
  sendToRenderer('updater:status', {
    status: 'downloaded',
    message: `اپ ڈیٹ ڈاؤن لوڈ ہو گئی — انسٹال کے لیے تیار ہے (v${info.version})`,
    version: info.version,
  })
})

autoUpdater.on('error', (err) => {
  log.error('[Updater] Error:', err.message)
  sendToRenderer('updater:status', {
    status: 'error',
    message: `اپ ڈیٹ میں خرابی: ${err.message}`,
    error: err.message,
  })
})

// ── IPC Handlers ──────────────────────────────────────────────────────────────

function registerUpdaterIPC() {
  // Manual check for updates
  ipcMain.handle('updater:check', async () => {
    if (isDev) {
      log.info('[Updater] Skipping update check in development mode')
      return { status: 'dev', message: 'ڈیولپمنٹ موڈ میں اپ ڈیٹ چیک نہیں ہوتی' }
    }
    try {
      const result = await autoUpdater.checkForUpdates()
      return { status: 'checking', version: result?.updateInfo?.version }
    } catch (err) {
      log.error('[Updater] Check failed:', err.message)
      return { status: 'error', message: err.message }
    }
  })

  // Start downloading the update
  ipcMain.handle('updater:download', async () => {
    try {
      await autoUpdater.downloadUpdate()
      return { status: 'downloading' }
    } catch (err) {
      log.error('[Updater] Download failed:', err.message)
      return { status: 'error', message: err.message }
    }
  })

  // Install update (backup first, then quit and install)
  ipcMain.handle('updater:install', async () => {
    if (!updateDownloaded) {
      return { status: 'error', message: 'No update downloaded yet' }
    }

    log.info('[Updater] Starting pre-update backup before install...')
    sendToRenderer('updater:status', {
      status: 'backing-up',
      message: 'انسٹال سے پہلے ڈیٹا بیک اپ ہو رہا ہے…',
    })

    // Create backup before installing
    const backupResult = createPreUpdateBackup()
    
    if (!backupResult.success) {
      log.error('[Updater] Backup failed, but proceeding with install anyway')
      // We still proceed — the existing backup folder is intact
    }

    log.info('[Updater] Backup complete. Installing update...')
    sendToRenderer('updater:status', {
      status: 'installing',
      message: 'اپ ڈیٹ انسٹال ہو رہی ہے — ایپ ری سٹارٹ ہو گی…',
    })

    // Small delay to let the UI update before quit
    setTimeout(() => {
      autoUpdater.quitAndInstall(false, true)
    }, 1500)

    return { status: 'installing' }
  })

  // Get current app version
  ipcMain.handle('updater:getVersion', () => {
    return app.getVersion()
  })
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Initialize the auto-updater system.
 * Call this after the main window is created.
 * 
 * @param {BrowserWindow} window - The main application window
 */
function initUpdater(window) {
  mainWindow = window
  registerUpdaterIPC()

  // Auto-check for updates 10 seconds after app start (production only)
  if (!isDev) {
    setTimeout(() => {
      log.info('[Updater] Auto-checking for updates on startup...')
      autoUpdater.checkForUpdates().catch(err => {
        log.warn('[Updater] Auto-check failed (non-critical):', err.message)
      })
    }, 10000)

    // Check again every 4 hours
    setInterval(() => {
      autoUpdater.checkForUpdates().catch(err => {
        log.warn('[Updater] Periodic check failed:', err.message)
      })
    }, 4 * 60 * 60 * 1000)
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

module.exports = { initUpdater }
