import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

// Pages
import WelcomePage from './pages/WelcomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserTypeSelectionPage from './pages/UserTypeSelectionPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import OffersPage from './pages/OffersPage'
import OfferDetailPage from './pages/OfferDetailPage'
import OfferCreationPage from './pages/OfferCreationPage'
import CVPage from './pages/CVPage'
import InterviewPage from './pages/InterviewPage'
import InterviewChatPage from './pages/InterviewChatPage'
import MessagingPage from './pages/MessagingPage'
import RecruiterDashboardPage from './pages/RecruiterDashboardPage'
import SwipingPage from './pages/SwipingPage'
import ApplicationsTrackingPage from './pages/ApplicationsTrackingPage'
import ApplicationManagementPage from './pages/ApplicationManagementPage'
import NotFoundPage from './pages/NotFoundPage'

// Layout
import PrivateRoute from './components/layout/PrivateRoute'
import { ThemeProvider } from './components/layout/ThemeProvider'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="junqo-theme">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/user-type-selection" element={<UserTypeSelectionPage />} />
          
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/offers/details" element={<OfferDetailPage />} />
            <Route path="/offers/create" element={<OfferCreationPage />} />
            <Route path="/cv" element={<CVPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/interview/chat" element={<InterviewChatPage />} />
            <Route path="/messaging" element={<MessagingPage />} />
            <Route path="/applications" element={<ApplicationsTrackingPage />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
            <Route path="/recruiter/applications" element={<ApplicationManagementPage />} />
            <Route path="/recruiter/swiping" element={<SwipingPage />} />
          </Route>

          {/* 404 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  )
}

export default App

