import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, Users, Award, TrendingUp, Clock, FileText, 
  Droplets, Coffee, Apple, MapPin, Bell, Target,
  Calendar, BarChart3, Trophy, Heart, AlertCircle,
  Zap, Brain, DollarSign, Utensils, Timer, Sparkles,
  Bot, RefreshCw, Settings, Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// Import with error handling
let DataService = null
let GeminiService = null

try {
  DataService = (await import('../../services/DataService')).default
  GeminiService = (await import('../../services/GeminiService')).default
} catch (error) {
  console.error('Error importing services:', error)
}

// Fallback data if DataService fails
const getFallbackData = () => ({
  profile: {
    name: 'Student',
    age: 20,
    weight: 65,
    height: 170,
    course: 'Your Course'
  },
  currentStats: {
    healthScore: 65,
    streak: 3,
    budgetSpent: 120,
    budgetLimit: 300
  },
  todayLog: {
    date: new Date().toDateString(),
    breakfast: false,
    lunch: true,
    dinner: false,
    snacks: 1,
    waterGlasses: 3,
    fastFood: 0,
    studyHours: 5,
    sleepHours: 7,
    stressLevel: 4,
    energyLevel: 7
  }
})

// Consistent Badge Component
const Badge = ({ children, className = "", variant = "default" }) => {
  const variants = {
    default: "bg-blue-50 text-blue-700 border-blue-200",
    secondary: "bg-gray-50 text-gray-600 border-gray-200",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    ai: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200"
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default function StudentDashboard() {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  
  // State with error handling
  const [userData, setUserData] = useState(getFallbackData())
  const [aiTips, setAiTips] = useState(null)
  const [loadingAiTips, setLoadingAiTips] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [nearbySpots, setNearbySpots] = useState([])
  const [serviceError, setServiceError] = useState(null)

  // Load dynamic data on component mount
  useEffect(() => {
    loadUserData()
    loadAiTips()
  }, [])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Load user data with error handling
  const loadUserData = () => {
    try {
      if (DataService && typeof DataService.getUserData === 'function') {
        const data = DataService.getUserData()
        setUserData(data || getFallbackData())
        setServiceError(null)
      } else {
        console.warn('DataService not available, using fallback data')
        setUserData(getFallbackData())
        setServiceError('DataService not available')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setUserData(getFallbackData())
      setServiceError(error.message)
    }
  }

  // Load AI-powered health tips with error handling
  const loadAiTips = async () => {
    setLoadingAiTips(true)
    try {
      if (GeminiService && typeof GeminiService.getPersonalizedHealthTips === 'function') {
        const tips = await GeminiService.getPersonalizedHealthTips(userData)
        setAiTips(tips)
      } else {
        // Fallback AI tips
        setAiTips({
          immediateActions: [
            "Drink a glass of water right now",
            "Take a 5-minute break from screen time",
            "Plan your next healthy meal"
          ],
          weeklyHabits: [
            "Set daily water intake reminders",
            "Plan healthy snacks for study sessions"
          ],
          mealRecommendation: {
            meal: "Protein-rich snack",
            reason: "Sustained energy for studies",
            benefits: "Better focus and concentration"
          },
          studyInsight: "Proper nutrition can improve concentration by up to 23%",
          motivation: "Small healthy choices today lead to big wins tomorrow! 🎯",
          healthScoreAnalysis: "You're on the right track! Focus on consistency for better results."
        })
      }
    } catch (error) {
      console.error('Error loading AI tips:', error)
      setAiTips({
        immediateActions: ["Stay hydrated", "Eat regularly", "Take breaks"],
        motivation: "Keep making healthy choices! 💪"
      })
    } finally {
      setLoadingAiTips(false)
    }
  }

  // Refresh AI tips
  const refreshAiTips = () => {
    loadAiTips()
  }

  // Log activity with error handling
  const logActivity = (type, value) => {
    try {
      if (DataService && typeof DataService.logActivity === 'function') {
        const updatedData = DataService.logActivity(type, value)
        if (updatedData) {
          setUserData(updatedData)
          // Refresh AI tips after significant changes
          if (['meal', 'water', 'study'].includes(type)) {
            loadAiTips()
          }
        }
      } else {
        // Fallback: update local state only
        const newUserData = { ...userData }
        switch(type) {
          case 'water':
            newUserData.todayLog.waterGlasses = Math.min(newUserData.todayLog.waterGlasses + 1, 15)
            break
          case 'meal':
            newUserData.todayLog[value] = true
            break
        }
        setUserData(newUserData)
        console.log('Activity logged locally:', type, value)
      }
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  // Get smart reminders with fallback
  const getSmartReminders = () => {
    try {
      if (DataService && typeof DataService.getSmartReminders === 'function') {
        return DataService.getSmartReminders()
      }
    } catch (error) {
      console.error('Error getting smart reminders:', error)
    }
    
    // Fallback reminders
    const hour = currentTime.getHours()
    const reminders = []
    
    if (hour >= 7 && hour <= 10 && !userData.todayLog.breakfast) {
      reminders.push({
        type: 'urgent',
        icon: Coffee,
        title: 'Breakfast Alert!',
        message: 'Time for a healthy breakfast!',
        action: 'Log Breakfast',
        actionFn: () => logActivity('meal', 'breakfast')
      })
    }
    
    if (userData.todayLog.waterGlasses < 4 && hour > 10) {
      reminders.push({
        type: 'warning',
        icon: Droplets,
        title: 'Hydration Reminder',
        message: 'You need more water today!',
        action: 'Log Water',
        actionFn: () => logActivity('water')
      })
    }
    
    return reminders
  }

  const smartReminders = getSmartReminders()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Error Banner */}
        {serviceError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-yellow-800 text-sm">
                  Some features may be limited. Using demo data.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadUserData}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Clean Professional Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {userData.profile.name}! 👋
              </h1>
              <p className="text-gray-600">Your personalized nutrition dashboard with AI-powered insights</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-gray-900">
                {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge>🎓 Student Dashboard</Badge>
            <Badge variant="success">🔥 {userData.currentStats.streak} Day Streak</Badge>
            <Badge variant="info">📍 {nearbySpots.length} Nearby Spots</Badge>
            <Badge variant="warning">💰 ₹{userData.todayLog.budgetSpent || 0}/₹{userData.currentStats.budgetLimit}</Badge>
            <Badge variant="ai">🤖 AI Powered</Badge>
          </div>
        </motion.div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Health Score</p>
                  <p className="text-3xl font-bold text-gray-900">{Math.round(userData.currentStats.healthScore)}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {userData.currentStats.healthScore >= 85 ? '🏆 Excellent!' : 
                     userData.currentStats.healthScore >= 70 ? '😊 Good' : 
                     userData.currentStats.healthScore >= 50 ? '⚠️ Fair' : '😟 Needs Work'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hydration</p>
                  <p className="text-2xl font-bold text-gray-900">{userData.todayLog.waterGlasses}/8</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((userData.todayLog.waterGlasses / 8) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Meals Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(userData.todayLog.breakfast ? 1 : 0) + 
                     (userData.todayLog.lunch ? 1 : 0) + 
                     (userData.todayLog.dinner ? 1 : 0)}/3
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {!userData.todayLog.breakfast ? '⚠️ Missed breakfast' : '✅ On track'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Apple className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Energy Level</p>
                  <p className="text-2xl font-bold text-gray-900">{userData.todayLog.energyLevel}/10</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {userData.todayLog.energyLevel >= 8 ? '⚡ High energy' : 
                     userData.todayLog.energyLevel >= 6 ? '😊 Good' : '😴 Low energy'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{userData.todayLog.studyHours}h</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {userData.todayLog.studyHours >= 8 ? '🧠 Intensive' : '📚 Active'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card 
            className="bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all group"
            onClick={() => logActivity('water')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-medium text-sm">Log Water</h3>
              <p className="text-gray-500 text-xs">+1 Glass</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all group"
            onClick={() => navigate('/healthy-spots')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-gray-900 font-medium text-sm">Healthy Spots</h3>
              <p className="text-gray-500 text-xs">Find nearby</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all group"
            onClick={() => logActivity('meal', 'breakfast')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Utensils className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-gray-900 font-medium text-sm">Log Meal</h3>
              <p className="text-gray-500 text-xs">Track nutrition</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all group">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-gray-900 font-medium text-sm">Reminders</h3>
              <p className="text-gray-500 text-xs">{smartReminders.length} active</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all group">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-gray-900 font-medium text-sm">Meal Buddies</h3>
              <p className="text-gray-500 text-xs">Find friends</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all group">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-gray-900 font-medium text-sm">Analytics</h3>
              <p className="text-gray-500 text-xs">View trends</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Health Assistant */}
        <Card className="bg-white border border-gray-200 shadow-sm mb-8">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-blue-600" />
                  AI Health Assistant
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Personalized recommendations based on your health data
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAiTips}
                disabled={loadingAiTips}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingAiTips ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loadingAiTips ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-3"></div>
                <span className="text-gray-600">AI is analyzing your data...</span>
              </div>
            ) : aiTips ? (
              <div className="space-y-6">
                {/* Health Score Analysis */}
                {aiTips.healthScoreAnalysis && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-gray-900 font-medium mb-2 flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-gray-600" />
                      Health Score Analysis
                    </h4>
                    <p className="text-gray-700 text-sm">{aiTips.healthScoreAnalysis}</p>
                  </div>
                )}

                {/* Immediate Actions */}
                {aiTips.immediateActions && (
                  <div>
                    <h4 className="text-gray-900 font-medium mb-3">Immediate Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {aiTips.immediateActions.map((action, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h5 className="text-blue-900 font-medium text-sm">Action {index + 1}</h5>
                          <p className="text-blue-700 text-xs mt-1">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meal Recommendation */}
                {aiTips.mealRecommendation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-green-900 font-medium mb-2 flex items-center">
                      <Utensils className="w-4 h-4 mr-2" />
                      Recommended Meal
                    </h4>
                    <div className="text-green-800 text-sm">
                      <p className="font-medium">{aiTips.mealRecommendation.meal}</p>
                      <p className="text-xs text-green-700 mt-1">{aiTips.mealRecommendation.reason}</p>
                      <p className="text-xs text-green-600 mt-1">Benefits: {aiTips.mealRecommendation.benefits}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Study Insight */}
                  {aiTips.studyInsight && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-yellow-900 font-medium mb-2 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        Study Insight
                      </h4>
                      <p className="text-yellow-800 text-sm">{aiTips.studyInsight}</p>
                    </div>
                  )}

                  {/* Motivation */}
                  {aiTips.motivation && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="text-purple-900 font-medium mb-2 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Daily Motivation
                      </h4>
                      <p className="text-purple-800 text-sm">{aiTips.motivation}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">AI tips will appear here based on your health data</p>
                <Button 
                  variant="primary"
                  onClick={loadAiTips}
                >
                  Get AI Health Tips
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Smart Reminders */}
        {smartReminders.length > 0 && (
          <Card className="bg-white border border-gray-200 shadow-sm mb-8">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-gray-600" />
                Smart Reminders
                <Badge variant="danger" className="ml-2">
                  {smartReminders.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {smartReminders.map((reminder, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <reminder.icon className="w-5 h-5 mr-3 text-gray-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                      <p className="text-sm text-gray-600">{reminder.message}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={reminder.actionFn}
                    >
                      {reminder.action}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Summary */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-600" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(userData.todayLog.breakfast ? 1 : 0) + (userData.todayLog.lunch ? 1 : 0) + (userData.todayLog.dinner ? 1 : 0)}
                </div>
                <div className="text-sm text-gray-600">Meals Logged</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {userData.todayLog.waterGlasses}
                </div>
                <div className="text-sm text-gray-600">Glasses of Water</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {userData.todayLog.studyHours}h
                </div>
                <div className="text-sm text-gray-600">Study Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(userData.currentStats.healthScore)}%
                </div>
                <div className="text-sm text-gray-600">Health Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}