import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import LoadingSpinner from './components/layout/LoadingSpinner'

// Pages
const WelcomePage = lazy(() => import('./pages/WelcomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const UserTypeSelectionPage = lazy(() => import('./pages/UserTypeSelectionPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const OffersPage = lazy(() => import('./pages/OffersPage'))
const OfferDetailPage = lazy(() => import('./pages/OfferDetailPage'))
const OfferCreationPage = lazy(() => import('./pages/OfferCreationPage'))
const OfferEditPage = lazy(() => import('./pages/OfferEditPage'))
const CVPage = lazy(() => import('./pages/CVPage'))
const InterviewPage = lazy(() => import('./pages/InterviewPage'))
const InterviewChatPage = lazy(() => import('./pages/InterviewChatPage'))
const MessagingPage = lazy(() => import('./pages/MessagingPage'))
const RecruiterDashboardPage = lazy(() => import('./pages/RecruiterDashboardPage'))
const SwipingPage = lazy(() => import('./pages/SwipingPage'))
const ApplicationsTrackingPage = lazy(() => import('./pages/ApplicationsTrackingPage'))
const ApplicationManagementPage = lazy(() => import('./pages/ApplicationManagementPage'))
const SchoolDashboardPage = lazy(() => import('@/pages/SchoolDashboardPage'))
const SchoolStudentDashboardPage = lazy(() => import('@/pages/SchoolStudentDashboardPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const CGUPage = lazy(() => import('./pages/CGUPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))

// Layout
import PrivateRoute from './components/layout/PrivateRoute'
import { ThemeProvider } from './components/layout/ThemeProvider'

// Hooks
import { useWebSocketConnection } from './hooks/useWebSocketConnection'

function App() {
  // Établir la connexion WebSocket globale (se connecte/déconnecte avec l'auth)
  useWebSocketConnection()

  return (
    <ThemeProvider defaultTheme="system" storageKey="junqo-theme">
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/user-type-selection" element={<UserTypeSelectionPage />} />
            <Route path="/cgu" element={<CGUPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/offers/details" element={<OfferDetailPage />} />
              <Route path="/offers/create" element={<OfferCreationPage />} />
              <Route path="/offers/edit" element={<OfferEditPage />} />
              <Route path="/cv" element={<CVPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/interview/chat" element={<InterviewChatPage />} />
              <Route path="/messaging" element={<MessagingPage />} />
              <Route path="/applications" element={<ApplicationsTrackingPage />} />
              <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
              <Route path="/recruiter/applications" element={<ApplicationManagementPage />} />
              <Route path="/recruiter/swiping" element={<SwipingPage />} />
              <Route path="/school/dashboard" element={<SchoolDashboardPage />} />
              <Route path="/school/student/:studentId" element={<SchoolStudentDashboardPage />} />
            </Route>

            {/* 404 */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  )
}

export default App
