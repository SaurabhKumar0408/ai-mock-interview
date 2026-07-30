import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import PageWrapper from '../components/PageWrapper'

const Register = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'student',
        target_role: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await api.post('/auth/register/', formData)
            // after register redirect to login
            navigate('/login')
        } catch (err) {
            const data = err.response?.data
            // show first error message from backend
            if (data) {
                const firstError = Object.values(data)[0]
                setError(Array.isArray(firstError) ? firstError[0] : firstError)
            } else {
                setError('Something went wrong. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* logo / title */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold" style={{color: 'white'}}>
                        Interview <span style={{color: '#60a5fa'}}>AI</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Practice makes perfect</p>
                </div>

                {/* card */}
                <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
                    <h2 className="text-2xl font-semibold text-white mb-6">
                        Create account
                    </h2>

                    {/* error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

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
                                required
                                placeholder="Choose a username"
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
                                required
                                placeholder="Enter your email"
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition"
                            />
                        </div>

                        {/* password */}
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Min 6 characters"
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

                        {/* submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* login link */}
                    <p className="text-gray-400 text-sm text-center mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-500 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </PageWrapper>
    )
}

export default Register