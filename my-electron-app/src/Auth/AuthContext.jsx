// AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react'
import { supabase } from './SupabaseClient'

export const AuthContext = createContext() // ✅ export here

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('supabase_session'))
    if (session?.access_token) {
      supabase.auth.setSession(session)
      setUser(session.user)
    }
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    localStorage.setItem('supabase_session', JSON.stringify(data.session))
    setUser(data.user)
    return data.user
  }

  const signup = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp(
      { email, password },
      { data: { full_name: name, role: 'admin' } } // always assign user role
    )
    if (error) throw error
    localStorage.setItem('supabase_session', JSON.stringify(data.session))
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('supabase_session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}