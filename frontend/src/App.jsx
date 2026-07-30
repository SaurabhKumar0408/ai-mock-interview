import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import InterviewSetup from './pages/InterviewSetup'
import InterviewRoom from './pages/InterviewRoom'
import FeedbackReport from './pages/FeedbackReport'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import Learning from './pages/Learning'
import CourseDetail from './pages/CourseDetail'
import Lesson from './pages/Lesson'
import Quiz from './pages/Quiz'

// protect routes — if not logged in redirect to login
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token')
    if (!token) return <Navigate to="/login" />
    return children
}

function App() {
    return (
        <Routes>
            {/* public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* protected routes */}
            <Route path="/" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/setup" element={
                <ProtectedRoute><InterviewSetup /></ProtectedRoute>
            } />
            <Route path="/interview/:sessionId" element={
                <ProtectedRoute><InterviewRoom /></ProtectedRoute>
            } />
            <Route path="/feedback/:sessionId" element={
                <ProtectedRoute><FeedbackReport /></ProtectedRoute>
            } />
            <Route path="/analytics" element={
                <ProtectedRoute><Analytics /></ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/learning" element={
                <ProtectedRoute><Learning /></ProtectedRoute>
            } />
            <Route path="/learning/:courseId" element={
                <ProtectedRoute><CourseDetail /></ProtectedRoute>
            } />
            <Route path="/learning/lesson/:topicId" element={
                <ProtectedRoute><Lesson /></ProtectedRoute>
            } />
            <Route path="/learning/quiz/:topicId" element={
                <ProtectedRoute><Quiz /></ProtectedRoute>
            } />
        </Routes>
    )
}

export default App