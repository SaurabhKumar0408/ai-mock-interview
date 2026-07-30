import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import PageWrapper from '../components/PageWrapper'
import Navbar from '../components/Navbar'
import useUser from '../api/useUser'
import { FeedbackSkeleton } from '../components/Skeleton'

const FeedbackReport = () => {
    const user = useUser()
    const navigate = useNavigate()
    const { sessionId } = useParams()

    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await api.get(`/interviews/${sessionId}/`)
                setSession(response.data)
            } catch (err) {
                setError('Failed to load feedback report.')
            } finally {
                setLoading(false)
            }
        }
        fetchSession()
    }, [sessionId])

    const getScoreColor = (score) => {
        if (score >= 8) return 'text-green-400'
        if (score >= 5) return 'text-yellow-400'
        return 'text-red-400'
    }

    const getScoreBg = (score) => {
        if (score >= 8) return 'bg-green-500'
        if (score >= 5) return 'bg-yellow-500'
        return 'bg-red-500'
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

    const parseFeedback = (feedbackStr) => {
        try {
            // feedback is stored as string in DB, parse it back
            return JSON.parse(feedbackStr.replace(/'/g, '"'))
        } catch {
            return null
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />
                <FeedbackSkeleton />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-red-400 text-lg">{error}</p>
            </div>
        )
    }

    const answeredQuestions = session?.questions?.filter(q => q.answer) || []

    return (
        <PageWrapper>
            <div className="min-h-screen bg-gray-950 text-white">

            {/* navbar */}
            <Navbar user={user} />

            <div className="max-w-3xl mx-auto px-6 py-10">

                {/* header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-1">Interview Report</h2>
                    <p className="text-gray-400">
                        {getTypeLabel(session?.interview_type)} •{' '}
                        {session?.target_role} •{' '}
                        {new Date(session?.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </p>
                </div>

                {/* overall score card */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8 text-center">
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-4">
                        Overall Score
                    </p>
                    <div className={`text-7xl font-bold mb-4 ${getScoreColor(session?.overall_score)}`}>
                        {session?.overall_score ?? '—'}
                        <span className="text-3xl text-gray-600">/10</span>
                    </div>

                    {/* score bar */}
                    <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
                        <div
                            className={`h-3 rounded-full transition-all duration-1000 ${getScoreBg(session?.overall_score)}`}
                            style={{ width: `${(session?.overall_score || 0) * 10}%` }}
                        />
                    </div>

                    <p className="text-gray-400 text-sm">
                        {session?.overall_feedback}
                    </p>

                    {/* stats row */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-2xl font-bold text-white">
                                {session?.questions?.length || 0}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">Total Questions</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-2xl font-bold text-green-400">
                                {answeredQuestions.length}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">Answered</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-2xl font-bold text-blue-400">
                                {session?.questions?.length - answeredQuestions.length || 0}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">Skipped</p>
                        </div>
                    </div>
                </div>

                {/* questions breakdown */}
                <h3 className="text-xl font-semibold mb-4">Question Breakdown</h3>

                <div className="space-y-4">
                    {session?.questions?.map((question, index) => {
                        const feedback = question.answer
                            ? parseFeedback(question.answer.ai_feedback)
                            : null

                        return (
                            <div
                                key={question.id}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                            >
                                {/* question */}
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shrink-0">
                                        Q{index + 1}
                                    </span>
                                    <p className="text-white font-medium leading-relaxed">
                                        {question.text}
                                    </p>
                                </div>

                                {question.answer ? (
                                    <>
                                        {/* user answer */}
                                        <div className="bg-gray-800 rounded-xl p-4 mb-4">
                                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                                                Your Answer
                                            </p>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {question.answer.text}
                                            </p>
                                        </div>

                                        {/* score */}
                                        {feedback && (
                                            <>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className={`text-3xl font-bold ${getScoreColor(feedback.score)}`}>
                                                        {feedback.score}
                                                        <span className="text-lg text-gray-600">/10</span>
                                                    </span>
                                                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${getScoreBg(feedback.score)}`}
                                                            style={{ width: `${feedback.score * 10}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* feedback pills */}
                                                <div className="space-y-2">
                                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                                        <p className="text-green-400 text-xs font-semibold uppercase mb-1">
                                                            ✅ Good
                                                        </p>
                                                        <p className="text-gray-300 text-sm">{feedback.good}</p>
                                                    </div>
                                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                                        <p className="text-yellow-400 text-xs font-semibold uppercase mb-1">
                                                            💡 Improve
                                                        </p>
                                                        <p className="text-gray-300 text-sm">{feedback.improve}</p>
                                                    </div>
                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                                        <p className="text-blue-400 text-xs font-semibold uppercase mb-1">
                                                            🎯 Ideal Answer
                                                        </p>
                                                        <p className="text-gray-300 text-sm">{feedback.ideal_answer}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                                        <p className="text-gray-600 text-sm">Not answered</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* action buttons */}
            
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={() => navigate('/setup', {
                            state: {
                                prefill: {
                                    interview_type: session?.interview_type,
                                    target_role: session?.target_role,
                                    difficulty: session?.difficulty,
                                }
                            }
                        })}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition"
                    >
                        🔁 Retake Interview
                    </button>
                    <button
                        onClick={() => navigate('/setup')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition"
                    >
                        🎯 New Interview
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 rounded-xl transition"
                    >
                        🏠 Dashboard
                    </button>
                </div>

            </div>
        </div>
        </PageWrapper>
    )
}

export default FeedbackReport