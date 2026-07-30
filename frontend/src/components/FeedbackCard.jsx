import { motion } from 'framer-motion'

const FeedbackCard = ({ feedback }) => {
    if (!feedback) return null

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6"
        >
            <h3 className="text-lg font-semibold text-white mb-6">
                AI Feedback
            </h3>

            {/* score */}
            <div className="flex items-center gap-4 mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className={`text-5xl font-bold ${getScoreColor(feedback.score)}`}
                >
                    {feedback.score}
                    <span className="text-2xl text-gray-600">/10</span>
                </motion.div>

                {/* animated score bar */}
                <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${feedback.score * 10}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                        className={`h-3 rounded-full ${getScoreBg(feedback.score)}`}
                    />
                </div>
            </div>

            {/* good */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-3"
            >
                <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    ✅ What was good
                </p>
                <p className="text-gray-300 text-sm">{feedback.good}</p>
            </motion.div>

            {/* improve */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-3"
            >
                <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    💡 What to improve
                </p>
                <p className="text-gray-300 text-sm">{feedback.improve}</p>
            </motion.div>

            {/* ideal answer */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
            >
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    🎯 Ideal Answer
                </p>
                <p className="text-gray-300 text-sm">{feedback.ideal_answer}</p>
            </motion.div>
        </motion.div>
    )
}

export default FeedbackCard