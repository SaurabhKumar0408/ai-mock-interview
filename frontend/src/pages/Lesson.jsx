import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import PageWrapper from '../components/PageWrapper'
import useUser from '../api/useUser'

const Lesson = () => {
    const navigate = useNavigate()
    const { topicId } = useParams()
    const user = useUser()

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const response = await api.get(`/learning/topics/${topicId}/lesson/`)
                setData(response.data)
            } catch (err) {
                setError('Failed to load lesson. Please try again.')
            } finally {
                setLoading(false)
            }
        }
        fetchLesson()
    }, [topicId])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <div className="bg-gray-800 animate-pulse rounded-2xl h-12 mb-6 w-48" />
                    <div className="bg-gray-800 animate-pulse rounded-2xl h-32 mb-4" />
                    <div className="bg-gray-800 animate-pulse rounded-2xl h-64 mb-4" />
                    <div className="bg-gray-800 animate-pulse rounded-2xl h-48" />
                    <p className="text-center text-gray-500 text-sm mt-6">
                        AI is generating your lesson, please wait...
                    </p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />
                <div className="max-w-3xl mx-auto px-6 py-10 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    const lesson = data?.lesson
    const topic = data?.topic

    return (
        <PageWrapper>
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />

                <div className="max-w-3xl mx-auto px-6 py-10">

                    {/* back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-white text-sm mb-6 block transition"
                    >
                        ← Back to Course
                    </button>

                    {/* topic title */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                Lesson
                            </span>
                            <span className="text-green-400 text-xs">
                                ✅ Completed
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">
                            {topic?.title}
                        </h2>
                    </div>

                    {/* summary card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-6"
                    >
                        <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            📋 Summary
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                            {lesson?.summary}
                        </p>
                    </motion.div>

                    {/* key points */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6"
                    >
                        <p className="text-white font-semibold mb-4">
                            🔑 Key Points
                        </p>
                        <ul className="space-y-2">
                            {lesson?.key_points?.map((point, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {point}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* explanation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6"
                    >
                        <p className="text-white font-semibold mb-4">
                            📖 Detailed Explanation
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                            {lesson?.explanation}
                        </p>
                    </motion.div>

                    {/* example */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6"
                    >
                        <p className="text-white font-semibold mb-4">
                            💡 Example
                        </p>
                        <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-mono">
                                {lesson?.example}
                            </p>
                        </div>
                    </motion.div>

                    {/* interview tips */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mb-8"
                    >
                        <p className="text-green-400 font-semibold mb-4">
                            🎯 Interview Tips
                        </p>
                        <ul className="space-y-2">
                            {lesson?.tips?.map((tip, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="text-green-400 text-sm shrink-0">
                                        ✓
                                    </span>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {tip}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* take quiz button */}
                    <button
                        onClick={() => navigate(`/learning/quiz/${topicId}`)}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 rounded-xl transition text-lg"
                    >
                        Take Quiz to Test Your Knowledge →
                    </button>

                </div>
            </div>
        </PageWrapper>
    )
}

export default Lesson