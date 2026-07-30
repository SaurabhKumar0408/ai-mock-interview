import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import PageWrapper from '../components/PageWrapper'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { DashboardSkeleton } from '../components/Skeleton'

const Dashboard = () => {
    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    // fetch user info and past sessions when page loads
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, sessionsRes] = await Promise.all([
                    api.get('/auth/me/'),
                    api.get('/interviews/'),
                ])
                
                setUser(userRes.data)
                setSessions(sessionsRes.data)
            } catch (err) {
                // if token expired redirect to login
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        navigate('/login')
    }

    const getTypeColor = (type) => {
        const colors = {
            hr: 'bg-green-500/10 text-green-400 border-green-500/30',
            dsa: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            system_design: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            domain: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        }
        return colors[type] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'
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

    const getScoreColor = (score) => {
        if (score >= 8) return 'text-green-400'
        if (score >= 5) return 'text-yellow-400'
        return 'text-red-400'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={null} />
                <DashboardSkeleton />
            </div>
        )
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-gray-950 text-white">

            {/* navbar */}
            <Navbar user={user} />

            <div className="max-w-5xl mx-auto px-6 py-10">

                {/* welcome + start button */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 border border-blue-500/20 rounded-2xl p-8 mb-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-white" >
                            Ready to practice?
                        </h2>
                        <p className="text-gray-800">
                            Start a mock interview and get instant AI feedback.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/setup')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition shrink-0"
                    >
                        Start Interview
                    </button>
                </div>

                {/* stats row */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                        <p className="text-3xl font-bold text-blue-400">
                            {sessions.length}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Total Sessions</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                        <p className="text-3xl font-bold text-green-400">
                            {sessions.filter(s => s.status === 'completed').length}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Completed</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                        <p className="text-3xl font-bold text-yellow-400">
                            {sessions.length > 0
                                ? Math.round(
                                    sessions
                                        .filter(s => s.overall_score)
                                        .reduce((sum, s) => sum + s.overall_score, 0) /
                                    (sessions.filter(s => s.overall_score).length || 1)
                                )
                                : 0}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Avg Score</p>
                    </div>
                </div>

                {/* past sessions */}
                <h3 className="text-xl font-semibold mb-4">Past Sessions</h3>

                {sessions.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
                        <p className="text-gray-400">No interviews yet.</p>
                        <p className="text-gray-600 text-sm mt-1">
                            Start your first interview above!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sessions.map((session) => (
                            <motion.div
                                key={session.id}
                                whileHover={{ scale: 1.01, borderColor: '#4b5563' }}
                                whileTap={{ scale: 0.99 }}
                                transition={{ duration: 0.15 }}
                                className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between cursor-pointer"
                                onClick={() => navigate(`/feedback/${session.id}`)}
                            >
                                {/* left side */}
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getTypeColor(session.interview_type)}`}>
                                        {getTypeLabel(session.interview_type)}
                                    </span>
                                    <div>
                                        <p className="text-white font-medium">
                                            {session.target_role || 'General'}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-0.5">
                                            {new Date(session.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* right side */}
                                <div className="flex items-center gap-4">
                                    {session.overall_score ? (
                                        <span className={`text-2xl font-bold ${getScoreColor(session.overall_score)}`}>
                                            {session.overall_score}/10
                                        </span>
                                    ) : (
                                        <span className="text-yellow-500 text-sm">In Progress</span>
                                    )}
                                    <span className="text-gray-600">→</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </PageWrapper>
    )
}

export default Dashboard