import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Camera, Clock, MapPin, Utensils, Search,
  Coffee, Apple, Sandwich, Pizza, Salad, Cookie,
  Navigation, RefreshCw
} from 'lucide-react'
import LocationIcon from '../icons/LocationIcon'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import DataService from '../../services/DataService'

const MealLogger = ({ onMealLogged }) => {
  const [selectedMeal, setSelectedMeal] = useState('')
  const [mealType, setMealType] = useState('breakfast')
  const [calories, setCalories] = useState('')
  const [customMeal, setCustomMeal] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Location states
  const [currentLocation, setCurrentLocation] = useState('Detecting location...')
  const [locationDetected, setLocationDetected] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [nearbySpots, setNearbySpots] = useState([])
  const [locationContext, setLocationContext] = useState(null)

  // Common meals database with nutritional info
  const commonMeals = {
    breakfast: [
      { name: 'Oats with Banana', calories: 250, protein: 8, healthy: true, icon: '🥣' },
      { name: 'Bread Omelette', calories: 320, protein: 18, healthy: true, icon: '🍳' },
      { name: 'Paratha with Curd', calories: 380, protein: 12, healthy: false, icon: '🥞' },
      { name: 'Poha', calories: 180, protein: 4, healthy: true, icon: '🍚' },
      { name: 'Upma', calories: 200, protein: 6, healthy: true, icon: '🥣' },
      { name: 'Maggi/Instant Noodles', calories: 350, protein: 8, healthy: false, icon: '🍜' }
    ],
    lunch: [
      { name: 'Dal Chawal', calories: 400, protein: 18, healthy: true, icon: '🍛' },
      { name: 'Rajma Rice', calories: 450, protein: 20, healthy: true, icon: '🍚' },
      { name: 'Chicken Curry with Rice', calories: 550, protein: 35, healthy: true, icon: '🍗' },
      { name: 'Vegetable Thali', calories: 480, protein: 16, healthy: true, icon: '🍽️' },
      { name: 'Burger and Fries', calories: 750, protein: 25, healthy: false, icon: '🍔' },
      { name: 'Pizza (2 slices)', calories: 600, protein: 24, healthy: false, icon: '🍕' }
    ],
    dinner: [
      { name: 'Khichdi', calories: 250, protein: 12, healthy: true, icon: '🍚' },
      { name: 'Roti Sabzi', calories: 350, protein: 14, healthy: true, icon: '🥖' },
      { name: 'Fried Rice', calories: 420, protein: 16, healthy: false, icon: '🍛' },
      { name: 'Sandwich', calories: 280, protein: 12, healthy: true, icon: '🥪' },
      { name: 'Instant Noodles', calories: 380, protein: 10, healthy: false, icon: '🍜' }
    ],
    snacks: [
      { name: 'Mixed Nuts', calories: 160, protein: 6, healthy: true, icon: '🥜' },
      { name: 'Banana', calories: 90, protein: 1, healthy: true, icon: '🍌' },
      { name: 'Chips Packet', calories: 150, protein: 2, healthy: false, icon: '🍟' },
      { name: 'Biscuits (4 pcs)', calories: 200, protein: 3, healthy: false, icon: '🍪' },
      { name: 'Samosa', calories: 250, protein: 6, healthy: false, icon: '🥟' },
      { name: 'Fruit Juice', calories: 120, protein: 1, healthy: true, icon: '🧃' }
    ]
  }

  useEffect(() => {
    detectLocationAndSuggestions()
  }, [mealType])

  const detectLocationAndSuggestions = async () => {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Simulate location detection with campus dining areas
            const diningLocations = [
              {
                name: 'Main Cafeteria',
                type: 'campus-dining',
                suggestions: {
                  breakfast: ['Oats with Banana', 'Bread Omelette', 'Poha'],
                  lunch: ['Dal Chawal', 'Vegetable Thali', 'Rajma Rice'],
                  dinner: ['Khichdi', 'Roti Sabzi'],
                  snacks: ['Mixed Nuts', 'Banana', 'Fruit Juice']
                },
                atmosphere: 'Busy dining hall with variety of healthy options',
                priceRange: '₹25-₹80',
                crowdLevel: 'medium'
              },
              {
                name: 'Food Court - Block B',
                type: 'food-court',
                suggestions: {
                  breakfast: ['Bread Omelette', 'Maggi/Instant Noodles'],
                  lunch: ['Burger and Fries', 'Pizza (2 slices)', 'Chicken Curry with Rice'],
                  dinner: ['Fried Rice', 'Sandwich'],
                  snacks: ['Chips Packet', 'Samosa', 'Biscuits (4 pcs)']
                },
                atmosphere: 'Fast food options, quick service',
                priceRange: '₹50-₹200',
                crowdLevel: 'high'
              },
              {
                name: 'Hostel Mess - Block A',
                type: 'mess',
                suggestions: {
                  breakfast: ['Poha', 'Upma', 'Paratha with Curd'],
                  lunch: ['Dal Chawal', 'Vegetable Thali'],
                  dinner: ['Khichdi', 'Roti Sabzi'],
                  snacks: ['Mixed Nuts', 'Banana']
                },
                atmosphere: 'Home-style cooking, budget-friendly',
                priceRange: '₹15-₹50',
                crowdLevel: 'low'
              },
              {
                name: 'Study Cafe - Library Ground Floor',
                type: 'study-cafe',
                suggestions: {
                  breakfast: ['Oats with Banana', 'Bread Omelette'],
                  lunch: ['Sandwich', 'Vegetable Thali'],
                  dinner: ['Sandwich', 'Khichdi'],
                  snacks: ['Mixed Nuts', 'Fruit Juice', 'Banana']
                },
                atmosphere: 'Quiet environment, brain food focus',
                priceRange: '₹40-₹120',
                crowdLevel: 'low'
              }
            ]
            
            const randomLocation = diningLocations[Math.floor(Math.random() * diningLocations.length)]
            setCurrentLocation(randomLocation.name)
            setLocationContext(randomLocation)
            setLocationSuggestions(randomLocation.suggestions[mealType] || [])
            setLocationDetected(true)
            
            // Find nearby dining spots (simulate)
            const otherSpots = diningLocations
              .filter(loc => loc.name !== randomLocation.name)
              .slice(0, 2)
              .map(spot => ({
                ...spot,
                distance: Math.floor(Math.random() * 300) + 50, // 50-350m
                walkTime: Math.floor(Math.random() * 8) + 2 // 2-10 min
              }))
            setNearbySpots(otherSpots)
          },
          (error) => {
            setCurrentLocation('Campus Area')
            setLocationDetected(false)
            setLocationContext({
              type: 'general',
              atmosphere: 'Enable location for personalized meal suggestions',
              suggestions: { [mealType]: [] }
            })
          }
        )
      }
    } catch (error) {
      console.error('Location detection failed:', error)
      setCurrentLocation('Location unavailable')
    }
  }

  const getLocationBasedRecommendation = () => {
    if (!locationContext) return "Choose a meal that fits your current activity!"
    
    const hour = new Date().getHours()
    const { type, atmosphere } = locationContext
    
    switch (type) {
      case 'campus-dining':
        return `🍽️ Main dining hall detected! ${atmosphere}. Perfect for balanced meals.`
      case 'food-court':
        return `🍔 Food court vibes! ${atmosphere}. Quick bites available but watch those calories.`
      case 'mess':
        return `🏠 Mess hall comfort! ${atmosphere}. Home-style nutrition at great prices.`
      case 'study-cafe':
        return `📚 Study environment! ${atmosphere}. Choose brain-boosting foods for better focus.`
      default:
        return `📍 ${atmosphere}`
    }
  }

  const logMeal = async () => {
    if (!selectedMeal && !customMeal) return

    setLoading(true)
    try {
      const mealData = selectedMeal || customMeal
      const mealInfo = commonMeals[mealType]?.find(m => m.name === selectedMeal)
      
      const logEntry = {
        type: 'meal',
        mealType,
        meal: mealData,
        calories: mealInfo?.calories || parseInt(calories) || 0,
        protein: mealInfo?.protein || 0,
        healthy: mealInfo?.healthy || false,
        timestamp: new Date().toISOString(),
        location: currentLocation,
        locationContext: locationContext?.type || 'unknown',
        coordinates: locationDetected ? 'GPS coordinates saved' : 'Manual entry'
      }

      // Save to DataService
      if (DataService.logMealEntry) {
        DataService.logMealEntry(logEntry)
      }
      
      // Update meal status
      if (DataService.logActivity) {
        DataService.logActivity('meal', mealType)
      }
      
      if (onMealLogged) onMealLogged(logEntry)
      
      // Reset form
      setSelectedMeal('')
      setCustomMeal('')
      setCalories('')
      setShowCustomInput(false)
      
    } catch (error) {
      console.error('Error logging meal:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-blue-600" />
            Log Your Meal
          </CardTitle>
          
          <Button
            variant="outline"
            size="sm"
            onClick={detectLocationAndSuggestions}
            className="flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="text-xs">Refresh Location</span>
          </Button>
        </div>
        
        {/* Location Context Header */}
        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <LocationIcon 
              size={18} 
              color="#1e40af" 
              animated={locationDetected}
            />
            <span className="text-blue-800 font-medium text-sm">{currentLocation}</span>
            {locationDetected && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-xs">Live</span>
              </div>
            )}
          </div>
          <div className="text-blue-700 text-xs">{getLocationBasedRecommendation()}</div>
          
          {locationContext && (
            <div className="mt-2 flex items-center space-x-4 text-xs text-blue-600">
              <span>💰 {locationContext.priceRange}</span>
              <span>👥 {locationContext.crowdLevel} crowd</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Meal Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snacks'].map((type) => (
                <Button
                  key={type}
                  variant={mealType === type ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setMealType(type)}
                  className="capitalize"
                >
                  {type === 'breakfast' && '🌅'}
                  {type === 'lunch' && '☀️'}
                  {type === 'dinner' && '🌙'}
                  {type === 'snacks' && '🍎'}
                  {' '}{type}
                </Button>
              ))}
            </div>
          </div>

          {/* Location-Based Suggestions */}
          {locationSuggestions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <LocationIcon size={14} color="#374151" className="mr-2" />
                Popular Here ({mealType})
              </label>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {locationSuggestions.slice(0, 3).map((suggestion, index) => {
                  const mealInfo = commonMeals[mealType]?.find(m => m.name === suggestion)
                  return mealInfo ? (
                    <motion.div
                      key={suggestion}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 border rounded-lg cursor-pointer transition-all bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100 ${
                        selectedMeal === suggestion ? 'ring-2 ring-purple-400' : ''
                      }`}
                      onClick={() => {
                        setSelectedMeal(suggestion)
                        setShowCustomInput(false)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{mealInfo.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{mealInfo.name}</p>
                            <p className="text-xs text-gray-600">
                              {mealInfo.calories} cal • {mealInfo.protein}g protein
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {mealInfo.healthy && (
                            <span className="text-green-600 text-xs">✅ Healthy</span>
                          )}
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center">
                            <LocationIcon size={10} className="mr-1" />
                            Popular
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Common Meals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              All {mealType} Options
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commonMeals[mealType]?.map((meal) => (
                <motion.div
                  key={meal.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedMeal === meal.name
                      ? 'border-blue-500 bg-blue-50'
                      : meal.healthy
                      ? 'border-green-200 bg-green-50 hover:bg-green-100'
                      : 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
                  }`}
                  onClick={() => {
                    setSelectedMeal(meal.name)
                    setShowCustomInput(false)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{meal.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{meal.name}</p>
                        <p className="text-xs text-gray-600">
                          {meal.calories} cal • {meal.protein}g protein
                        </p>
                      </div>
                    </div>
                    {meal.healthy ? (
                      <span className="text-green-600 text-xs">✅ Healthy</span>
                    ) : (
                      <span className="text-yellow-600 text-xs">⚠️ Moderate</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Custom Meal Input */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCustomInput(!showCustomInput)
                setSelectedMeal('')
              }}
              className="mb-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Meal
            </Button>

            {showCustomInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Enter meal name..."
                  value={customMeal}
                  onChange={(e) => setCustomMeal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Estimated calories (optional)"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
            )}
          </div>

          {/* Nearby Dining Options */}
          {nearbySpots.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-gray-900 font-medium text-sm mb-3 flex items-center">
                <Navigation className="w-4 h-4 mr-2 text-gray-600" />
                Other Dining Options Nearby
              </h4>
              <div className="space-y-2">
                {nearbySpots.map((spot, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <LocationIcon size={12} color="#6b7280" />
                      <span className="text-gray-700">{spot.name}</span>
                      <span className="text-xs text-gray-500">({spot.type.replace('-', ' ')})</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {spot.distance}m • {spot.walkTime} min walk
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              onClick={logMeal}
              disabled={(!selectedMeal && !customMeal) || loading}
              className="flex-1"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <div className="flex items-center">
                  <Utensils className="w-4 h-4 mr-2" />
                  <LocationIcon size={12} color="white" className="mr-1" />
                </div>
              )}
              Log Meal at {currentLocation.split(' ')[0]}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Camera className="w-4 h-4 mr-2" />
              Photo
            </Button>
          </div>

          {/* Location Status Footer */}
          <div className="text-xs text-gray-500 text-center flex items-center justify-center space-x-2">
            <LocationIcon size={10} color="#6b7280" />
            <span>
              {locationDetected 
                ? `Meal will be logged at: ${currentLocation}` 
                : 'Enable location for personalized suggestions'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MealLogger