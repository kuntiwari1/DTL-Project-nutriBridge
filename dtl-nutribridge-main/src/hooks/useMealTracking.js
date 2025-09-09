import { useState, useEffect } from 'react'
import MealDataService from '../services/MealDataService'

export const useMealTracking = () => {
  const [todaysMeals, setTodaysMeals] = useState([])
  const [mealStats, setMealStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshMealData = () => {
    setLoading(true)
    try {
      const meals = MealDataService.getTodaysMeals()
      const stats = MealDataService.getMealStatistics(7)
      
      setTodaysMeals(meals)
      setMealStats(stats)
    } catch (error) {
      console.error('Error loading meal data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshMealData()
  }, [])

  // Check if specific meal type eaten today
  const hasMealType = (type) => {
    return todaysMeals.some(meal => meal.mealType === type)
  }

  // Get today's nutrition totals
  const getTodayNutrition = () => {
    return {
      calories: todaysMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
      protein: todaysMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
      healthyMeals: todaysMeals.filter(meal => meal.healthy).length,
      totalMeals: todaysMeals.length
    }
  }

  // Get meal history for specific date
  const getMealHistory = (date) => {
    return MealDataService.getMealsForDate(date)
  }

  return {
    todaysMeals,
    mealStats,
    loading,
    refreshMealData,
    hasMealType,
    getTodayNutrition,
    getMealHistory
  }
}