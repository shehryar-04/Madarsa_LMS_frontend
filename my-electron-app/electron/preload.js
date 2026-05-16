const { contextBridge, ipcRenderer } = require('electron')

// ── Local Database API ────────────────────────────────────────────────────────

contextBridge.exposeInMainWorld('localDb', {
  upsertStudents:     (rows)    => ipcRenderer.invoke('db:upsertStudents', rows),
  getAllStudents:      ()        => ipcRenderer.invoke('db:getAllStudents'),
  searchStudents:     (term)    => ipcRenderer.invoke('db:searchStudents', term),
  filterStudents:     (filters) => ipcRenderer.invoke('db:filterStudents', filters),
  deleteStudent:      (id)      => ipcRenderer.invoke('db:deleteStudent', id),

  upsertSanadRecords: (rows)    => ipcRenderer.invoke('db:upsertSanadRecords', rows),
  getAllSanadRecords:  ()        => ipcRenderer.invoke('db:getAllSanadRecords'),

  upsertRooms:        (rows)    => ipcRenderer.invoke('db:upsertRooms', rows),
  getAllRooms:         ()        => ipcRenderer.invoke('db:getAllRooms'),

  getLastSyncTime:    ()        => ipcRenderer.invoke('db:getLastSyncTime'),
  setLastSyncTime:    (iso)     => ipcRenderer.invoke('db:setLastSyncTime', iso),
  openBackupFolder:   ()        => ipcRenderer.invoke('db:openBackupFolder'),
})

// ── Auto-Updater API ──────────────────────────────────────────────────────────

contextBridge.exposeInMainWorld('updater', {
  /** Check for available updates */
  checkForUpdates: ()  => ipcRenderer.invoke('updater:check'),

  /** Start downloading the available update */
  downloadUpdate:  ()  => ipcRenderer.invoke('updater:download'),

  /** Install downloaded update (backs up data first, then restarts) */
  installUpdate:   ()  => ipcRenderer.invoke('updater:install'),

  /** Get current app version string */
  getVersion:      ()  => ipcRenderer.invoke('updater:getVersion'),

  /** Subscribe to updater status events from main process */
  onStatus: (callback) => {
    const handler = (_event, data) => callback(data)
    ipcRenderer.on('updater:status', handler)
    // Return unsubscribe function
    return () => ipcRenderer.removeListener('updater:status', handler)
  },
})
