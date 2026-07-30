import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import PageWrapper from '../components/PageWrapper'
import useUser from '../api/useUser'

const Quiz = () => {
    const navigate = useNavigate()
    const { topicId } = useParams()
    const user = useUser()

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // quiz state
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [userAnswers, setUserAnswers] = useState([])
    const [showExplanation, setShowExplanation] = useState(false)
    const [quizCompleted, setQuizCompleted] = useState(false)
    const [result, setResult] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await api.get(`/learning/topics/${topicId}/quiz/`)
                setData(response.data)
            } catch (err) {
                if (err.response?.status === 400) {
                    setError('Please complete the lesson before taking the quiz.')
                } else {
                    setError('Failed to load quiz. Please try again.')
                }
            } finally {
                setLoading(false)
            }
        }
        fetchQuiz()
    }, [topicId])

    const questions = data?.quiz?.questions || []
    const currentQuestion = questions[currentIndex]
    const isLastQuestion = currentIndex === questions.length - 1

    const handleSelectAnswer = (index) => {
        if (showExplanation) return // can't change after submitting
        setSelectedAnswer(index)
    }

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return
        setShowExplanation(true)
    }

    const handleNext = () => {
        // save answer
        setUserAnswers([...userAnswers, selectedAnswer])

        if (isLastQuestion) {
            // finish quiz
            handleFinish([...userAnswers, selectedAnswer])
        } else {
            // next question
            setCurrentIndex(currentIndex + 1)
            setSelectedAnswer(null)
            setShowExplanation(false)
        }
    }

    const handleFinish = async (allAnswers) => {
        setSubmitting(true)
        const correctAnswers = questions.map(q => q.correct)

        try {
            const response = await api.post(
                `/learning/topics/${topicId}/quiz/`,
                {
                    topic_id: parseInt(topicId),
                    answers: allAnswers,
                    correct_answers: correctAnswers,
                }
            )
            setResult(response.data)
            setQuizCompleted(true)
        } catch (err) {
            setError('Failed to submit quiz. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const getOptionStyle = (index) => {
        if (!showExplanation) {
            // before submitting
            if (selectedAnswer === index) {
                return 'border-blue-500 bg-blue-500/10 text-white'
            }
            return 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
        }

        // after submitting — show correct/wrong
        if (index === currentQuestion.correct) {
            return 'border-green-500 bg-green-500/10 text-green-400'
        }
        if (selectedAnswer === index && index !== currentQuestion.correct) {
            return 'border-red-500 bg-red-500/10 text-red-400'
        }
        return 'border-gray-700 bg-gray-800 text-gray-500'
    }

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />
                <div className="max-w-2xl mx-auto px-6 py-10">
                    <div className="bg-gray-800 animate-pulse rounded-2xl h-12 mb-6 w-48" />
                    <div className="bg-gray-800 animate-pulse rounded-2xl h-48 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-gray-800 animate-pulse rounded-xl h-14" />
                        ))}
                    </div>
                    <p className="text-center text-gray-500 text-sm mt-6">
                        AI is generating your quiz, please wait...
                    </p>
                </div>
            </div>
        )
    }

    // ── Error ──
    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />
                <div className="max-w-2xl mx-auto px-6 py-10 text-center">
                    <p className="text-4xl mb-4">⚠️</p>
                    <p className="text-red-400 mb-6">{error}</p>
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

    // ── Quiz Completed ──
    if (quizCompleted && result) {
        const correctCount = result.correct_count
        const total = result.total_questions
        const score = result.score

        return (
            <PageWrapper>
                <div className="min-h-screen bg-gray-950 text-white">
                    <Navbar user={user} />

                    <div className="max-w-2xl mx-auto px-6 py-10 text-center">

                        {/* result emoji */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="text-7xl mb-6"
                        >
                            {score >= 8 ? '🏆' : score >= 5 ? '👍' : '📚'}
                        </motion.div>

                        <h2 className="text-3xl font-bold text-white mb-2">
                            Quiz Completed!
                        </h2>
                        <p className="text-gray-400 mb-8">
                            {data?.topic?.title}
                        </p>

                        {/* score card */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">

                            {/* big score */}
                            <div className={`text-7xl font-bold mb-2 ${
                                score >= 8 ? 'text-green-400' :
                                score >= 5 ? 'text-yellow-400' :
                                'text-red-400'
                            }`}>
                                {score}
                                <span className="text-3xl text-gray-600">/10</span>
                            </div>

                            {/* score bar */}
                            <div className="w-full bg-gray-800 rounded-full h-3 mb-6">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score * 10}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className={`h-3 rounded-full ${
                                        score >= 8 ? 'bg-green-500' :
                                        score >= 5 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                />
                            </div>

                            <p className="text-gray-400 text-sm">
                                You got{' '}
                                <span className="text-white font-semibold">
                                    {correctCount} out of {total}
                                </span>{' '}
                                questions correct
                            </p>

                            {/* feedback message */}
                            <p className="text-gray-400 text-sm mt-3">
                                {score >= 8
                                    ? '🎉 Excellent! You have mastered this topic.'
                                    : score >= 5
                                    ? '👍 Good job! Review the lesson to improve further.'
                                    : '📚 Keep studying! Review the lesson and try again.'}
                            </p>
                        </div>

                        {/* action buttons */}
                        <div className="flex gap-3">
                            {score < 8 && (
                                <button
                                    onClick={() => navigate(`/learning/lesson/${topicId}`)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
                                >
                                    📖 Review Lesson
                                </button>
                            )}
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition"
                            >
                                ← Back to Course
                            </button>
                        </div>
                    </div>
                </div>
            </PageWrapper>
        )
    }

    // ── Quiz in progress ──
    return (
        <PageWrapper>
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar user={user} />

                <div className="max-w-2xl mx-auto px-6 py-10">

                    {/* header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-gray-400 hover:text-white text-sm transition"
                        >
                            ← Back
                        </button>
                        <span className="text-gray-400 text-sm">
                            Question{' '}
                            <span className="text-white font-semibold">
                                {currentIndex + 1}
                            </span>
                            {' '}of{' '}
                            <span className="text-white font-semibold">
                                {questions.length}
                            </span>
                        </span>
                    </div>

                    {/* progress bar */}
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
                        <div
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    {/* question */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                                <span className="bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
                                    Q{currentIndex + 1}
                                </span>
                                <p className="text-white text-lg leading-relaxed">
                                    {currentQuestion?.question}
                                </p>
                            </div>

                            {/* options */}
                            <div className="space-y-3 mb-6">
                                {currentQuestion?.options?.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectAnswer(index)}
                                        className={`w-full text-left px-5 py-4 rounded-xl border-2 transition text-sm ${getOptionStyle(index)}`}
                                    >
                                        <span className="font-bold mr-3">
                                            {['A', 'B', 'C', 'D'][index]}.
                                        </span>
                                        {option}
                                    </button>
                                ))}
                            </div>

                            {/* explanation */}
                            <AnimatePresence>
                                {showExplanation && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`rounded-xl p-4 mb-6 ${
                                            selectedAnswer === currentQuestion.correct
                                                ? 'bg-green-500/10 border border-green-500/20'
                                                : 'bg-red-500/10 border border-red-500/20'
                                        }`}
                                    >
                                        <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                                            selectedAnswer === currentQuestion.correct
                                                ? 'text-green-400'
                                                : 'text-red-400'
                                        }`}>
                                            {selectedAnswer === currentQuestion.correct
                                                ? '✅ Correct!'
                                                : '❌ Incorrect'}
                                        </p>
                                        <p className="text-gray-300 text-sm">
                                            {currentQuestion?.explanation}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* action button */}
                            {!showExplanation ? (
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={selectedAnswer === null}
                                    className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition"
                                >
                                    Submit Answer
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    disabled={submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-4 rounded-xl transition"
                                >
                                    {submitting
                                        ? 'Saving...'
                                        : isLastQuestion
                                        ? 'Finish Quiz 🎉'
                                        : 'Next Question →'}
                                </button>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </PageWrapper>
    )
}

export default Quiz