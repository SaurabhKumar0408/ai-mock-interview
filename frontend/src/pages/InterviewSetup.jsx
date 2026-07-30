import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import PageWrapper from '../components/PageWrapper'
import Navbar from '../components/Navbar'
import useUser from '../api/useUser'

const interviewTypes = [
    {
        id: 'hr',
        label: 'HR / Behavioral',
        description: 'Communication, teamwork, leadership and situational questions.',
        icon: '🤝',
        color: 'border-green-500/50 hover:border-green-500',
        selectedColor: 'border-green-500 bg-green-500/10',
    },
    {
        id: 'dsa',
        label: 'DSA / Coding',
        description: 'Data structures, algorithms and problem solving questions.',
        icon: '💻',
        color: 'border-blue-500/50 hover:border-blue-500',
        selectedColor: 'border-blue-500 bg-blue-500/10',
    },
    {
        id: 'system_design',
        label: 'System Design',
        description: 'Architecture, scalability and design pattern questions.',
        icon: '🏗️',
        color: 'border-purple-500/50 hover:border-purple-500',
        selectedColor: 'border-purple-500 bg-purple-500/10',
    },
    {
        id: 'domain',
        label: 'Domain Specific',
        description: 'Role specific questions for Finance, Marketing, and more.',
        icon: '🎯',
        color: 'border-orange-500/50 hover:border-orange-500',
        selectedColor: 'border-orange-500 bg-orange-500/10',
    },
]

const InterviewSetup = () => {
    const user = useUser()
    const navigate = useNavigate()
    const location = useLocation()

    const [selectedType, setSelectedType] = useState('')
    const [targetRole, setTargetRole] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [difficulty, setDifficulty] = useState('medium')

    // prefill from retake
    useEffect(() => {
        const prefill = location.state?.prefill
        if (prefill) {
            if (prefill.interview_type) setSelectedType(prefill.interview_type)
            if (prefill.target_role) setTargetRole(prefill.target_role)
            if (prefill.difficulty) setDifficulty(prefill.difficulty)
        }
    }, [])

    const handleStart = async () => {
        if (!selectedType) {
            setError('Please select an interview type.')
            return
        }
        if (!targetRole.trim()) {
            setError('Please enter your target role.')
            return
        }

        setError('')
        setLoading(true)

        try {
            const response = await api.post('/interviews/start/', {
                interview_type: selectedType,
                target_role: targetRole,
                difficulty: difficulty,
            })
            // redirect to interview room with session id
            navigate(`/interview/${response.data.id}`, {
                state: { session: response.data }
            })
        } catch (err) {
            setError('Failed to start interview. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-gray-950 text-white">

            {/* navbar */}
            <Navbar user={user} />

            <div className="max-w-3xl mx-auto px-6 py-10">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">Setup your interview</h2>
                    <p className="text-gray-400">
                        Choose the type and your target role to get relevant questions.
                    </p>
                </div>

                {/* error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* interview type selection */}
                <h3 className="text-lg font-semibold mb-4">
                    Select Interview Type
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {interviewTypes.map((type) => (
                        <div
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`border-2 rounded-xl p-5 cursor-pointer transition
                                ${selectedType === type.id
                                    ? type.selectedColor
                                    : `border-gray-800 bg-gray-900 ${type.color}`
                                }`}
                        >
                            <div className="text-3xl mb-3">{type.icon}</div>
                            <h4 className="font-semibold text-white mb-1">
                                {type.label}
                            </h4>
                            <p className="text-gray-400 text-sm">
                                {type.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* difficulty selection */}
                <h3 className="text-lg font-semibold text-white mb-4">
                    Select Difficulty
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        {
                            id: 'easy',
                            label: 'Easy',
                            icon: '🟢',
                            desc: 'Freshers & beginners',
                            color: 'border-green-500 bg-green-500/10',
                            default: 'border-gray-800 bg-gray-900 hover:border-green-500/50',
                        },
                        {
                            id: 'medium',
                            label: 'Medium',
                            icon: '🟡',
                            desc: '1-3 years experience',
                            color: 'border-yellow-500 bg-yellow-500/10',
                            default: 'border-gray-800 bg-gray-900 hover:border-yellow-500/50',
                        },
                        {
                            id: 'hard',
                            label: 'Hard',
                            icon: '🔴',
                            desc: 'Senior & experienced',
                            color: 'border-red-500 bg-red-500/10',
                            default: 'border-gray-800 bg-gray-900 hover:border-red-500/50',
                        },
                    ].map((d) => (
                        <div
                            key={d.id}
                            onClick={() => setDifficulty(d.id)}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition text-center
                                ${difficulty === d.id ? d.color : d.default}`}
                        >
                            <div className="text-2xl mb-2">{d.icon}</div>
                            <p className="text-white font-semibold text-sm">{d.label}</p>
                            <p className="text-gray-400 text-xs mt-1">{d.desc}</p>
                        </div>
                    ))}
                </div>

                {/* target role input */}
                <h3 className="text-lg font-semibold mb-4">
                    Your Target Role
                </h3>
                <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Software Engineer, Data Analyst, Product Manager"
                    className="w-full bg-gray-900 text-white rounded-xl px-5 py-4 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition mb-8"
                />

                {/* start button */}
                <button
                    onClick={handleStart}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition text-lg"
                >
                    {loading ? 'Generating questions...' : 'Start Interview →'}
                </button>

                {loading && (
                    <p className="text-center text-gray-500 text-sm mt-3">
                        AI is generating your questions, please wait...
                    </p>
                )}
            </div>
        </div>
        </PageWrapper>
    )
}

export default InterviewSetup