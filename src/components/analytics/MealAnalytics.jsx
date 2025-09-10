import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, MapPin, Award, Clock, Utensils } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import MealDataService from '../../services/MealDataService'
import LocationIcon from '../icons/LocationIcon'

const MealAnalytics = () => {
  const [mealStats, setMealStats] = useState(null)
  const [todaysMeals, setTodaysMeals] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState(7) // days

  useEffect(() => {
    loadMealData()
  }, [selectedPeriod])

  const loadMealData = () => {
    // Get comprehensive meal statistics
    const stats = MealDataService.getMealStatistics(selectedPeriod)
    setMealStats(stats)
    
    // Get today's meals
    const todayMeals = MealDataService.getTodaysMeals()
    setTodaysMeals(todayMeals)
    
    // Get weekly breakdown
    const weekly = getWeeklyBreakdown()
    setWeeklyData(weekly)
  }

  const getWeeklyBreakdown = () => {
    const weekData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const dayMeals = MealDataService.getMealsForDate(date)
      const dayStats = {
        date: date.toDateString(),
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        totalMeals: dayMeals.length,
        totalCalories: dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
        healthyMeals: dayMeals.filter(meal => meal.healthy).length,
        meals: dayMeals
      }
      weekData.push(dayStats)
    }
    return weekData
  }

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️', 
      dinner: '🌙',
      snacks: '🍎'
    }
    return icons[type] || '🍽️'
  }

  if (!mealStats) {
    return <div className="p-8 text-center">Loading meal data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Utensils className="w-8 h-8 mr-3 text-blue-600" />
          Your Meal Analytics
        </h2>
        
        <div className="flex space-x-2">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedPeriod === days 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Meals</p>
                <p className="text-2xl font-bold text-gray-900">{mealStats.totalMeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Calories/Day</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(mealStats.avgCaloriesPerDay)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Healthy Meals</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((mealStats.healthyMeals / mealStats.totalMeals) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <LocationIcon size={20} color="#8b5cf6" />
              <div>
                <p className="text-sm text-gray-600">Top Location</p>
                <p className="text-sm font-bold text-gray-900">
                  {mealStats.frequentLocations[0]?.location || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Meals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Today's Meals ({todaysMeals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysMeals.length > 0 ? (
            <div className="space-y-3">
              {todaysMeals.map((meal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getMealTypeIcon(meal.mealType)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{meal.meal}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{meal.mealType}</span>
                        <span>{meal.calories} cal</span>
                        <span>{meal.protein}g protein</span>
                        {meal.location && (
                          <span className="flex items-center">
                            <LocationIcon size={12} className="mr-1" />
                            {meal.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      meal.healthy 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {meal.healthy ? '✅ Healthy' : '⚠️ Moderate'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(meal.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No meals logged today</p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Weekly Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weeklyData.map((day, index) => (
              <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600">{day.dayName}</p>
                <p className="text-lg font-bold text-gray-900">{day.totalMeals}</p>
                <p className="text-xs text-gray-500">{day.totalCalories} cal</p>
                <div className="mt-1">
                  <div className={`w-full h-1 rounded ${
                    day.healthyMeals / day.totalMeals > 0.6 
                      ? 'bg-green-400' 
                      : day.healthyMeals / day.totalMeals > 0.3 
                      ? 'bg-yellow-400' 
                      : 'bg-red-400'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Meals & Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mealStats.popularMeals.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-900">{item.meal}</span>
                  <span className="text-blue-600 font-medium">{item.count}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LocationIcon size={18} className="mr-2" />
              Frequent Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mealStats.frequentLocations.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-900">{item.location}</span>
                  <span className="text-purple-600 font-medium">{item.count} meals</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MealAnalytics