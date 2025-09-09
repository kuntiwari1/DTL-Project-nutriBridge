import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import MealLogger from '../components/nutrition/MealLogger'
import WaterTracker from '../components/nutrition/WaterTracker'
import DataService from '../services/DataService'

export default function NutritionDashboard() {
  const [userData, setUserData] = useState(DataService.getUserData())
  const [mealHistory, setMealHistory] = useState([])
  const [waterHistory, setWaterHistory] = useState([])
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const meals = DataService.getMealHistory()
    const water = DataService.getWaterHistory()
    const analyticsData = DataService.getAnalytics()
    
    setMealHistory(meals)
    setWaterHistory(water)
    setAnalytics(analyticsData)
  }

  const handleMealLogged = (mealEntry) => {
    loadData() // Refresh data
    // Show success notification
    console.log('Meal logged:', mealEntry)
  }

  const handleWaterLogged = (waterEntry) => {
    loadData() // Refresh data
    // Show success notification
    console.log('Water logged:', waterEntry)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nutrition Tracking Dashboard
          </h1>
          <p className="text-gray-600">Log your meals and water intake to get personalized insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Meal Logger */}
          <MealLogger onMealLogged={handleMealLogged} />
          
          {/* Water Tracker */}
          <WaterTracker onWaterLogged={handleWaterLogged} />
        </div>

        {/* Analytics Preview */}
        {analytics && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>This Week's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(analytics.meals.healthyPercentage)}%
                  </div>
                  <div className="text-sm text-gray-600">Healthy Meals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(analytics.water.avgDailyIntake)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Daily Water</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(analytics.meals.avgCaloriesPerDay)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Daily Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(analytics.meals.avgProteinPerDay)}g
                  </div>
                  <div className="text-sm text-gray-600">Avg Daily Protein</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}