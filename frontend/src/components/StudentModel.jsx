import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const StudentModal = ({ student, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    codeforcesHandle: '',
    emailEnabled: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        codeforcesHandle: student.codeforcesHandle || '',
        emailEnabled: student.emailEnabled !== undefined ? student.emailEnabled : true
      })
    }
  }, [student])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    
    if (!formData.codeforcesHandle.trim()) {
      newErrors.codeforcesHandle = 'Codeforces handle is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      if (student) {
        await axios.put(`/api/students/${student._id}`, formData)
        toast.success('Student updated successfully')
      } else {
        await axios.post('/api/students', formData)
        toast.success('Student created successfully')
      }
      
      onSave()
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Failed to save student')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {student ? 'Edit Student' : 'Add New Student'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter student's full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="codeforcesHandle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Codeforces Handle
            </label>
            <input
              type="text"
              id="codeforcesHandle"
              name="codeforcesHandle"
              value={formData.codeforcesHandle}
              onChange={handleChange}
              className={`input-field ${errors.codeforcesHandle ? 'border-red-500' : ''}`}
              placeholder="Enter Codeforces username"
            />
            {errors.codeforcesHandle && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.codeforcesHandle}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailEnabled"
              name="emailEnabled"
              checked={formData.emailEnabled}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="emailEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable email notifications
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (student ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentModal