import { useState } from 'react'
import { Search, SortAsc, SortDesc, X } from 'lucide-react'

const SearchSort = ({ 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  sortOrder, 
  onSortChange,
  totalResults 
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    onSearchChange(localSearch)
  }

  const handleSearchClear = () => {
    setLocalSearch('')
    onSearchChange('')
  }

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'codeforcesHandle', label: 'Codeforces Handle' },
    { value: 'currentRating', label: 'Current Rating' },
    { value: 'maxRating', label: 'Max Rating' },
    { value: 'lastUpdated', label: 'Last Updated' },
    { value: 'createdAt', label: 'Date Added' }
  ]

  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
          {searchQuery && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value, sortOrder)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchSort;