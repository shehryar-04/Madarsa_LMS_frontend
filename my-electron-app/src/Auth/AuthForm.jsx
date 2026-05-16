import React, { useState, useContext } from 'react'
import { AuthContext } from './AuthContext'
import { supabase } from './SupabaseClient'
import { useLabels } from '../hooks/useUiLabels'
import { useReportConfig } from '../hooks/useReportConfig'
import StudentDashboard from '../Components/StudentDashboard'
import madarsaLogo from '../assets/مونوجامعہ دارالعلوم الاسلامیہ.png'
import './Auth.css'

export default function AuthForm() {
  const { login, signup, logout, user } = useContext(AuthContext)
  const { refreshLabels } = useLabels()
  const { refreshConfigs } = useReportConfig()
  const [activeTab, setActiveTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!email || !password) { setError('Please fill in all fields'); return }
    try {
      await login(email, password)
      refreshLabels()
      refreshConfigs()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSignup = async () => {
    setError('')
    setSuccess('')
    if (!name || !email || !password) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters long'); return }
    try {
      await signup(email, password, name)
      setSuccess('Account created successfully! Please check your email to confirm.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    setSuccess('')
    if (!forgotEmail) { setError('Please enter your email'); return }
    setForgotLoading(true)
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(forgotEmail)
    setForgotLoading(false)
    if (resetErr) {
      setError(resetErr.message)
    } else {
      setSuccess('Password reset email sent! Check your inbox.')
      setForgotMode(false)
      setForgotEmail('')
    }
  }

  if (user) {
    return <StudentDashboard user={user} onLogout={logout} />
  }

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <img src={madarsaLogo} alt="دارالعلوم اسلامیہ" className="auth-logo-img" />
        <h1 className="auth-title">دارالعلوم اسلامیہ</h1>
        <p className="auth-subtitle">Student Management System</p>
      </div>

      {forgotMode ? (
        <div className="form">
          <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#555', textAlign: 'left' }}>
            Enter your email to receive a password reset link.
          </p>
          <input
            type="email"
            placeholder="Email"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
          />
          <button className="btn" onClick={handleForgotPassword} disabled={forgotLoading}>
            {forgotLoading ? 'Sending…' : 'Send Reset Email'}
          </button>
          <button
            onClick={() => { setForgotMode(false); setError(''); setSuccess('') }}
            style={{ background: 'none', border: 'none', color: '#4a90e2', cursor: 'pointer', fontSize: '14px', marginTop: '4px' }}
          >
            ← Back to Login
          </button>
        </div>
      ) : (
        <>
          <div className="tabs">
            <button className={activeTab === 'login' ? 'active' : ''} onClick={() => { setActiveTab('login'); setError(''); setSuccess('') }}>
              Login
            </button>
            <button className={activeTab === 'signup' ? 'active' : ''} onClick={() => { setActiveTab('signup'); setError(''); setSuccess('') }}>
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
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button type="button" className="show-password-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <button className="btn" onClick={handleLogin}>Login</button>
              <button
                type="button"
                onClick={() => { setForgotMode(true); setError(''); setSuccess('') }}
                style={{ background: 'none', border: 'none', color: '#4a90e2', cursor: 'pointer', fontSize: '13px', marginTop: '-4px' }}
              >
                Forgot password?
              </button>
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
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="show-password-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <button className="btn" onClick={handleSignup}>Signup</button>
            </div>
          )}
        </>
      )}

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  )
}
