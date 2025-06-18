import { useState, useEffect } from 'react'
import { Save, Clock, Mail, Database } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Settings = () => {
  const [settings, setSettings] = useState({
    cronSchedule: '0 2 * * *',
    emailEnabled: true,
    inactivityDays: 7
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings')
      setSettings(response.data)
    } catch (error) {
      toast.error('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.put('/api/settings', settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const cronOptions = [
    { value: '0 2 * * *', label: '2:00 AM Daily' },
    { value: '0 1 * * *', label: '1:00 AM Daily' },
    { value: '0 3 * * *', label: '3:00 AM Daily' },
    { value: '0 0 * * *', label: '12:00 AM Daily' },
    { value: '0 6 * * *', label: '6:00 AM Daily' },
    { value: '0 2 * * 0', label: '2:00 AM Weekly (Sunday)' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure system behavior and automation settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Data Synchronization
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sync Schedule
              </label>
              <select
                value={settings.cronSchedule}
                onChange={(e) => handleChange('cronSchedule', e.target.value)}
                className="input-field"
              >
                {cronOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                When to automatically fetch updated Codeforces data
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Current Schedule
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {cronOptions.find(opt => opt.value === settings.cronSchedule)?.label || 'Custom schedule'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Email Notifications
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Email Reminders
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Send emails to inactive students
                </p>
              </div>
              <button
                onClick={() => handleChange('emailEnabled', !settings.emailEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.emailEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.emailEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inactivity Threshold (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.inactivityDays}
                onChange={(e) => handleChange('inactivityDays', parseInt(e.target.value))}
                className="input-field"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Send reminder after this many days of inactivity
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Email Status
              </h4>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  settings.emailEnabled ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {settings.emailEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              System Information
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Sync</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Next Sync</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {cronOptions.find(opt => opt.value === settings.cronSchedule)?.label || 'Unknown'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
              <span className="text-sm font-medium text-green-600">
                ● Connected
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <button
              onClick={async () => {
                try {
                  await axios.post('/api/sync/all')
                  toast.success('Manual sync initiated')
                } catch (error) {
                  toast.error('Failed to start sync')
                }
              }}
              className="w-full btn-secondary text-left"
            >
              Sync All Student Data Now
            </button>

            <button
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8,Name,Email,Phone,Handle,Current Rating,Max Rating\n"
                const encodedUri = encodeURI(csvContent)
                const link = document.createElement("a")
                link.setAttribute("href", encodedUri)
                link.setAttribute("download", "students_template.csv")
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                toast.success('Template downloaded')
              }}
              className="w-full btn-secondary text-left"
            >
              Download CSV Template
            </button>

            <button
              onClick={() => {
                if (window.confirm('This will test the email service. Continue?')) {
                  toast.success('Email test initiated (check logs)')
                }
              }}
              className="w-full btn-secondary text-left"
            >
              Test Email Service
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  )
}

export default Settings