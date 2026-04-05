import React from 'react'

export default function Alert({ error, success }) {
  return (
    <>
      {error && <div className="dash-alert dash-alert-error">{error}</div>}
      {success && <div className="dash-alert dash-alert-success">{success}</div>}
    </>
  )
}
