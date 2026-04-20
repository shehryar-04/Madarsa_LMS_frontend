/**
 * useLocalBackup.js
 *
 * Handles syncing Supabase data → local SQLite and
 * falling back to local SQLite when offline.
 *
 * Usage:
 *   const { isOnline, lastSync, syncNow } = useLocalBackup()
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../Auth/SupabaseClient'

// How often to auto-sync when online (ms)
const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

// Whether we're running inside Electron (window.localDb is injected by preload)
const isElectron = () => typeof window !== 'undefined' && Boolean(window.localDb)

/** Fetch ALL rows of a table from Supabase, paginating past the 1000-row limit */
async function fetchAllFromSupabase(table, select = '*') {
  const batchSize = 1000
  let all = []
  let page = 0
  let hasMore = true

  while (hasMore) {
    const from = page * batchSize
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + batchSize - 1)

    if (error || !data) break
    all = all.concat(data)
    hasMore = data.length === batchSize
    page++
  }
  return all
}

export function useLocalBackup() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastSync, setLastSync] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const syncTimer = useRef(null)

  // Track online/offline status
  useEffect(() => {
    const goOnline  = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  /** Pull everything from Supabase and write to local SQLite */
  const syncNow = useCallback(async () => {
    if (!isElectron() || !navigator.onLine) return
    setSyncing(true)

    try {
      const [students, sanadRecords, rooms] = await Promise.all([
        fetchAllFromSupabase('students'),
        fetchAllFromSupabase('sanad_records'),
        fetchAllFromSupabase('rooms'),
      ])

      await Promise.all([
        window.localDb.upsertStudents(students),
        window.localDb.upsertSanadRecords(sanadRecords),
        window.localDb.upsertRooms(rooms),
      ])

      const now = new Date().toISOString()
      await window.localDb.setLastSyncTime(now)
      setLastSync(now)
      console.log(`[Backup] Synced at ${now} — ${students.length} students, ${sanadRecords.length} sanad, ${rooms.length} rooms`)
    } catch (err) {
      console.error('[Backup] Sync failed:', err)
    }

    setSyncing(false)
  }, [])

  // Auto-sync on mount and whenever we come back online
  useEffect(() => {
    if (!isElectron()) return

    // Load last sync time from DB
    window.localDb.getLastSyncTime().then(t => { if (t) setLastSync(t) })

    // Sync immediately if online
    if (navigator.onLine) syncNow()

    // Periodic sync
    syncTimer.current = setInterval(() => {
      if (navigator.onLine) syncNow()
    }, SYNC_INTERVAL_MS)

    return () => clearInterval(syncTimer.current)
  }, [syncNow])

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && isElectron()) syncNow()
  }, [isOnline, syncNow])

  return { isOnline, lastSync, syncing, syncNow }
}

/**
 * Reads students from local DB (offline) or Supabase (online).
 * Falls back to local automatically.
 */
export async function readStudentsWithFallback(filters = {}) {
  if (!navigator.onLine && isElectron()) {
    const { filterType, filterDistrict, filterYear, filterRoom, appliedSearch } = filters
    if (appliedSearch) {
      return window.localDb.searchStudents(appliedSearch)
    }
    return window.localDb.filterStudents({ filterType, filterDistrict, filterYear, filterRoom })
  }
  return null // caller should use Supabase normally
}

/**
 * Call this after every successful student insert/update
 * so the local backup stays current without waiting for the next full sync.
 */
export async function backupStudentRecord(record) {
  if (!isElectron()) return
  try {
    await window.localDb.upsertStudents([record])
  } catch (err) {
    console.warn('[Backup] Failed to backup student record:', err)
  }
}

export async function backupSanadRecord(record) {
  if (!isElectron()) return
  try {
    await window.localDb.upsertSanadRecords([record])
  } catch (err) {
    console.warn('[Backup] Failed to backup sanad record:', err)
  }
}

export async function backupRoomRecord(record) {
  if (!isElectron()) return
  try {
    await window.localDb.upsertRooms([record])
  } catch (err) {
    console.warn('[Backup] Failed to backup room record:', err)
  }
}
