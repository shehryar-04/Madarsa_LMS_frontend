/**
 * updater-log.cjs — Simple file + console logger for the auto-updater.
 * Writes to %APPDATA%/darul-uloom-lms/updater.log
 */

const fs = require('fs')
const path = require('path')
const { app } = require('electron')

const LOG_FILE = path.join(app.getPath('userData'), 'updater.log')
const MAX_LOG_SIZE = 1024 * 1024 // 1MB — rotate after this

function timestamp() {
  return new Date().toISOString()
}

function rotateIfNeeded() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const stats = fs.statSync(LOG_FILE)
      if (stats.size > MAX_LOG_SIZE) {
        const rotated = LOG_FILE + '.old'
        if (fs.existsSync(rotated)) fs.unlinkSync(rotated)
        fs.renameSync(LOG_FILE, rotated)
      }
    }
  } catch { /* ignore rotation errors */ }
}

function writeLog(level, ...args) {
  const msg = `[${timestamp()}] [${level}] ${args.join(' ')}`
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](msg)
  try {
    rotateIfNeeded()
    fs.appendFileSync(LOG_FILE, msg + '\n', 'utf8')
  } catch { /* ignore write errors */ }
}

module.exports = {
  info:  (...args) => writeLog('INFO', ...args),
  warn:  (...args) => writeLog('WARN', ...args),
  error: (...args) => writeLog('ERROR', ...args),
  debug: (...args) => writeLog('DEBUG', ...args),
}
