import React from 'react'
import { AuthProvider } from '../Auth/AuthContext'
import AuthForm from '../Auth/AuthForm'

export default function App() {
  return (
    <AuthProvider>
      <AuthForm />
    </AuthProvider>
  )
}