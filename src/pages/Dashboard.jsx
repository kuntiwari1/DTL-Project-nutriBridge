import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, User, Calendar, Weight, Ruler, TrendingUp, 
  Target, Award, BookOpen, MapPin, Coffee, Sun, Moon,
  Apple, Droplets, Utensils, Brain, Activity, Clock
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../context/AuthContext'
import WaterTracker from '../components/nutrition/WaterTracker'
import MealTracker from '../components/dashboard/MealTracker'
import LocationIcon from '../components/icons/LocationIcon'
import WaterDropIcon from '../components/icons/WaterDropIcon'
import DataService from '../services/DataService'

export default function Dashboard() {
  const { user } = useAuth()
  const [studentProfile, setStudentProfile] = useState(null)
  const [nutritionStats, setNutritionStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [currentLocation, setCurrentLocation] = useState('Campus')

  useEffect(() => {
    loadStudentData()
    detectLocation()
  }, [user])

  const loadStudentData = async () => {
    try {
      const userData = DataService.getUserData()
      setStudentProfile(userData.profile || null)
      
      // Calculate comprehensive nutrition stats
      const stats = calculateNutritionStats(userData)
      setNutritionStats(stats)
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading student data:', error)
      setLoading(false)
    }
  }

  const detectLocation = () => {
    // Simulate student location detection
    const campusLocations = [
      'Library - Study Floor 2', 'Main Cafeteria', 'Hostel Block A',
      'Academic Building', 'Sports Complex', 'Food Court'
    ]
    const randomLocation = campusLocations[Math.floor(Math.random() * campusLocations.length)]
    setCurrentLocation(randomLocation)
  }

  const calculateNutritionStats = (userData) => {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
    
    // Water stats
    const todayWater = userData.todayLog?.waterGlasses || 0
    const waterGoal = userData.goals?.waterGoal || 8
    const waterStreak = userData.streaks?.waterStreak || 0
    
    // Meal stats
    const mealHistory = userData.mealHistory || {}
    const todayMeals = mealHistory[today] || []
    const yesterdayMeals = mealHistory[yesterday] || []
    
    const todayCalories = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
    const todayProtein = todayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0)
    const healthyMealsToday = todayMeals.filter(meal => meal.healthy).length
    
    // Calculate health score (0-100)
    const waterScore = Math.min(100, (todayWater / waterGoal) * 100)
    const mealScore = todayMeals.length >= 3 ? 100 : (todayMeals.length / 3) * 100
    const healthScore = Math.round((waterScore + mealScore) / 2)
    
    // Calculate weekly trends
    const weeklyMeals = Object.keys(mealHistory)
      .slice(-7)
      .reduce((total, date) => total + (mealHistory[date]?.length || 0), 0)
    
    return {
      // Today's stats
      todayWater,
      waterGoal,
      waterProgress: (todayWater / waterGoal) * 100,
      waterStreak,
      
      todayMeals: todayMeals.length,
      todayCalories,
      todayProtein,
      healthyMealsToday,
      
      // Overall health
      healthScore,
      
      // Trends
      weeklyMeals,
      improvementTrend: todayMeals.length > yesterdayMeals.length ? 'up' : 
                       todayMeals.length < yesterdayMeals.length ? 'down' : 'stable',
      
      // Goals achievement
      goalsAchieved: [
        todayWater >= waterGoal,
        todayMeals.length >= 3,
        healthyMealsToday >= 2
      ].filter(Boolean).length
    }
  }

  const handleWaterLogged = (waterData) => {
    console.log('💧 Water logged:', waterData)
    loadStudentData() // Refresh stats
  }

  const handleMealStatusChanged = (mealData) => {
    console.log('🍽️ Meal status changed:', mealData)
    loadStudentData() // Refresh stats
  }

  const createStudentProfile = async (profileData) => {
    try {
      const profile = {
        id: user.uid,
        ...profileData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }

      DataService.updateUserData({ profile })
      setStudentProfile(profile)
      setShowProfileSetup(false)
      loadStudentData()
    } catch (error) {
      console.error('Error creating profile:', error)
      alert(`Error creating profile: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-lg flex items-center space-x-3"
        >
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading your nutrition dashboard...</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Brain className="w-8 h-8 mr-3 text-blue-400" />
                Welcome back, {studentProfile?.name || user?.displayName || user?.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-blue-200">Track your nutrition, stay healthy, perform better!</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-blue-300">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date().toLocaleTimeString()}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <LocationIcon size={16} />
                  <span>{currentLocation}</span>
                </span>
              </div>
            </div>
            
            {!studentProfile && (
              <Button 
                onClick={() => setShowProfileSetup(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <User className="w-4 h-4 mr-2" />
                Complete Profile
              </Button>
            )}
          </div>
        </motion.div>

        {/* Quick Stats Overview */}
        {nutritionStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            {/* Health Score */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Health Score</p>
                    <p className={`text-3xl font-bold ${
                      nutritionStats.healthScore >= 80 ? 'text-emerald-400' :
                      nutritionStats.healthScore >= 60 ? 'text-yellow-400' :
                      nutritionStats.healthScore >= 40 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {nutritionStats.healthScore}
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      {nutritionStats.healthScore >= 80 ? 'Excellent!' :
                       nutritionStats.healthScore >= 60 ? 'Good progress' : 
                       nutritionStats.healthScore >= 40 ? 'Improving' : 'Needs attention'}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            {/* Water Progress */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Water Progress</p>
                    <p className="text-3xl font-bold text-white flex items-center">
                      {nutritionStats.todayWater}
                      <WaterDropIcon size={20} color="#3b82f6" className="ml-1" />
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      {Math.round(nutritionStats.waterProgress)}% of {nutritionStats.waterGoal} glasses
                    </p>
                  </div>
                  <div className="text-2xl">💧</div>
                </div>
              </CardContent>
            </Card>

            {/* Meals Today */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Meals Today</p>
                    <p className="text-3xl font-bold text-white">{nutritionStats.todayMeals}/4</p>
                    <p className="text-xs text-blue-300 mt-1">
                      {nutritionStats.healthyMealsToday} healthy meals
                    </p>
                  </div>
                  <Utensils className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            {/* Goals Achieved */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Goals Achieved</p>
                    <p className="text-3xl font-bold text-white">{nutritionStats.goalsAchieved}/3</p>
                    <p className="text-xs text-blue-300 mt-1">
                      {nutritionStats.goalsAchieved === 3 ? 'Perfect day!' : 
                       nutritionStats.goalsAchieved >= 2 ? 'Almost there!' : 'Keep going!'}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Tracking Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Water Tracker */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <WaterTracker onWaterLogged={handleWaterLogged} />
          </motion.div>

          {/* Meal Tracker */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MealTracker onMealStatusChanged={handleMealStatusChanged} />
          </motion.div>
        </div>

        {/* Student Profile Card */}
        {studentProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{studentProfile.name}</p>
                      <p className="text-blue-200 text-sm">{studentProfile.age} years old</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-blue-200 text-sm">Course</p>
                    <p className="text-white font-medium">{studentProfile.course || 'Not set'}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-blue-200 text-sm">Year</p>
                    <p className="text-white font-medium">{studentProfile.year || 'Not set'}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-blue-200 text-sm">Hostel</p>
                    <p className="text-white font-medium">{studentProfile.hostel || 'Day Scholar'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Weekly Overview */}
        {nutritionStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  This Week's Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
                      <Utensils className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{nutritionStats.weeklyMeals}</p>
                    <p className="text-blue-200 text-sm">Meals This Week</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center">
                      <WaterDropIcon size={32} color="#10b981" />
                    </div>
                    <p className="text-2xl font-bold text-white">{nutritionStats.waterStreak}</p>
                    <p className="text-blue-200 text-sm">Day Water Streak</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/30 flex items-center justify-center">
                      <Award className="w-8 h-8 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{nutritionStats.goalsAchieved * 7}</p>
                    <p className="text-blue-200 text-sm">Weekly Goal Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State - No Profile */}
        {!studentProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center">
              <User className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Complete Your Student Profile!</h2>
            <p className="text-blue-200 mb-8 max-w-md mx-auto">
              Set up your student profile to get personalized nutrition recommendations and track your health goals.
            </p>
            <Button 
              onClick={() => setShowProfileSetup(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Student Profile
            </Button>
          </motion.div>
        )}
      </div>

      {/* Student Profile Setup Modal */}
      {showProfileSetup && (
        <StudentProfileModal 
          onClose={() => setShowProfileSetup(false)} 
          onCreate={createStudentProfile}
        />
      )}
    </div>
  )
}

// Student Profile Setup Modal
function StudentProfileModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    course: '',
    year: '',
    hostel: '',
    dietaryPreferences: '',
    healthGoals: '',
    activityLevel: ''
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onCreate(formData)
    } catch (error) {
      console.error('Error creating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Create Student Profile</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Age *</label>
              <input
                type="number"
                min="16"
                max="30"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                placeholder="18"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Course *</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Computer Science"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Year *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                required
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Hostel/Accommodation</label>
              <input
                type="text"
                value={formData.hostel}
                onChange={(e) => setFormData({...formData, hostel: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Block A / Day Scholar"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Activity Level</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select Level</option>
                <option value="Low">Low (Mostly sedentary)</option>
                <option value="Moderate">Moderate (Some exercise)</option>
                <option value="High">High (Regular exercise)</option>
                <option value="Very High">Very High (Intense training)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Dietary Preferences</label>
            <input
              type="text"
              value={formData.dietaryPreferences}
              onChange={(e) => setFormData({...formData, dietaryPreferences: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Vegetarian, Vegan, Non-vegetarian, etc."
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Health Goals</label>
            <textarea
              value={formData.healthGoals}
              onChange={(e) => setFormData({...formData, healthGoals: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none h-20 resize-none"
              placeholder="Weight management, muscle gain, energy boost, focus improvement, etc."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}