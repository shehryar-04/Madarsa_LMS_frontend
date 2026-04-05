import React from 'react'

export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="dash-search-wrap">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="dash-search"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
