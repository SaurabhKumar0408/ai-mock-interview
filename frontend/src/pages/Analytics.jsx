import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import PageWrapper from '../components/PageWrapper'
import useUser from '../api/useUser'

const Analytics = () => {
    const navigate = useNavigate()
    const user = useUser()

    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await api.get('/interviews/')
                setSessions(response.data)
            } catch (err) {
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }
        fetchSessions()
    }, [])

    // ── Data preparation ──

    // score trend — only completed sessions with scores
    const scoreTrendData = sessions
        .filter(s => s.status === 'completed' && s.overall_score)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((s, index) => ({
            name: `#${index + 1}`,
            score: s.overall_score,
            date: new Date(s.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
            }),
            type: s.interview_type,
        }))

    // average score by interview type
    const typeData = () => {
        const types = ['hr', 'dsa', 'system_design', 'domain']
        const labels = {
            hr: 'HR',
            dsa: 'DSA',
            system_design: 'System Design',
            domain: 'Domain',
        }
        return types.map(type => {
            const typeSessions = sessions.filter(
                s => s.interview_type === type &&
                s.status === 'completed' &&
                s.overall_score
            )
            const avg = typeSessions.length
                ? Math.round(
                    typeSessions.reduce((sum, s) => sum + s.overall_score, 0) /
                    typeSessions.length
                )
                : 0
            return {
                name: labels[type],
                avg,
                count: typeSessions.length,
            }
        }).filter(t => t.count > 0)
    }

    // best and worst sessions
    const completedSessions = sessions.filter(
        s => s.status === 'completed' && s.overall_score
    )
    const bestSession = completedSessions.reduce(
        (best, s) => s.overall_score > (best?.overall_score || 0) ? s : best,
        null
    )
    const worstSession = completedSessions.reduce(
        (worst, s) => s.overall_score < (worst?.overall_score || 11) ? s : worst,
        null
    )

    // overall stats
    const totalCompleted = completedSessions.length
    const avgScore = totalCompleted
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + s.overall_score, 0) /
            totalCompleted
        )
        : 0
    const improving = scoreTrendData.length >= 2
        ? scoreTrendData[scoreTrendData.length - 1].score >
          scoreTrendData[0].score
        : null

    const getScoreColor = (score) => {
        if (score >= 8) return '#22c55e'
        if (score >= 5) return '#eab308'
        return '#ef4444'
    }

    const getTypeLabel = (type) => {
        const labels = {
            hr: 'HR / Behavioral',
            dsa: 'DSA / Coding',
            system_design: 'System Design',
            domain: 'Domain Specific',
        }
        return labels[type] || type
    }

    // custom tooltip for line chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm">
                    <p className="text-gray-400">{data.date}</p>
                    <p className="text-white font-semibold">
                        Score: <span style={{ color: getScoreColor(data.score) }}>
                            {data.score}/10
                        </span>
                    </p>
                    <p className="text-gray-500 text-xs">{getTypeLabel(data.type)}</p>
                </div>
            )
        }
        return null
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />
                <div className="max-w-5xl mx-auto px-6 py-10 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-800 animate-pulse rounded-xl h-48" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />

                <div className="max-w-5xl mx-auto px-6 py-10">

                    {/* header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-1">
                            Analytics
                        </h2>
                        <p className="text-gray-400">
                            Track your interview performance over time.
                        </p>
                    </div>

                    {completedSessions.length === 0 ? (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
                            <p className="text-4xl mb-4">📊</p>
                            <p className="text-white font-semibold text-lg mb-2">
                                No data yet
                            </p>
                            <p className="text-gray-400 text-sm mb-6">
                                Complete at least one interview to see your analytics.
                            </p>
                            <button
                                onClick={() => navigate('/setup')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
                            >
                                Start Interview
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* stats row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                                    <p className="text-3xl font-bold text-blue-400">
                                        {sessions.length}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">Total Sessions</p>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                                    <p className="text-3xl font-bold text-green-400">
                                        {totalCompleted}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">Completed</p>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                                    <p className="text-3xl font-bold text-yellow-400">
                                        {avgScore}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">Avg Score</p>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                                    <p className="text-3xl font-bold">
                                        {improving === null ? '—' : improving ? '📈' : '📉'}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        {improving === null ? 'Need more data' : improving ? 'Improving' : 'Declining'}
                                    </p>
                                </div>
                            </div>

                            {/* score trend chart */}
                            {scoreTrendData.length >= 2 && (
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-6">
                                        Score Trend
                                    </h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={scoreTrendData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#1f2937"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#6b7280"
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                            />
                                            <YAxis
                                                domain={[0, 10]}
                                                stroke="#6b7280"
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#3b82f6"
                                                strokeWidth={2.5}
                                                dot={{ fill: '#3b82f6', r: 5 }}
                                                activeDot={{ r: 7, fill: '#60a5fa' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* performance by type chart */}
                            {typeData().length > 0 && (
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-6">
                                        Avg Score by Interview Type
                                    </h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={typeData()}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#1f2937"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#6b7280"
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                            />
                                            <YAxis
                                                domain={[0, 10]}
                                                stroke="#6b7280"
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#111827',
                                                    border: '1px solid #1f2937',
                                                    borderRadius: '12px',
                                                    color: '#fff'
                                                }}
                                            />
                                            <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                                                {typeData().map((entry, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={getScoreColor(entry.avg)}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* best and worst */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {bestSession && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                                        <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-3">
                                            🏆 Best Session
                                        </p>
                                        <p className="text-3xl font-bold text-green-400 mb-1">
                                            {bestSession.overall_score}/10
                                        </p>
                                        <p className="text-white font-medium">
                                            {getTypeLabel(bestSession.interview_type)}
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {bestSession.target_role}
                                        </p>
                                        <p className="text-gray-600 text-xs mt-2">
                                            {new Date(bestSession.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                )}
                                {worstSession && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                                        <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
                                            📉 Needs Most Improvement
                                        </p>
                                        <p className="text-3xl font-bold text-red-400 mb-1">
                                            {worstSession.overall_score}/10
                                        </p>
                                        <p className="text-white font-medium">
                                            {getTypeLabel(worstSession.interview_type)}
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {worstSession.target_role}
                                        </p>
                                        <p className="text-gray-600 text-xs mt-2">
                                            {new Date(worstSession.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PageWrapper>
    )
}

export default Analytics