const { contextBridge, ipcRenderer } = require('electron')

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
