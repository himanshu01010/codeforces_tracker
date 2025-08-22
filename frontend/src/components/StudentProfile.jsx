import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Trophy, Target, TrendingUp } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import ContestHistory from './ContestHistory'
import ProblemSolvingData from './ProblemSolvingData'

const StudentProfile = () => {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [contests, setContests] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('contests')
  const [contestPeriod, setContestPeriod] = useState(365)
  const [statsPeriod, setStatsPeriod] = useState(90)
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";


  useEffect(() => {
    fetchStudentProfile()
  }, [id, contestPeriod])

  useEffect(() => {
    if (activeTab === 'problems') {
      fetchStats()
    }
  }, [statsPeriod, activeTab])

  const fetchStudentProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/students/${id}/profile?period=${contestPeriod}`)
      setStudent(response.data.student)
      setContests(response.data.contests)
      setSubmissions(response.data.submissions)
    } catch (error) {
      toast.error('Failed to fetch student profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/students/${id}/stats?period=${statsPeriod}`)
      setStats(response.data)
    } catch (error) {
      toast.error('Failed to fetch statistics')
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 2400) return 'text-red-600'
    if (rating >= 2100) return 'text-orange-600'
    if (rating >= 1900) return 'text-purple-600'
    if (rating >= 1600) return 'text-blue-600'
    if (rating >= 1400) return 'text-cyan-600'
    if (rating >= 1200) return 'text-green-600'
    return 'text-gray-600'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Student not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          ← Back to Students
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">@{student.codeforcesHandle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Rating</p>
              <p className={`text-2xl font-bold ${getRatingColor(student.currentRating)}`}>
                {student.currentRating}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Max Rating</p>
              <p className={`text-2xl font-bold ${getRatingColor(student.maxRating)}`}>
                {student.maxRating}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {contests.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {student.lastUpdated ? formatDate(student.lastUpdated) : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('contests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contests'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Contest History
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'problems'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Problem Solving Data
          </button>
        </nav>
      </div>

      <div className="min-h-96">
        {activeTab === 'contests' && (
          <ContestHistory
            contests={contests}
            period={contestPeriod}
            onPeriodChange={setContestPeriod}
          />
        )}
        
        {activeTab === 'problems' && (
          <ProblemSolvingData
            stats={stats}
            period={statsPeriod}
            onPeriodChange={setStatsPeriod}
            submissions={submissions}
          />
        )}
      </div>
    </div>
  )
}

export default StudentProfile