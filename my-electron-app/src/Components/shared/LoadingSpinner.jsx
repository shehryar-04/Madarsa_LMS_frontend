import React from 'react'

export default function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="dash-loading">
      <div className="spinner" />
      {message}
    </div>
  )
}
