import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = ({ user }) => {
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        navigate('/login')
    }

    // get initials from username
    // e.g. "john_doe" → "JD", "alice" → "A"
    const getInitials = (username) => {
        if (!username) return '?'
        const parts = username.split(/[_\s]/)
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return username[0].toUpperCase()
    }

    return (
        <nav className="border-b border-gray-800 px-6 py-4 sticky top-0 bg-gray-950 z-50">
            <div className="max-w-5xl mx-auto flex items-center justify-between">

                {/* logo */}
                <h1
                    onClick={() => navigate('/')}
                    className="text-2xl font-bold text-white cursor-pointer"
                >
                    Interview <span className="text-blue-400">AI</span>
                </h1>

                {/* right side */}
                {user ? (
                    <div className="relative">
                        {/* avatar button */}
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 hover:opacity-80 transition"
                        >
                            {/* avatar circle with initials */}
                            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                {getInitials(user.username)}
                            </div>
                            <span className="text-gray-300 text-sm hidden sm:block">
                                {user.username}
                            </span>
                            {/* arrow icon */}
                            <motion.span
                                animate={{ rotate: dropdownOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-gray-500 text-xs"
                            >
                                ▼
                            </motion.span>
                        </button>

                        {/* dropdown menu */}
                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50"
                                >
                                    {/* user info */}
                                    <div className="px-4 py-3 border-b border-gray-800">
                                        <p className="text-white text-sm font-medium">
                                            {user.username}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-0.5">
                                            {user.role}
                                        </p>
                                    </div>

                                    {/* menu items */}
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false)
                                                navigate('/')
                                            }}
                                            className="w-full text-left px-4 py-2 text-gray-300 text-sm hover:bg-gray-800 hover:text-white transition"
                                        >
                                            🏠 Dashboard
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false)
                                                navigate('/profile')
                                            }}
                                            className="w-full text-left px-4 py-2 text-gray-300 text-sm hover:bg-gray-800 hover:text-white transition"
                                        >
                                            👤 Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false)
                                                navigate('/setup')
                                            }}
                                            className="w-full text-left px-4 py-2 text-gray-300 text-sm hover:bg-gray-800 hover:text-white transition"
                                        >
                                            🎯 New Interview
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false)
                                                navigate('/analytics')
                                            }}
                                            className="w-full text-left px-4 py-2 text-gray-300 text-sm hover:bg-gray-800 hover:text-white transition"
                                        >
                                            📊 Analytics
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false)
                                                navigate('/learning')
                                            }}
                                            className="w-full text-left px-4 py-2 text-gray-300 text-sm hover:bg-gray-800 hover:text-white transition"
                                        >
                                            📚 Learning Hub
                                        </button>
                                        <div className="border-t border-gray-800 mt-1 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-red-400 text-sm hover:bg-gray-800 transition"
                                            >
                                                🚪 Logout
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* backdrop to close dropdown */}
                        {dropdownOpen && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setDropdownOpen(false)}
                            />
                        )}
                    </div>
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-800 animate-pulse" />
                )}
            </div>
        </nav>
    )
}

export default Navbar