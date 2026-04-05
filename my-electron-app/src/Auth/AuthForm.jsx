import React, { useState, useContext } from 'react'
import { AuthContext } from './AuthContext'
import StudentDashboard from '../Components/StudentDashboard'
import './auth.css'

export default function AuthForm() {
  const { login, signup, logout, user } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLogin = async () => {
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSignup = async () => {
    setError('')
    setSuccess('')
    if (!name || !email || !password) {
      setError('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    try {
      await signup(email, password, name)
      setSuccess('Account created successfully! Please check your email to confirm.')
    } catch (err) {
      setError(err.message)
    }
  }

  // When logged in, render the full-screen dashboard layout (no auth-container wrapper)
  if (user) {
    return (
      <StudentDashboard
        user={user}
        onLogout={logout}
      />
    )
  }

  // Login / Signup form stays centered and small
  return (
    <div className="auth-container">
      <div className="auth-logo">
        <div className="auth-logo-icon">📚</div>
        <h1 className="auth-title">Madarsa LMS</h1>
        <p className="auth-subtitle">Student Management System</p>
      </div>
      <div className="tabs">
        <button
          className={activeTab === 'login' ? 'active' : ''}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button
          className={activeTab === 'signup' ? 'active' : ''}
          onClick={() => setActiveTab('signup')}
        >
          Signup
        </button>
      </div>

      {activeTab === 'login' && (
        <div className="form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="btn" onClick={handleLogin}>Login</button>
        </div>
      )}

      {activeTab === 'signup' && (
        <div className="form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="btn" onClick={handleSignup}>Signup</button>
        </div>
      )}

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  )
}