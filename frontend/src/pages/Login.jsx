import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import PageWrapper from '../components/PageWrapper'

const Login = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        username: '',
        password: '',
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
            const response = await api.post('/auth/login/', formData)

            // save tokens to localStorage
            localStorage.setItem('access_token', response.data.access)
            localStorage.setItem('refresh_token', response.data.refresh)

            // redirect to dashboard
            navigate('/')
        } catch (err) {
            setError('Invalid username or password. Please try again.')
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
                        Welcome back
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
                                placeholder="Enter your username"
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
                                placeholder="Enter your password"
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition"
                            />
                        </div>

                        {/* submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/* register link */}
                    <p className="text-gray-400 text-sm text-center mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-500 hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </PageWrapper>
    )
}

export default Login