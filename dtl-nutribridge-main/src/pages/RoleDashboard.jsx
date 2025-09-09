import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import ParentDashboard from './dashboards/ParentDashboard'
import HealthWorkerDashboard from './dashboards/HealthWorkerDashboard'
import StudentDashboard from './dashboards/StudentDashboard'
import DonorDashboard from './dashboards/DonorDashboard'
import NGODashboard from './dashboards/NGODashboard'

export default function RoleDashboard() {
  const { userProfile, user, loading } = useAuth()

  // 🔍 DEBUG LOGGING
  useEffect(() => {
    console.log('🚀 RoleDashboard Debug Info:')
    console.log('- Auth Loading:', loading)
    console.log('- User:', user)
    console.log('- User Profile:', userProfile)
    console.log('- User UID:', user?.uid)
    console.log('- User Email:', user?.email)
    console.log('- Profile Role:', userProfile?.role)
    console.log('- Profile Name:', userProfile?.name)
  }, [user, userProfile, loading])

  // Show loading if auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading authentication...</div>
          <div className="text-gray-400 text-sm mt-2">
            Please wait while we verify your account...
          </div>
        </div>
      </div>
    )
  }

  // Show loading if user profile is not loaded yet
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading your dashboard...</div>
          <div className="text-gray-400 text-sm mt-2">
            User: {user?.email} • Role: Loading...
          </div>
          
          {/* 🔍 ENHANCED DEBUG INFO */}
          <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-left max-w-md mx-auto">
            <div className="text-xs text-gray-400 space-y-1">
              <div><strong>Debug Info:</strong></div>
              <div>User UID: {user?.uid || 'Not found'}</div>
              <div>User Email: {user?.email || 'Not found'}</div>
              <div>Profile Loaded: {userProfile ? 'Yes' : 'No'}</div>
              <div>Auth Loading: {loading ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {/* 🔧 EMERGENCY RESET BUTTON */}
          <button 
            onClick={() => {
              console.log('🔄 Force refresh attempt...')
              window.location.reload()
            }}
            className="mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Force Refresh
          </button>
        </div>
      </div>
    )
  }

  // 🎯 ROLE-BASED ROUTING LOGIC
  console.log('🎯 Routing to dashboard for role:', userProfile.role)
  
  switch (userProfile.role) {
    case 'parent':
      console.log('🚀 Rendering ParentDashboard')
      return <ParentDashboard />
    
    case 'health-worker':
      console.log('🚀 Rendering HealthWorkerDashboard')
      return <HealthWorkerDashboard />
    
    case 'student':
      console.log('🚀 Rendering StudentDashboard')
      return <StudentDashboard />
    
    case 'donor':
      console.log('🚀 Rendering DonorDashboard')
      return <DonorDashboard />
    
    case 'ngo':
      console.log('🚀 Rendering NGODashboard')
      return <NGODashboard />
    
    default:
      console.log('⚠️ Unknown role, showing error:', userProfile.role)
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-500/30 flex items-center justify-center">
              <span className="text-red-400 text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Unknown Role</h2>
            <p className="text-gray-400 mb-6">
              Role "{userProfile.role}" is not recognized.
            </p>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
              <div className="text-xs text-gray-500 space-y-1">
                <div><strong>User:</strong> {userProfile.email}</div>
                <div><strong>Role:</strong> {userProfile.role}</div>
                <div><strong>Name:</strong> {userProfile.name}</div>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      )
  }
}