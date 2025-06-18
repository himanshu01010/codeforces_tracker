import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Code, Users, Settings } from 'lucide-react'

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Codeforces Tracker
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Students</span>
            </Link>
            
            <Link
              to="/settings"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/settings')
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>

        <div className="md:hidden pb-4">
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Students</span>
            </Link>
            
            <Link
              to="/settings"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/settings')
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar