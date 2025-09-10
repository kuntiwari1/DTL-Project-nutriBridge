import React from 'react'
import 'leaflet/dist/leaflet.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { usePWA } from './hooks/usePWA'

// Pages
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ChildTracker from './pages/ChildTracker'
import FoodDonation from './pages/FoodDonation'
import MapView from './pages/MapView'

// 🎯 ROLE-BASED DASHBOARDS
import RoleDashboard from './pages/RoleDashboard'

// Layout
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/common/LoadingSpinner'
import ErrorBoundary from './components/common/ErrorBoundary'

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
}

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// 🎯 ROLE-BASED ROUTE PROTECTION
function RoleProtectedRoute({ allowedRoles, children }) {
  const { user, userProfile, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!userProfile) {
    return <LoadingSpinner />
  }

  // Check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function AppContent() {
  const { user, userProfile, loading } = useAuth()
  const { isOnboarded, setIsOnboarded } = usePWA()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} />
  }

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* 🔓 PUBLIC ROUTES */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Login />
              </motion.div>
            )
          } />
          
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" replace /> : (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Register />
              </motion.div>
            )
          } />
          
          {/* 🔒 PROTECTED ROUTES WITH LAYOUT */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* 🎯 MAIN ROLE-BASED DASHBOARD */}
            <Route path="dashboard" element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <RoleDashboard />
              </motion.div>
            } />

            {/* 👤 COMMON ROUTES (All Roles) */}
            <Route path="profile" element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Profile />
              </motion.div>
            } />

            {/* 👨‍👩‍👧‍👦 PARENT-ONLY ROUTES */}
            <Route path="child-tracker" element={
              <RoleProtectedRoute allowedRoles={['parent']}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ChildTracker />
                </motion.div>
              </RoleProtectedRoute>
            } />

            {/* 💰 DONOR & NGO ROUTES */}
            <Route path="food-donation" element={
              <RoleProtectedRoute allowedRoles={['donor', 'ngo', 'parent']}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <FoodDonation />
                </motion.div>
              </RoleProtectedRoute>
            } />

            {/* 🗺️ MAP VIEW (All Roles) */}
            <Route path="map" element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <MapView />
              </motion.div>
            } />
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground">
              <AppContent />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App