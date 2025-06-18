import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ContestHistory = ({ contests, period, onPeriodChange }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRatingChangeColor = (change) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getRatingChangeIcon = (change) => {
    if (change > 0) return '↗'
    if (change < 0) return '↘'
    return '→'
  }

  const chartData = contests
    .slice()
    .reverse()
    .map((contest) => ({
      date: formatDate(contest.date),
      rating: contest.newRating,
      contestName: contest.contestName,
      ratingChange: contest.ratingChange
    }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contest Performance</h3>
        <div className="flex space-x-2">
          {[30, 90, 365].map((days) => (
            <button
              key={days}
              onClick={() => onPeriodChange(days)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                period === days
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {days === 365 ? '1 Year' : `${days} Days`}
            </button>
          ))}
        </div>
      </div>

      {contests.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No contest history found for this period</p>
        </div>
      ) : (
        <>
          <div className="card p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Rating Progress</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name, props) => [
                    `Rating: ${value}`,
                    props.payload.contestName
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Recent Contests</h4>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {contests.map((contest) => (
                <div key={contest._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        {contest.contestName}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatFullDate(contest.date)} • Rank: {contest.rank}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {contest.oldRating} → {contest.newRating}
                        </div>
                        <div className={`text-sm font-medium ${getRatingChangeColor(contest.ratingChange)}`}>
                          {getRatingChangeIcon(contest.ratingChange)} {Math.abs(contest.ratingChange)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ContestHistory