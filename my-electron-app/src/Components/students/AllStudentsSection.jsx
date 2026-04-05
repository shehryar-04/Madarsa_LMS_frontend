import React from 'react'
import SearchBar from '../shared/SearchBar'
import FilterBar from './FilterBar'
import StudentTable from './StudentTable'
import Pagination from '../shared/Pagination'
import LoadingSpinner from '../shared/LoadingSpinner'
import { PAGE_SIZE } from '../../constants/student'

export default function AllStudentsSection({
  students, totalStudents, loading,
  searchQuery, onSearchChange,
  filterType, filterDistrict, filterYear,
  districtOptions, yearOptions,
  showFilters, onToggleFilters,
  onFilterChange, onClearFilters,
  currentPage, onPageChange,
  onStudentClick,
  onOpenReport, pdfLoading,
}) {
  const totalPages = Math.ceil(totalStudents / PAGE_SIZE)
  const hasActiveFilters = filterType || filterDistrict || filterYear || searchQuery

  const startRow = (currentPage - 1) * PAGE_SIZE + 1
  const endRow = Math.min(currentPage * PAGE_SIZE, totalStudents)
  const paginationInfo = totalStudents > 0
    ? `Showing ${startRow}–${endRow} of ${totalStudents.toLocaleString()} students`
    : 'No students found'

  return (
    <div className="dash-content">
      <div className="dash-header">
        <div>
          <h2 className="dash-page-title">All Students</h2>
          <p className="dash-page-subtitle">{paginationInfo}</p>
        </div>
        <div className="dash-header-actions">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search name, CNIC, district…"
          />
          <button
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={onToggleFilters}
          >
            🔧 Filters
            {hasActiveFilters && <span className="filter-dot" />}
          </button>
          <button className="pdf-btn" onClick={onOpenReport} disabled={pdfLoading}>
            {pdfLoading
              ? <><span className="spinner-sm" /> Generating…</>
              : '📥 Export PDF'
            }
          </button>
        </div>
      </div>

      {showFilters && (
        <FilterBar
          filterType={filterType}
          filterDistrict={filterDistrict}
          filterYear={filterYear}
          districtOptions={districtOptions}
          yearOptions={yearOptions}
          onChange={onFilterChange}
          onClear={onClearFilters}
        />
      )}

      <div className="dash-card">
        {loading ? (
          <LoadingSpinner message="Loading students…" />
        ) : students.length === 0 ? (
          <p className="dash-empty">No students match your search.</p>
        ) : (
          <>
            <StudentTable students={students} onRowClick={onStudentClick} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          </>
        )}
      </div>
    </div>
  )
}
