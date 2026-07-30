import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import PageWrapper from '../components/PageWrapper'
import useUser from '../api/useUser'

const Profile = () => {
    const navigate = useNavigate()
    const user = useUser()

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'student',
        target_role: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        avgScore: 0,
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, sessionsRes] = await Promise.all([
                    api.get('/auth/me/'),
                    api.get('/interviews/'),
                ])

                const userData = userRes.data
                setFormData({
                    username: userData.username || '',
                    email: userData.email || '',
                    role: userData.role || 'student',
                    target_role: userData.target_role || '',
                })

                // calculate stats
                const sessions = sessionsRes.data
                const completed = sessions.filter(
                    s => s.status === 'completed' && s.overall_score
                )
                const avgScore = completed.length
                    ? Math.round(
                        completed.reduce((sum, s) => sum + s.overall_score, 0) /
                        completed.length
                    )
                    : 0

                setStats({
                    total: sessions.length,
                    completed: completed.length,
                    avgScore,
                })
            } catch (err) {
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setSuccess(false)
        setError('')
    }

    const handleSave = async () => {
        setSaving(true)
        setError('')
        setSuccess(false)

        try {
            await api.put('/auth/me/', formData)
            setSuccess(true)
        } catch (err) {
            const data = err.response?.data
            if (data) {
                const firstError = Object.values(data)[0]
                setError(Array.isArray(firstError) ? firstError[0] : firstError)
            } else {
                setError('Failed to save changes. Please try again.')
            }
        } finally {
            setSaving(false)
        }
    }

    const getInitials = (username) => {
        if (!username) return '?'
        const parts = username.split(/[_\s]/)
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return username[0].toUpperCase()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />
                <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-800 animate-pulse rounded-xl h-24" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />

                <div className="max-w-2xl mx-auto px-6 py-10">

                    {/* header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-1">Profile</h2>
                        <p className="text-gray-400">Manage your account details.</p>
                    </div>

                    {/* avatar + stats card */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-6">

                        {/* big avatar */}
                        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                            {getInitials(formData.username)}
                        </div>

                        {/* info + stats */}
                        <div className="flex-1">
                            <p className="text-xl font-bold text-white">
                                {formData.username}
                            </p>
                            <p className="text-gray-400 text-sm mb-4">
                                {formData.email}
                            </p>

                            {/* mini stats */}
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-2xl font-bold text-blue-400">
                                        {stats.total}
                                    </p>
                                    <p className="text-gray-500 text-xs">Sessions</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-400">
                                        {stats.completed}
                                    </p>
                                    <p className="text-gray-500 text-xs">Completed</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-yellow-400">
                                        {stats.avgScore}
                                    </p>
                                    <p className="text-gray-500 text-xs">Avg Score</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* edit form */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6">
                            Edit Profile
                        </h3>

                        {/* success message */}
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-5 text-sm">
                                ✅ Profile updated successfully!
                            </div>
                        )}

                        {/* error message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">

                            {/* username */}
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            {/* email */}
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            {/* role */}
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">
                                    I am a
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition"
                                >
                                    <option value="student">Student</option>
                                    <option value="professional">Professional</option>
                                </select>
                            </div>

                            {/* target role */}
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">
                                    Target Job Role
                                </label>
                                <input
                                    type="text"
                                    name="target_role"
                                    value={formData.target_role}
                                    onChange={handleChange}
                                    placeholder="e.g. Software Engineer, Data Analyst"
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            {/* save button */}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* danger zone */}
                    <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-6 mt-6">
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Account
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Sign out of your account on this device.
                        </p>
                        <button
                            onClick={() => {
                                localStorage.removeItem('access_token')
                                localStorage.removeItem('refresh_token')
                                navigate('/login')
                            }}
                            className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-semibold px-5 py-2 rounded-lg transition text-sm"
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
        </PageWrapper>
    )
}

export default Profile