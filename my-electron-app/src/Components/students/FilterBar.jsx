import React from 'react'
import { STUDENT_TYPES } from '../../constants/student'

export default function FilterBar({ filterType, filterDistrict, filterYear, districtOptions, yearOptions, onChange, onClear }) {
  return (
    <div className="filter-bar">
      <div className="filter-field">
        <span>Student Type</span>
        <select value={filterType} onChange={e => onChange('type', e.target.value)}>
          <option value="">All Types</option>
          {STUDENT_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>
      </div>

      <div className="filter-field">
        <span>District</span>
        <select value={filterDistrict} onChange={e => onChange('district', e.target.value)}>
          <option value="">All Districts</option>
          {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="filter-field">
        <span>Entry Year</span>
        <select value={filterYear} onChange={e => onChange('year', e.target.value)}>
          <option value="">All Years</option>
          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <button className="clear-filters-btn" onClick={onClear}>✕ Clear</button>
    </div>
  )
}
