import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import PageWrapper from '../components/PageWrapper'
import useUser from '../api/useUser'

const CourseDetail = () => {
    const navigate = useNavigate()
    const { courseId } = useParams()
    const user = useUser()

    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await api.get(`/learning/courses/${courseId}/`)
                setCourse(response.data)
            } catch (err) {
                navigate('/learning')
            } finally {
                setLoading(false)
            }
        }
        fetchCourse()
    }, [courseId])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />
                <div className="max-w-3xl mx-auto px-6 py-10 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="bg-gray-800 animate-pulse rounded-xl h-20" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />

                <div className="max-w-3xl mx-auto px-6 py-10">

                    {/* back button */}
                    <button
                        onClick={() => navigate('/learning')}
                        className="text-gray-400 hover:text-white text-sm mb-6 block transition"
                    >
                        ← Back to Learning Hub
                    </button>

                    {/* course header */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-4 mb-3">
                            <span className="text-4xl">{course?.icon}</span>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {course?.title}
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    {course?.description}
                                </p>
                            </div>
                        </div>

                        {/* progress bar */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-400 text-xs">
                                    Progress
                                </span>
                                <span className="text-white text-xs font-medium">
                                    {course?.progress_percent || 0}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                                    style={{ width: `${course?.progress_percent || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* topics list */}
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Topics
                    </h3>

                    <div className="space-y-3">
                        {course?.topics?.map((topic, index) => {
                            const lessonDone = topic.progress?.lesson_completed
                            const quizDone = topic.progress?.quiz_completed
                            const quizScore = topic.progress?.quiz_score

                            return (
                                <div
                                    key={topic.id}
                                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition"
                                >
                                    <div className="flex items-center justify-between">

                                        {/* left — number + title */}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                                lessonDone
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-800 text-gray-500'
                                            }`}>
                                                {lessonDone ? '✓' : index + 1}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">
                                                    {topic.title}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-0.5">
                                                    {topic.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* right — actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {quizDone && (
                                                <span className="text-xs text-yellow-400 font-medium">
                                                    Quiz: {quizScore}/10
                                                </span>
                                            )}
                                            {lessonDone && !quizDone && (
                                                <button
                                                    onClick={() => navigate(`/learning/quiz/${topic.id}`)}
                                                    className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                                                >
                                                    Take Quiz
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate(`/learning/lesson/${topic.id}`)}
                                                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                                                    lessonDone
                                                        ? 'bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                            >
                                                {lessonDone ? 'Review' : 'Start →'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </PageWrapper>
    )
}

export default CourseDetail