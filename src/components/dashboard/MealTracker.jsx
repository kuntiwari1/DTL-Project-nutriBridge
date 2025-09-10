import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Utensils, Plus, Check, Clock, MapPin, TrendingUp,
  Coffee, Sun, Moon, Apple, ChefHat
} from 'lucide-react'
import LocationIcon from '../icons/LocationIcon'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import DataService from '../../services/DataService'

const MealTracker = ({ onMealStatusChanged }) => {
  const [mealStatus, setMealStatus] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    snacks: false
  })
  const [todaysMeals, setTodaysMeals] = useState([])
  const [currentLocation, setCurrentLocation] = useState('Campus')
  const [mealStreak, setMealStreak] = useState(0)
  const [lastMealTime, setLastMealTime] = useState(null)

  const mealTypes = [
    { 
      type: 'breakfast', 
      icon: Coffee, 
      emoji: '🌅', 
      label: 'Breakfast',
      timeRange: '6:00 - 11:00 AM',
      color: 'orange',
      idealTime: { start: 6, end: 11 }
    },
    { 
      type: 'lunch', 
      icon: Sun, 
      emoji: '☀️', 
      label: 'Lunch',
      timeRange: '12:00 - 4:00 PM',
      color: 'yellow',
      idealTime: { start: 12, end: 16 }
    },
    { 
      type: 'dinner', 
      icon: Moon, 
      emoji: '🌙', 
      label: 'Dinner',
      timeRange: '6:00 - 10:00 PM',
      color: 'blue',
      idealTime: { start: 18, end: 22 }
    },
    { 
      type: 'snacks', 
      icon: Apple, 
      emoji: '🍎', 
      label: 'Snacks',
      timeRange: 'Anytime',
      color: 'green',
      idealTime: { start: 0, end: 24 }
    }
  ]

  useEffect(() => {
    loadMealData()
    detectLocation()
  }, [])

  const loadMealData = () => {
    const userData = DataService.getUserData()
    const today = new Date().toDateString()
    
    // Load today's meal status
    const mealHistory = userData.mealHistory || {}
    const todayMealEntries = mealHistory[today] || []
    
    setTodaysMeals(todayMealEntries)
    
    // Update meal status based on logged meals
    const newStatus = {
      breakfast: todayMealEntries.some(meal => meal.mealType === 'breakfast'),
      lunch: todayMealEntries.some(meal => meal.mealType === 'lunch'),
      dinner: todayMealEntries.some(meal => meal.mealType === 'dinner'),
      snacks: todayMealEntries.some(meal => meal.mealType === 'snacks')
    }
    
    setMealStatus(newStatus)
    
    // Calculate meal streak
    const streak = userData.streaks?.mealStreak || 0
    setMealStreak(streak)
    
    // Get last meal time
    if (todayMealEntries.length > 0) {
      const lastMeal = todayMealEntries[todayMealEntries.length - 1]
      setLastMealTime(new Date(lastMeal.timestamp))
    }
  }

  const detectLocation = () => {
    // Simulate location detection for meal context
    const campusLocations = [
      'Main Cafeteria', 'Food Court', 'Hostel Mess', 
      'Study Cafe', 'Library', 'Academic Block'
    ]
    const randomLocation = campusLocations[Math.floor(Math.random() * campusLocations.length)]
    setCurrentLocation(randomLocation)
  }

  const markMeal = (mealType) => {
    const now = new Date()
    const mealEntry = {
      type: 'meal',
      mealType,
      meal: `Quick ${mealType} entry`,
      calories: getDefaultCalories(mealType),
      protein: getDefaultProtein(mealType),
      healthy: true,
      timestamp: now.toISOString(),
      location: currentLocation,
      source: 'dashboard-quick-log'
    }

    // Save meal entry
    DataService.logMealEntry(mealEntry)
    
    // Update meal status
    DataService.logActivity('meal', mealType)
    
    // Update local state
    setMealStatus(prev => ({
      ...prev,
      [mealType]: true
    }))
    
    setTodaysMeals(prev => [...prev, mealEntry])
    setLastMealTime(now)
    
    // Check for streak update
    updateMealStreak()
    
    if (onMealStatusChanged) {
      onMealStatusChanged({
        mealType,
        completed: true,
        entry: mealEntry
      })
    }
  }

  const unmarkMeal = (mealType) => {
    // Remove last meal of this type from today's entries
    const updatedMeals = todaysMeals.filter((meal, index) => {
      if (meal.mealType === mealType) {
        // Remove the last occurrence
        const lastIndex = todaysMeals.map(m => m.mealType).lastIndexOf(mealType)
        return index !== lastIndex
      }
      return true
    })
    
    // Update DataService
    const userData = DataService.getUserData()
    const today = new Date().toDateString()
    const mealHistory = { ...userData.mealHistory }
    mealHistory[today] = updatedMeals
    
    DataService.updateUserData({ mealHistory })
    
    // Update local state
    setTodaysMeals(updatedMeals)
    setMealStatus(prev => ({
      ...prev,
      [mealType]: updatedMeals.some(meal => meal.mealType === mealType)
    }))
    
    if (onMealStatusChanged) {
      onMealStatusChanged({
        mealType,
        completed: false
      })
    }
  }

  const getDefaultCalories = (mealType) => {
    const defaults = {
      breakfast: 300,
      lunch: 500,
      dinner: 450,
      snacks: 150
    }
    return defaults[mealType] || 0
  }

  const getDefaultProtein = (mealType) => {
    const defaults = {
      breakfast: 15,
      lunch: 25,
      dinner: 20,
      snacks: 5
    }
    return defaults[mealType] || 0
  }

  const updateMealStreak = () => {
    // Simple streak logic - can be enhanced
    const completedMeals = Object.values(mealStatus).filter(Boolean).length
    if (completedMeals >= 3) { // At least 3 meals per day
      setMealStreak(prev => prev + 1)
      
      // Update DataService
      const userData = DataService.getUserData()
      DataService.updateUserData({
        streaks: {
          ...userData.streaks,
          mealStreak: mealStreak + 1
        }
      })
    }
  }

  const getMealProgress = () => {
    const completedMeals = Object.values(mealStatus).filter(Boolean).length
    return (completedMeals / 4) * 100
  }

  const getCurrentMealRecommendation = () => {
    const currentHour = new Date().getHours()
    
    for (const meal of mealTypes) {
      if (meal.type === 'snacks') continue // Skip snacks for main recommendations
      
      const { start, end } = meal.idealTime
      if (currentHour >= start && currentHour < end && !mealStatus[meal.type]) {
        return {
          type: meal.type,
          label: meal.label,
          emoji: meal.emoji,
          message: `Perfect time for ${meal.label.toLowerCase()}!`
        }
      }
    }
    
    // Check for missed meals
    if (currentHour >= 12 && !mealStatus.breakfast) {
      return {
        type: 'breakfast',
        label: 'Breakfast',
        emoji: '⚠️',
        message: 'You missed breakfast! Consider a nutritious snack.'
      }
    }
    
    if (currentHour >= 16 && !mealStatus.lunch) {
      return {
        type: 'lunch',
        label: 'Lunch', 
        emoji: '⚠️',
        message: 'Late lunch? Your body needs fuel!'
      }
    }
    
    return {
      type: 'general',
      label: 'Nutrition',
      emoji: '💚',
      message: 'Great job staying on track with your meals!'
    }
  }

  const getTimeSinceLastMeal = () => {
    if (!lastMealTime) return null
    
    const timeDiff = (Date.now() - lastMealTime.getTime()) / (1000 * 60) // minutes
    
    if (timeDiff < 60) return `${Math.round(timeDiff)} min ago`
    if (timeDiff < 1440) return `${Math.round(timeDiff / 60)} hours ago`
    return 'Yesterday'
  }

  const recommendation = getCurrentMealRecommendation()

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-blue-600" />
            Today's Meals
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <LocationIcon size={14} />
            <span>{currentLocation}</span>
          </div>
        </div>
        
        {/* Smart Recommendation Banner */}
        <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{recommendation.emoji}</span>
            <div>
              <div className="text-green-800 text-sm font-medium">{recommendation.message}</div>
              <div className="text-green-600 text-xs mt-1">
                {lastMealTime ? `Last meal: ${getTimeSinceLastMeal()}` : 'No meals logged today'}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          
          {/* Progress Overview */}
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {/* Circular Progress */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${getMealProgress() * 2.51} 251`}
                  className="transition-all duration-500"
                />
              </svg>
              
              {/* Progress Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {Object.values(mealStatus).filter(Boolean).length}/4
                  </div>
                  <div className="text-xs text-gray-600">meals</div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              {Math.round(getMealProgress())}% of daily meals completed
            </div>
          </div>

          {/* Meal Type Grid */}
          <div className="grid grid-cols-2 gap-3">
            {mealTypes.map((meal) => {
              const Icon = meal.icon
              const isCompleted = mealStatus[meal.type]
              const isCurrentTime = (() => {
                const hour = new Date().getHours()
                return hour >= meal.idealTime.start && hour < meal.idealTime.end
              })()

              return (
                <motion.div
                  key={meal.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isCompleted
                      ? 'bg-green-50 border-green-300'
                      : isCurrentTime
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => isCompleted ? unmarkMeal(meal.type) : markMeal(meal.type)}
                >
                  {/* Current Time Indicator */}
                  {isCurrentTime && !isCompleted && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-2xl mr-2">{meal.emoji}</span>
                      <Icon className={`w-5 h-5 ${
                        isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className={`font-medium ${
                        isCompleted ? 'text-green-800' : 'text-gray-900'
                      }`}>
                        {meal.label}
                      </h4>
                      
                      <p className="text-xs text-gray-500">{meal.timeRange}</p>
                      
                      {isCompleted ? (
                        <div className="flex items-center justify-center text-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">Completed</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-gray-400">
                          <Plus className="w-4 h-4 mr-1" />
                          <span className="text-xs">Mark as done</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Today's Nutrition Overview
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {todaysMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Calories</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {todaysMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0)}g
                </div>
                <div className="text-xs text-gray-600">Protein</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{mealStreak}</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 flex items-center justify-center space-x-2"
              onClick={() => {
                // Navigate to full meal logger
                console.log('Open detailed meal logger')
              }}
            >
              <ChefHat className="w-4 h-4" />
              <span>Log Detailed Meal</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={detectLocation}
            >
              <LocationIcon size={16} />
            </Button>
          </div>

          {/* Meal History Preview */}
          {todaysMeals.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Meals</h5>
              <div className="space-y-2">
                {todaysMeals.slice(-2).map((meal, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{mealTypes.find(m => m.type === meal.mealType)?.emoji}</span>
                      <span className="text-gray-900">{meal.meal}</span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(meal.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default MealTracker