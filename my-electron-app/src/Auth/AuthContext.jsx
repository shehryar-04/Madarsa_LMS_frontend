// AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react'
import { supabase } from './SupabaseClient'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Helper: fetch fresh user + role from DB
  const fetchFreshUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    // If role is stored in a separate 'profiles' table, fetch it too.
    // Remove this block if your role lives in auth.users user_metadata instead.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profileError && profile) {
      return { ...user, role: profile.role }
    }

    // Fallback: role from user_metadata (set during signup)
    return { ...user, role: user.user_metadata?.role ?? null }
  }

  useEffect(() => {
    // ✅ On every app open: wipe any saved session — login is always required
    const clearAndInit = async () => {
      try {
        // Sign out from Supabase (clears server-side session too)
        await supabase.auth.signOut()

        // Clear all Supabase keys from localStorage so nothing is cached between opens
        Object.keys(localStorage)
          .filter(key => key.startsWith('sb-'))
          .forEach(key => localStorage.removeItem(key))
      } catch (err) {
        console.error('Failed to clear session on startup:', err)
      } finally {
        setUser(null)
        setLoading(false) // always unblocks the UI regardless of errors
      }
    }

    clearAndInit()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Fetch fresh user with latest role from DB
    const freshUser = await fetchFreshUser()
    setUser(freshUser)
    return freshUser
  }

  const signup = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role: 'admin' }
      }
    })
    if (error) throw error

    const freshUser = await fetchFreshUser()
    setUser(freshUser)
    return freshUser
  }

  const logout = async () => {
    await supabase.auth.signOut()

    // Clear all cached Supabase keys on explicit logout too
    Object.keys(localStorage)
      .filter(key => key.startsWith('sb-'))
      .forEach(key => localStorage.removeItem(key))

    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}