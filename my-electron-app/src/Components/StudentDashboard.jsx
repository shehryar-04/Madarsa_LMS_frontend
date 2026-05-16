import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../Auth/SupabaseClient'

import Sidebar from './layout/Sidebar'
import Topbar from './layout/Topbar'
import Alert from './shared/Alert'

import DashboardSection from './dashboard/DashboardSection'
import AddStudentSection from './students/AddStudentSection'
import EditStudentSection from './students/EditStudentSection'
import AllStudentsSection from './students/AllStudentsSection'
import StudentModal from './students/StudentModal'
import SanadDashboard from './sanad/SanadDashboard'
import RoomsDashboard from './rooms/RoomsDashboard'
import AuditDashboard from './audit/AuditDashboard'
import ClassesDashboard from './classes/ClassesDashboard'
import ResultsDashboard from './results/ResultsDashboard'
import GradingDashboard from './results/GradingDashboard'

import { useStudentData } from '../hooks/useStudentData'
import { useStudentForm, useStudentEdit } from '../hooks/useStudentForm'
import { usePdfReport } from '../hooks/usePdfReport'
import { useRooms } from '../hooks/useRooms'
import { useLocalBackup } from '../hooks/useLocalBackup'

import './Dashboard.css'

export default function StudentDashboard({ user, onLogout }) {
  // ── UI state ──
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // ── Role ──
  const [dbRole, setDbRole] = useState(null)
  const isSuperAdmin = dbRole === 'super_admin'
  const isAdmin = isSuperAdmin || dbRole === 'admin' || user?.user_metadata?.role === 'admin' || user?.role === 'admin'
  const isResultsAdmin = isSuperAdmin || dbRole === 'results_admin'

  // ── Search & filter state ──
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [filterClass, setFilterClass] = useState('')   // set when clicking a class chip
  const [filterRoom, setFilterRoom] = useState('')     // set when clicking a room card
  const [currentPage, setCurrentPage] = useState(1)
  const searchTimer = useRef(null)

  const filters = { appliedSearch, filterType: '', filterDistrict: '', filterYear: '', filterClass, filterRoom, showInactive }

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
      setEditForm(null)
      fetchDashboardStats()
      fetchFilterOptions()
      fetchStudentPage(currentPage, filters)
    },
  })

  // ── PDF report ──
  const {
    pdfLoading,
    selectedFields, setSelectedFields,
    openPreview, downloadPDF,
  } = usePdfReport({ buildFilteredQuery })

  // ── Rooms (for room dropdown in student form) ──
  const { rooms, fetchRooms } = useRooms()
  useEffect(() => { fetchRooms() }, [fetchRooms])

  // ── Local backup / offline sync ──
  const { isOnline, lastSync, syncing, syncNow } = useLocalBackup()

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

  // ── Fetch student page when section/page/search/inactive toggle change ──
  useEffect(() => {
    if (activeSection === 'allStudents') {
      fetchStudentPage(currentPage, filters)
    }
  }, [activeSection, currentPage, appliedSearch, showInactive, filterClass, filterRoom])

  // ── Search debounce ──
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1)
      setAppliedSearch(value)
    }, 400)
  }

  // ── Navigate to All Students with a class or room filter ──
  const goToStudentsByClass = (classLevel) => {
    setFilterClass(classLevel)
    setFilterRoom('')
    setCurrentPage(1)
    setActiveSection('allStudents')
  }

  const goToStudentsByRoom = (roomNumber) => {
    setFilterRoom(roomNumber)
    setFilterClass('')
    setCurrentPage(1)
    setActiveSection('allStudents')
  }

  const clearQuickFilters = () => {
    setFilterClass('')
    setFilterRoom('')
  }

  // ── Edit student — opens full-screen, not modal ──
  const handleEditClick = () => {
    setEditForm({ ...selectedStudent })
    setSelectedStudent(null)
  }

  const handleEditCancel = () => {
    setEditForm(null)
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
        isSuperAdmin={isSuperAdmin}
        isResultsAdmin={isResultsAdmin}
      />

      <div className="dash-main-area">
      <Topbar user={user} dbRole={dbRole} onLogout={onLogout}
        isOnline={isOnline} syncing={syncing} lastSync={lastSync} onSyncNow={syncNow}
      />

        <main className="dash-main-content">
          <Alert error={error} success={success} />

          {activeSection === 'dashboard' && (
            <DashboardSection
              stats={stats}
              recentStudents={recentStudents}
              loading={statsLoading}
              onRefresh={fetchDashboardStats}
              onStudentClick={setSelectedStudent}
              onClassClick={goToStudentsByClass}
            />
          )}

          {activeSection === 'addStudent' && (
            <AddStudentSection
              form={form}
              onChange={handleChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmit}
              isOnline={isOnline}
            />
          )}

          {editForm && (
            <EditStudentSection
              student={selectedStudent || editForm}
              editForm={editForm}
              onChange={handleEditChange}
              onFileChange={handleEditFileChange}
              onSubmit={handleUpdate}
              onCancel={handleEditCancel}
              rooms={rooms}
              isOnline={isOnline}
            />
          )}

          {!editForm && activeSection === 'allStudents' && (
            <AllStudentsSection
              students={students}
              totalStudents={totalStudents}
              loading={listLoading}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              showInactive={showInactive}
              onToggleInactive={() => { setShowInactive(v => !v); setCurrentPage(1) }}
              filterClass={filterClass}
              filterRoom={filterRoom}
              onClearQuickFilter={clearQuickFilters}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onStudentClick={setSelectedStudent}
              selectedFields={selectedFields}
              onToggleField={toggleReportField}
              onOpenPreview={(rf) => openPreview(setDataError, rf)}
              onDownloadPDF={() => downloadPDF(setDataError)}
              pdfLoading={pdfLoading}
              rooms={rooms}
              districtOptions={districtOptions}
              yearOptions={yearOptions}
            />
          )}

          {activeSection === 'sanadRecords' && <SanadDashboard user={user} />}
          {activeSection === 'rooms' && <RoomsDashboard user={user} onRoomClick={goToStudentsByRoom} />}
          {activeSection === 'classes' && (
            <ClassesDashboard
              isAdmin={isAdmin}
              onClassClick={(cls) => { goToStudentsByClass(cls) }}
            />
          )}
          {activeSection === 'auditLog' && isSuperAdmin && <AuditDashboard />}
          {activeSection === 'results' && <ResultsDashboard isAdmin={isResultsAdmin} />}
          {activeSection === 'grading' && <GradingDashboard isAdmin={isResultsAdmin} />}
        </main>
      </div>

      {/* Student detail modal — view only, edit opens full screen */}
      {selectedStudent && !editForm && (
        <StudentModal
          student={selectedStudent}
          isAdmin={isAdmin}
          onClose={() => setSelectedStudent(null)}
          onEdit={handleEditClick}
        />
      )}
    </div>
  )
}
