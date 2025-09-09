import React from 'react'
import { motion } from 'framer-motion'
import { Utensils, TrendingUp } from 'lucide-react'
import { useMealTracking } from '../../hooks/useMealTracking'
import { Card, CardContent } from '../ui/card'

const MealStatusCard = () => {
  const { todaysMeals, getTodayNutrition, hasMealType } = useMealTracking()
  const nutrition = getTodayNutrition()

  const mealTypes = [
    { type: 'breakfast', icon: '🌅', label: 'Breakfast' },
    { type: 'lunch', icon: '☀️', label: 'Lunch' },
    { type: 'dinner', icon: '🌙', label: 'Dinner' },
    { type: 'snacks', icon: '🍎', label: 'Snacks' }
  ]

  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-blue-600" />
            Today's Meals
          </h3>
          <span className="text-sm text-gray-500">{todaysMeals.length} logged</span>
        </div>

        {/* Meal Type Status */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {mealTypes.map((meal) => (
            <div
              key={meal.type}
              className={`p-2 rounded-lg border transition-colors ${
                hasMealType(meal.type)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{meal.icon}</span>
                <span className="text-sm font-medium text-gray-900">{meal.label}</span>
                {hasMealType(meal.type) && (
                  <span className="text-green-600 text-xs">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Nutrition Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-blue-600">{nutrition.calories}</p>
              <p className="text-xs text-blue-700">Calories</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">{nutrition.protein}g</p>
              <p className="text-xs text-blue-700">Protein</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                {nutrition.totalMeals > 0 
                  ? Math.round((nutrition.healthyMeals / nutrition.totalMeals) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-green-700">Healthy</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MealStatusCard