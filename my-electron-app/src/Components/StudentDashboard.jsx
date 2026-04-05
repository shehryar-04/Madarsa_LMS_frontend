import React, { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../Auth/SupabaseClient'

import Sidebar from './layout/Sidebar'
import Topbar from './layout/Topbar'
import Alert from './shared/Alert'

import DashboardSection from './dashboard/DashboardSection'
import AddStudentSection from './students/AddStudentSection'
import AllStudentsSection from './students/AllStudentsSection'
import StudentModal from './students/StudentModal'
import SanadDashboard from './sanad/SanadDashboard'
import ReportModal from './pdf/ReportModal'
import RoomsDashboard from './rooms/RoomsDashboard'

import { useStudentData } from '../hooks/useStudentData'
import { useStudentForm, useStudentEdit } from '../hooks/useStudentForm'
import { usePdfReport } from '../hooks/usePdfReport'
import { useRooms } from '../hooks/useRooms'

import './Dashboard.css'

export default function StudentDashboard({ user, onLogout }) {
  // ── UI state ──
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // ── Role ──
  const [dbRole, setDbRole] = useState(null)
  const isAdmin = dbRole === 'admin' || user?.user_metadata?.role === 'admin' || user?.role === 'admin'

  // ── Search & filter state ──
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const searchTimer = useRef(null)

  const filters = { appliedSearch, filterType, filterDistrict, filterYear }

  // ── Data hook ──
  const {
    stats, recentStudents, statsLoading,
    students, totalStudents, listLoading,
    districtOptions, yearOptions,
    error: dataError, setError: setDataError,
    fetchDashboardStats, fetchFilterOptions,
    fetchStudentPage, buildFilteredQuery,
  } = useStudentData()

  // ── Global error/success (merged from form hooks) ──
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ── Add student form ──
  const {
    form, handleChange, handleFileChange, handleSubmit,
    error: addError, success: addSuccess,
  } = useStudentForm({
    onSuccess: () => {
      fetchDashboardStats()
      fetchFilterOptions()
      setCurrentPage(1)
      setAppliedSearch('')
      setSearchQuery('')
      setActiveSection('allStudents')
    },
  })

  // ── Edit student form ──
  const {
    editForm, setEditForm,
    handleEditChange, handleEditFileChange, handleUpdate,
    error: editError, success: editSuccess,
  } = useStudentEdit({
    onSuccess: () => {
      setSelectedStudent(null)
      fetchDashboardStats()
      fetchFilterOptions()
      fetchStudentPage(currentPage, filters)
    },
  })

  // ── PDF report ──
  const {
    pdfLoading, showReportModal, setShowReportModal,
    selectedFields, setSelectedFields, generatePDF,
  } = usePdfReport({ buildFilteredQuery, filters })

  // ── Rooms (for room dropdown in student form) ──
  const { rooms, fetchRooms } = useRooms()
  useEffect(() => { fetchRooms() }, [fetchRooms])

  // ── Merge errors/successes from sub-hooks ──
  useEffect(() => {
    setError(addError || editError || dataError || '')
  }, [addError, editError, dataError])

  useEffect(() => {
    setSuccess(addSuccess || editSuccess || '')
  }, [addSuccess, editSuccess])

  // ── Fetch user role ──
  useEffect(() => {
    if (!user?.id) return
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => { if (data) setDbRole(data.role) })
      .catch(err => console.error('Error fetching role:', err))
  }, [user?.id])

  // ── Initial data load ──
  useEffect(() => {
    fetchDashboardStats()
    fetchFilterOptions()
  }, [fetchDashboardStats, fetchFilterOptions])

  // ── Fetch student page when section/filters/page change ──
  useEffect(() => {
    if (activeSection === 'allStudents') {
      fetchStudentPage(currentPage, filters)
    }
  }, [activeSection, currentPage, appliedSearch, filterType, filterDistrict, filterYear])

  // ── Search debounce ──
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1)
      setAppliedSearch(value)
    }, 400)
  }

  // ── Filter change handler ──
  const handleFilterChange = (key, value) => {
    if (key === 'type') setFilterType(value)
    if (key === 'district') setFilterDistrict(value)
    if (key === 'year') setFilterYear(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilterType('')
    setFilterDistrict('')
    setFilterYear('')
    setSearchQuery('')
    setAppliedSearch('')
    setCurrentPage(1)
  }

  // ── PDF field toggle ──
  const toggleReportField = (key) => {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    )
  }

  return (
    <div className={`dash-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />

      <div className="dash-main-area">
        <Topbar user={user} dbRole={dbRole} onLogout={onLogout} />

        <main className="dash-main-content">
          <Alert error={error} success={success} />

          {activeSection === 'dashboard' && (
            <DashboardSection
              stats={stats}
              recentStudents={recentStudents}
              loading={statsLoading}
              onRefresh={fetchDashboardStats}
              onStudentClick={setSelectedStudent}
            />
          )}

          {activeSection === 'addStudent' && (
            <AddStudentSection
              form={form}
              onChange={handleChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmit}
            />
          )}

          {activeSection === 'allStudents' && (
            <AllStudentsSection
              students={students}
              totalStudents={totalStudents}
              loading={listLoading}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              filterType={filterType}
              filterDistrict={filterDistrict}
              filterYear={filterYear}
              districtOptions={districtOptions}
              yearOptions={yearOptions}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(f => !f)}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onStudentClick={setSelectedStudent}
              onOpenReport={() => setShowReportModal(true)}
              pdfLoading={pdfLoading}
            />
          )}

          {activeSection === 'sanadRecords' && <SanadDashboard user={user} />}
          {activeSection === 'rooms' && <RoomsDashboard user={user} />}
        </main>
      </div>

      {/* Student detail / edit modal */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          isAdmin={isAdmin}
          editForm={editForm}
          rooms={rooms}
          onClose={() => { setSelectedStudent(null); setEditForm(null) }}
          onEdit={() => setEditForm({ ...selectedStudent })}
          onEditChange={handleEditChange}
          onEditFileChange={handleEditFileChange}
          onUpdate={handleUpdate}
        />
      )}

      {/* PDF report field selector */}
      {showReportModal && (
        <ReportModal
          selectedFields={selectedFields}
          onToggleField={toggleReportField}
          onGenerate={() => generatePDF(setDataError)}
          onClose={() => setShowReportModal(false)}
          loading={pdfLoading}
        />
      )}
    </div>
  )
}
