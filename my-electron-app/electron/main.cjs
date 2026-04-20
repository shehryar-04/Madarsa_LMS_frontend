const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const {
  upsertStudents, getAllStudents, searchStudents, filterStudents, deleteStudent,
  upsertSanadRecords, getAllSanadRecords,
  upsertRooms, getAllRooms,
  getLastSyncTime, setLastSyncTime, getBackupPath,
} = require('./db.cjs')

const isDev = !app.isPackaged

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    // Development — load Vite dev server
    win.loadURL('http://localhost:5173')
  } else {
    // Production — load built index.html from the app's resources
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── IPC handlers ──────────────────────────────────────────────────────────────

ipcMain.handle('db:upsertStudents',     (_, rows)    => { upsertStudents(rows);     return true })
ipcMain.handle('db:getAllStudents',     ()           => getAllStudents())
ipcMain.handle('db:searchStudents',    (_, term)    => searchStudents(term))
ipcMain.handle('db:filterStudents',    (_, filters) => filterStudents(filters))
ipcMain.handle('db:deleteStudent',     (_, id)      => { deleteStudent(id);         return true })

ipcMain.handle('db:upsertSanadRecords', (_, rows)   => { upsertSanadRecords(rows);  return true })
ipcMain.handle('db:getAllSanadRecords', ()           => getAllSanadRecords())

ipcMain.handle('db:upsertRooms',       (_, rows)    => { upsertRooms(rows);         return true })
ipcMain.handle('db:getAllRooms',       ()           => getAllRooms())

ipcMain.handle('db:getLastSyncTime',   ()           => getLastSyncTime())
ipcMain.handle('db:setLastSyncTime',   (_, iso)     => { setLastSyncTime(iso);      return true })
ipcMain.handle('db:openBackupFolder',  ()           => { shell.openPath(getBackupPath()); return true })
