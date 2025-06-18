import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Calendar, Target, TrendingUp, Award } from 'lucide-react'

const ProblemSolvingData = ({ stats, period, onPeriodChange, submissions }) => {
  const formatRatingBuckets = (buckets) => {
    if (!buckets) return []

    return Object.entries(buckets)
      .map(([rating, count]) => ({
        rating: rating === '0' ? 'Unrated' : `${rating}+`,
        count
      }))
      .sort((a, b) => {
        if (a.rating === 'Unrated') return -1
        if (b.rating === 'Unrated') return 1
        return parseInt(a.rating) - parseInt(b.rating)
      })
  }

  const generateHeatmapData = (heatmapData) => {
    if (!heatmapData) return []

    const today = new Date()
    const days = []

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      days.push({
        date: dateStr,
        count: heatmapData[dateStr] || 0,
        day: new Date(dateStr).getDay(),
        week: Math.floor(i / 7)
      })
    }

    return days
  }

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700'
    if (count === 1) return 'bg-green-200 dark:bg-green-500'
    if (count <= 3) return 'bg-green-300 dark:bg-green-400'
    if (count <= 5) return 'bg-green-400 dark:bg-green-300'
    return 'bg-green-500 dark:bg-green-200'
  }

  const heatmapData = generateHeatmapData(stats?.heatmapData)
  const ratingBucketData = formatRatingBuckets(stats?.ratingBuckets)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Problem Solving Analytics</h3>
        <div className="flex space-x-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => onPeriodChange(days)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                period === days
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {!stats ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No problem solving data found for this period</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Problems',
                value: stats.totalProblems,
                icon: <Target className="h-6 w-6 text-blue-600" />,
                bg: 'bg-blue-100 dark:bg-blue-900'
              },
              {
                title: 'Avg Rating',
                value: stats.avgRating,
                icon: <TrendingUp className="h-6 w-6 text-green-600" />,
                bg: 'bg-green-100 dark:bg-green-900'
              },
              {
                title: 'Per Day',
                value: stats.avgProblemsPerDay,
                icon: <Calendar className="h-6 w-6 text-purple-600" />,
                bg: 'bg-purple-100 dark:bg-purple-900'
              },
              {
                title: 'Hardest',
                value: stats.mostDifficult?.rating || 'N/A',
                icon: <Award className="h-6 w-6 text-orange-600" />,
                bg: 'bg-orange-100 dark:bg-orange-900'
              }
            ].map((item, idx) => (
              <div key={idx} className="card p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${item.bg}`}>{item.icon}</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {stats.mostDifficult && (
            <div className="card p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Most Difficult Problem Solved</h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-white">{stats.mostDifficult.name}</h5>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Rating: {stats.mostDifficult.rating}</span>
                  {stats.mostDifficult.tags && (
                    <span>Tags: {stats.mostDifficult.tags.join(', ')}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Problems by Rating</h4>
            {ratingBucketData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingBucketData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="rating" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available</p>
            )}
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Submission Activity (Last 90 Days)</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
                </div>
                <span>More</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="flex gap-1">
                {[...Array(13)].map((_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {heatmapData
                      .filter((d) => d.week === weekIdx)
                      .map((day, idx) => (
                        <div
                          key={idx}
                          className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count)}`}
                          title={`${day.date}: ${day.count} submissions`}
                        ></div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Recent Submissions</h4>
            </div>

            {submissions.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {submissions.slice(0, 10).map((submission) => (
                  <div key={submission._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                          {submission.problem.name}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(submission.submissionDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {submission.problem.rating || 'Unrated'}
                        </span>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                          submission.verdict === 'OK'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {submission.verdict}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No submissions found for this period</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ProblemSolvingData
