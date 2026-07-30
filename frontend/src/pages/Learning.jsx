import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import PageWrapper from '../components/PageWrapper'
import useUser from '../api/useUser'

const Learning = () => {
    const navigate = useNavigate()
    const user = useUser()

    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/learning/courses/')
                setCourses(response.data)
            } catch (err) {
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }
        fetchCourses()
    }, [])

    const getCategoryColor = (category) => {
        const colors = {
            hr: 'border-green-500/30 hover:border-green-500',
            dsa: 'border-blue-500/30 hover:border-blue-500',
            system_design: 'border-purple-500/30 hover:border-purple-500',
            domain: 'border-orange-500/30 hover:border-orange-500',
        }
        return colors[category] || 'border-gray-500/30 hover:border-gray-500'
    }

    const getCategoryBadgeColor = (category) => {
        const colors = {
            hr: 'bg-green-500/10 text-green-400',
            dsa: 'bg-blue-500/10 text-blue-400',
            system_design: 'bg-purple-500/10 text-purple-400',
            domain: 'bg-orange-500/10 text-orange-400',
        }
        return colors[category] || 'bg-gray-500/10 text-gray-400'
    }

    const getCategoryLabel = (category) => {
        const labels = {
            hr: 'HR / Behavioral',
            dsa: 'DSA / Coding',
            system_design: 'System Design',
            domain: 'Domain Specific',
        }
        return labels[category] || category
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />
                <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-gray-800 animate-pulse rounded-2xl h-48" />
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
                            Learning Hub
                        </h2>
                        <p className="text-gray-400">
                            Study interview concepts with AI generated lessons and quizzes.
                        </p>
                    </div>

                    {/* courses grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => navigate(`/learning/${course.id}`)}
                                className={`bg-gray-900 border-2 rounded-2xl p-6 cursor-pointer transition ${getCategoryColor(course.category)}`}
                            >
                                {/* icon + badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-4xl">{course.icon}</span>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${getCategoryBadgeColor(course.category)}`}>
                                        {getCategoryLabel(course.category)}
                                    </span>
                                </div>

                                {/* title + description */}
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {course.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                                    {course.description}
                                </p>

                                {/* topics count */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-sm">
                                        {course.total_topics} topics
                                    </span>
                                    <span className="text-blue-400 text-sm font-medium">
                                        Start Learning →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageWrapper>
    )
}

export default Learning