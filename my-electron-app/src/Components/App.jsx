import React from 'react'
import { AuthProvider } from '../Auth/AuthContext'
import { LabelsProvider } from '../hooks/useUiLabels'
import { ReportConfigProvider } from '../hooks/useReportConfig'
import AuthForm from '../Auth/AuthForm'

export default function App() {
  return (
    <LabelsProvider>
      <ReportConfigProvider>
        <AuthProvider>
          <AuthForm />
        </AuthProvider>
      </ReportConfigProvider>
    </LabelsProvider>
  )
}