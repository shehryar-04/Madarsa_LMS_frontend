/**
 * db.cjs — Local JSON-based backup storage
 * No native modules, no compilation needed.
 * Data is stored as JSON files in the user's AppData folder.
 */

const fs   = require('fs')
const path = require('path')
const { app } = require('electron')

function getBackupDir() {
  const dir = path.join(app.getPath('userData'), 'backup')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function filePath(name) {
  return path.join(getBackupDir(), `${name}.json`)
}

// ── Generic read/write ────────────────────────────────

function readTable(name) {
  const fp = filePath(name)
  if (!fs.existsSync(fp)) return []
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'))
  } catch {
    return []
  }
}

function writeTable(name, rows) {
  fs.writeFileSync(filePath(name), JSON.stringify(rows, null, 2), 'utf8')
}

// ── Upsert helpers (merge by id) ──────────────────────

function upsertRows(name, incoming) {
  const existing = readTable(name)
  const map = {}
  for (const row of existing) map[row.id] = row
  for (const row of incoming) map[row.id] = row
  writeTable(name, Object.values(map))
}

// ── Students ──────────────────────────────────────────

function upsertStudents(rows)  { upsertRows('students', rows) }
function getAllStudents()       { return readTable('students') }

function searchStudents(term) {
  if (!term) return getAllStudents()
  const t = term.toLowerCase()
  return getAllStudents().filter(s =>
    (s.name        || '').toLowerCase().includes(t) ||
    (s.father_name || '').toLowerCase().includes(t) ||
    (s.cnic        || '').toLowerCase().includes(t) ||
    (s.district    || '').toLowerCase().includes(t)
  )
}

function filterStudents({ filterType, filterDistrict, filterYear, filterRoom } = {}) {
  let rows = getAllStudents()
  if (filterType)     rows = rows.filter(s => s.student_type === filterType)
  if (filterDistrict) rows = rows.filter(s => (s.district    || '').toLowerCase() === filterDistrict.toLowerCase())
  if (filterYear)     rows = rows.filter(s => String(s.entry_year || '').startsWith(filterYear))
  if (filterRoom)     rows = rows.filter(s => s.room_number === filterRoom)
  return rows
}

function deleteStudent(id) {
  writeTable('students', getAllStudents().filter(s => s.id !== id))
}

// ── Sanad Records ─────────────────────────────────────

function upsertSanadRecords(rows) { upsertRows('sanad_records', rows) }
function getAllSanadRecords()      { return readTable('sanad_records') }

// ── Rooms ─────────────────────────────────────────────

function upsertRooms(rows) { upsertRows('rooms', rows) }
function getAllRooms()      { return readTable('rooms') }

// ── Meta ──────────────────────────────────────────────

function getLastSyncTime() {
  const fp = filePath('last_sync')
  if (!fs.existsSync(fp)) return null
  try { return fs.readFileSync(fp, 'utf8').trim() } catch { return null }
}

function setLastSyncTime(iso) {
  fs.writeFileSync(filePath('last_sync'), iso, 'utf8')
}

function getBackupPath() {
  return getBackupDir()
}

module.exports = {
  upsertStudents, getAllStudents, searchStudents, filterStudents, deleteStudent,
  upsertSanadRecords, getAllSanadRecords,
  upsertRooms, getAllRooms,
  getLastSyncTime, setLastSyncTime, getBackupPath,
}
