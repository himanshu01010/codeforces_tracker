import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Download, RefreshCw, Eye, Mail, MailX, Users } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import StudentModal from './StudentModel'
import Pagination from './Pagination'
import SearchSort from './SearchSort'

const StudentTable = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [syncing, setSyncing] = useState(false)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, sortBy, sortOrder])

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: debouncedSearch,
        sortBy,
        sortOrder
      })

      const response = await axios.get(`/api/students?${params}`)
      const data = response.data

      setStudents(data.students)
      setTotalPages(data.pagination.totalPages)
      setTotalStudents(data.pagination.totalStudents)
    } catch (error) {
      toast.error('Failed to fetch students')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, debouncedSearch, sortBy, sortOrder])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleAddStudent = () => {
    setEditingStudent(null)
    setModalOpen(true)
  }

  const handleEditStudent = (student) => {
    setEditingStudent(student)
    setModalOpen(true)
  }

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return

    try {
      await axios.delete(`${API_BASE}/api/students/${id}`)
      toast.success('Student deleted successfully')
      
     
      if (students.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        fetchStudents()
      }
    } catch (error) {
      toast.error('Failed to delete student')
    }
  }

  const handleSyncAll = async () => {
    setSyncing(true)
    try {
      await axios.post(`${API_BASE}/api/sync/all`)
      toast.success('All student data synced successfully')
      fetchStudents()
    } catch (error) {
      toast.error('Failed to sync student data')
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncStudent = async (id) => {
    try {
      await axios.post(`${API_BASE}/api/sync/student/${id}`)
      toast.success('Student data synced successfully')
      fetchStudents()
    } catch (error) {
      toast.error('Failed to sync student data')
    }
  }

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/students/download/csv`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'students.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('CSV downloaded successfully')
    } catch (error) {
      toast.error('Failed to download CSV')
    }
  }

  const handleToggleEmail = async (student) => {
    try {
      await axios.put(`${API_BASE}/api/students/${student._id}`, {
        ...student,
        emailEnabled: !student.emailEnabled
      })
      toast.success(`Email notifications ${!student.emailEnabled ? 'enabled' : 'disabled'}`)
      fetchStudents()
    } catch (error) {
      toast.error('Failed to update email settings')
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
  }

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRatingColor = (rating) => {
    if (rating >= 2400) return 'text-red-600 font-bold'
    if (rating >= 2100) return 'text-orange-600 font-semibold'
    if (rating >= 1900) return 'text-purple-600 font-semibold'
    if (rating >= 1600) return 'text-blue-600 font-semibold'
    if (rating >= 1400) return 'text-cyan-600'
    if (rating >= 1200) return 'text-green-600'
    return 'text-gray-600'
  }

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track Codeforces progress of {totalStudents} students
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync All'}</span>
          </button>
          
          <button
            onClick={handleDownloadCSV}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </button>
          
          <button
            onClick={handleAddStudent}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>


      <SearchSort
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        totalResults={totalStudents}
      />
      <div className="card overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Codeforces
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ratings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{student.email}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{student.phone}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.codeforcesHandle}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <button
                        onClick={() => handleToggleEmail(student)}
                        className={`p-1 rounded ${
                          student.emailEnabled 
                            ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900' 
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={`Email notifications ${student.emailEnabled ? 'enabled' : 'disabled'}`}
                      >
                        {student.emailEnabled ? <Mail className="h-4 w-4" /> : <MailX className="h-4 w-4" />}
                      </button>
                      {student.emailsSent > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {student.emailsSent} emails sent
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getRatingColor(student.currentRating)}`}>
                      Current: {student.currentRating}
                    </div>
                    <div className={`text-sm ${getRatingColor(student.maxRating)}`}>
                      Max: {student.maxRating}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {student.lastUpdated ? formatDate(student.lastUpdated) : 'Never'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/student/${student._id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleSyncStudent(student._id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Sync Data"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Edit Student"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteStudent(student._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {students.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {searchQuery ? (
                <>
                  <p className="text-lg font-medium">No students found</p>
                  <p className="mt-1">Try adjusting your search criteria</p>
                  <button
                    onClick={() => handleSearchChange('')}
                    className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">No students found</p>
                  <p className="mt-1">Get started by adding your first student</p>
                </>
              )}
            </div>
          </div>
        )}


        {totalStudents > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalStudents}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
      
      {modalOpen && (
        <StudentModal
          student={editingStudent}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false)
            fetchStudents()
          }}
        />
      )}
    </div>
  )
}

export default StudentTable;