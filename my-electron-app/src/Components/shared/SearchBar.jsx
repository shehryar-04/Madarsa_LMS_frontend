import React from 'react'

export default function SearchBar({ value, onChange, placeholder = 'Search…', inputRef, onKeyDown }) {
  return (
    <div className="dash-search-wrap">
      <span className="search-icon">🔍</span>
      <input
        ref={inputRef}
        type="text"
        className="dash-search"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
