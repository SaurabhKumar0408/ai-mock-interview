import { useState, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import api from '../api/axios'
import FeedbackCard from '../components/FeedbackCard'
import PageWrapper from '../components/PageWrapper'
import useUser from '../api/useUser'
import Navbar from '../components/Navbar'

const InterviewRoom = () => {
    const user = useUser()
    const navigate = useNavigate()
    const location = useLocation()
    const { sessionId } = useParams()

    const session = location.state?.session
    const questions = session?.questions || []

    const [currentIndex, setCurrentIndex] = useState(0)
    const [answerText, setAnswerText] = useState('')
    const [feedback, setFeedback] = useState(null)
    const [loading, setLoading] = useState(false)
    const [transcribing, setTranscribing] = useState(false)
    const [error, setError] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState(null)
    const [answeredQuestions, setAnsweredQuestions] = useState([])
    const [answerMode, setAnswerMode] = useState('text') // 'text' or 'voice'

    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])

    const currentQuestion = questions[currentIndex]
    const isLastQuestion = currentIndex === questions.length - 1

    // ── Voice Recording ──
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorderRef.current = new MediaRecorder(stream)
            audioChunksRef.current = []

            mediaRecorderRef.current.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data)
            }

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorderRef.current.start()
            setIsRecording(true)
            setAudioBlob(null)
            setAnswerText('')
            setError('')
        } catch (err) {
            setError('Microphone access denied. Please allow microphone and try again.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    // ── Preview Voice Answer (transcribe only) ──
    const handlePreview = async () => {
        if (!audioBlob) return

        setTranscribing(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('audio_file', audioBlob, 'answer.webm')

            const response = await api.post('/interviews/transcribe/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            // show transcribed text in textarea for review
            setAnswerText(response.data.text)
            setAudioBlob(null) // clear audio blob since we now have text
        } catch (err) {
            setError('Transcription failed. Please try again or type your answer.')
        } finally {
            setTranscribing(false)
        }
    }

    // ── Submit Answer ──
    const handleSubmit = async () => {
        if (!answerText.trim()) {
            setError('Please type or record your answer first.')
            return
        }

        setError('')
        setLoading(true)
        setFeedback(null)

        try {
            const response = await api.post(`/interviews/${sessionId}/answer/`, {
                question_id: currentQuestion.id,
                text: answerText,
            })

            setFeedback(response.data.feedback)
            setAnsweredQuestions([...answeredQuestions, currentQuestion.id])
        } catch (err) {
            setError('Failed to submit answer. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // ── Next Question ──
    const handleNext = () => {
        setFeedback(null)
        setAnswerText('')
        setAudioBlob(null)
        setError('')
        setCurrentIndex(currentIndex + 1)
    }

    // ── Complete Interview ──
    const handleComplete = async () => {
        try {
            await api.post(`/interviews/${sessionId}/complete/`)
            navigate(`/feedback/${sessionId}`)
        } catch (err) {
            setError('Failed to complete interview. Please try again.')
        }
    }

    if (!session) {
        navigate('/setup')
        return null
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-gray-950 text-white">

                {/* navbar */}
                <Navbar user={user} />

                <div className="max-w-3xl mx-auto px-6 py-10">

                    {/* progress bar */}
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-10">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    {/* question card */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                Q{currentIndex + 1}
                            </span>
                            <span className="text-gray-500 text-xs uppercase tracking-wider">
                                {session.interview_type.replace('_', ' ')}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                session.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                                session.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-red-500/10 text-red-400'
                            }`}>
                                {session.difficulty}
                            </span>
                        </div>
                        <p className="text-xl text-white leading-relaxed">
                            {currentQuestion?.text}
                        </p>
                    </div>

                    {/* answer section */}
                    {!feedback && (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">

                            {/* mode tabs */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => {
                                        setAnswerMode('text')
                                        setAudioBlob(null)
                                        setError('')
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        answerMode === 'text'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    ✏️ Type Answer
                                </button>
                                <button
                                    onClick={() => {
                                        setAnswerMode('voice')
                                        setAnswerText('')
                                        setError('')
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        answerMode === 'voice'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    🎙️ Voice Answer
                                </button>
                            </div>

                            {/* text mode */}
                            {answerMode === 'text' && (
                                <textarea
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    placeholder="Type your answer here..."
                                    rows={6}
                                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition resize-none"
                                />
                            )}

                            {/* voice mode */}
                            {answerMode === 'voice' && (
                                <div className="space-y-4">

                                    {/* recording controls */}
                                    <div className="flex items-center gap-3">
                                        {!isRecording ? (
                                            <button
                                                onClick={startRecording}
                                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-3 rounded-lg transition"
                                            >
                                                🎙️ Start Recording
                                            </button>
                                        ) : (
                                            <button
                                                onClick={stopRecording}
                                                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-5 py-3 rounded-lg transition animate-pulse"
                                            >
                                                ⏹️ Stop Recording
                                            </button>
                                        )}

                                        {isRecording && (
                                            <span className="text-red-400 text-sm animate-pulse">
                                                ● Recording...
                                            </span>
                                        )}
                                    </div>

                                    {/* audio recorded — show preview button */}
                                    {audioBlob && !isRecording && (
                                        <div className="bg-gray-800 rounded-xl p-4">
                                            <p className="text-green-400 text-sm mb-3">
                                                ✅ Audio recorded successfully
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handlePreview}
                                                    disabled={transcribing}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition"
                                                >
                                                    {transcribing ? 'Transcribing...' : '👁️ Preview & Review Answer'}
                                                </button>
                                                <button
                                                    onClick={() => setAudioBlob(null)}
                                                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm px-4 py-2 rounded-lg transition"
                                                >
                                                    🗑️ Discard
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* transcribed text — editable */}
                                    {answerText && (
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                                                📝 Transcribed text — you can edit before submitting
                                            </p>
                                            <textarea
                                                value={answerText}
                                                onChange={(e) => setAnswerText(e.target.value)}
                                                rows={5}
                                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-blue-500/50 focus:outline-none focus:border-blue-500 transition resize-none"
                                            />
                                            <p className="text-gray-600 text-xs mt-1">
                                                ✏️ Edit the text above if transcription has any mistakes
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* error */}
                            {error && (
                                <p className="text-red-400 text-sm mt-4">{error}</p>
                            )}
                        </div>
                    )}

                    {/* feedback card */}
                    {feedback && <FeedbackCard feedback={feedback} />}

                    {/* action buttons */}
                    <div className="flex gap-3">
                        {!feedback ? (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || (!answerText.trim())}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition"
                            >
                                {loading ? 'Evaluating...' : 'Submit Answer →'}
                            </button>
                        ) : isLastQuestion ? (
                            <button
                                onClick={handleComplete}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition"
                            >
                                Complete Interview 🎉
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition"
                            >
                                Next Question →
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </PageWrapper>
    )
}

export default InterviewRoom