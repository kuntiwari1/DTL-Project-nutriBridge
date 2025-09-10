import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const getInitials = (name) => {
  return name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'UN'
}

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// ===============================
// 🎯 ENHANCED STUDENT NUTRITION UTILITIES
// ===============================

// Calculate distance between two GPS coordinates (Haversine formula)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180
  const φ2 = lat2 * Math.PI/180
  const Δφ = (lat2-lat1) * Math.PI/180
  const Δλ = (lng2-lng1) * Math.PI/180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}

// Format distance for display
export const formatDistance = (distance) => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`
  } else {
    return `${(distance / 1000).toFixed(1)}km`
  }
}

// Calculate health score based on daily habits
export const calculateHealthScore = (todayLog) => {
  const breakfastScore = todayLog.breakfast ? 25 : 0
  const waterScore = Math.min((todayLog.waterGlasses / 8) * 25, 25)
  const vitaminScore = Math.min((todayLog.vitamins?.length / 3) * 15, 15)
  const fastFoodPenalty = (todayLog.fastFood || 0) * 8
  const mealScore = Math.min(((todayLog.lunch ? 1 : 0) + (todayLog.dinner ? 1 : 0)) * 12.5, 25)
  const sleepScore = Math.min(((todayLog.sleepHours || 7) / 8) * 10, 10)
  
  return Math.max(0, Math.min(100, breakfastScore + waterScore + vitaminScore + mealScore + sleepScore - fastFoodPenalty))
}

// Check if a spot is currently open
export const isSpotOpen = (spot) => {
  const now = new Date()
  const currentDay = now.toLocaleDateString('en', { weekday: 'lowercase' }).slice(0, -1) // Remove 's' from 'mondays'
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
  
  if (spot.openHours && spot.openHours[currentDay]) {
    const { open, close } = spot.openHours[currentDay]
    return currentTime >= open && currentTime <= close
  }
  return false
}

// Get crowd level styling
export const getCrowdLevelColor = (level) => {
  switch(level) {
    case 'low': return 'text-green-400'
    case 'medium': return 'text-yellow-400'
    case 'high': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

export const getCrowdLevelEmoji = (level) => {
  switch(level) {
    case 'low': return '🟢'
    case 'medium': return '🟡'
    case 'high': return '🔴'
    default: return '⚪'
  }
}

// Format time for display
export const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
}

// Get time-based greeting
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 17) return "Good Afternoon"
  if (hour < 21) return "Good Evening"
  return "Good Night"
}

// Calculate BMI
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null
  const heightInMeters = height / 100
  return (weight / (heightInMeters * heightInMeters)).toFixed(1)
}

// Get BMI category
export const getBMICategory = (bmi) => {
  if (!bmi) return null
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-400' }
  if (bmi < 25) return { category: 'Normal', color: 'text-green-400' }
  if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-400' }
  return { category: 'Obese', color: 'text-red-400' }
}

// Calculate calories burned for activities
export const calculateCaloriesBurned = (activity, minutes, weight = 70) => {
  const metValues = {
    walking: 3.5,
    running: 10,
    cycling: 8,
    swimming: 8,
    studying: 1.3,
    cooking: 2.5
  }
  
  const met = metValues[activity] || 2
  return Math.round((met * weight * minutes) / 60)
}

// Format currency for Indian Rupees
export const formatCurrency = (amount, currency = '₹') => {
  return `${currency}${amount}`
}

// Generate meal recommendations based on time and preferences
export const getMealRecommendations = (hour, dietaryPreferences = []) => {
  const recommendations = {
    breakfast: ['Oats with fruits', 'Greek yogurt', 'Whole grain toast', 'Smoothie bowl'],
    lunch: ['Quinoa salad', 'Grilled chicken bowl', 'Vegetable curry with rice', 'Hummus wrap'],
    dinner: ['Grilled fish with vegetables', 'Lentil soup', 'Stir-fried tofu', 'Vegetable pasta'],
    snacks: ['Mixed nuts', 'Fresh fruit', 'Greek yogurt', 'Vegetable sticks with hummus']
  }

  if (hour >= 6 && hour <= 10) return recommendations.breakfast
  if (hour >= 11 && hour <= 15) return recommendations.lunch
  if (hour >= 17 && hour <= 21) return recommendations.dinner
  return recommendations.snacks
}

// Validate nutrition goals
export const validateNutritionGoals = (goals) => {
  const errors = {}
  
  if (!goals.calories || goals.calories < 1200 || goals.calories > 4000) {
    errors.calories = 'Calories should be between 1200-4000'
  }
  
  if (!goals.water || goals.water < 4 || goals.water > 15) {
    errors.water = 'Water intake should be between 4-15 glasses'
  }
  
  if (!goals.protein || goals.protein < 20 || goals.protein > 200) {
    errors.protein = 'Protein should be between 20-200 grams'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Generate student-friendly meal suggestions based on budget
export const getBudgetMealSuggestions = (budget) => {
  if (budget <= 100) {
    return [
      { meal: 'Dal Chawal', price: 60, nutrition: 'High protein, complex carbs' },
      { meal: 'Bread Omelette', price: 40, nutrition: 'Protein, healthy fats' },
      { meal: 'Banana Shake', price: 30, nutrition: 'Quick energy, potassium' }
    ]
  } else if (budget <= 200) {
    return [
      { meal: 'Chicken Salad Bowl', price: 150, nutrition: 'High protein, vitamins' },
      { meal: 'Paneer Sandwich', price: 80, nutrition: 'Protein, calcium' },
      { meal: 'Mixed Veg Thali', price: 120, nutrition: 'Balanced nutrition' }
    ]
  } else {
    return [
      { meal: 'Quinoa Power Bowl', price: 220, nutrition: 'Complete protein, superfoods' },
      { meal: 'Grilled Fish with Salad', price: 280, nutrition: 'Omega-3, lean protein' },
      { meal: 'Acai Bowl', price: 250, nutrition: 'Antioxidants, healthy fats' }
    ]
  }
}

// Get study session nutrition tips
export const getStudyNutritionTips = (studyHours) => {
  const tips = [
    'Stay hydrated - drink water every 30 minutes',
    'Eat brain foods: nuts, berries, dark chocolate',
    'Avoid heavy meals that cause drowsiness',
    'Take nutrition breaks every 2 hours'
  ]
  
  if (studyHours > 6) {
    tips.push(
      'Long study session detected - eat protein-rich snacks',
      'Consider a light meal every 4 hours',
      'Omega-3 rich foods help with focus'
    )
  }
  
  return tips
}

// Format nutrition data for charts
export const formatNutritionChartData = (weeklyData) => {
  return Object.entries(weeklyData).map(([day, data]) => ({
    day: day.slice(0, 3), // Mon, Tue, etc.
    calories: data.calories || 0,
    protein: data.protein || 0,
    water: data.water || 0,
    healthScore: data.healthScore || 0
  }))
}

// Get achievement badges based on streaks and goals
export const getAchievementBadges = (userStats) => {
  const badges = []
  
  if (userStats.breakfastStreak >= 7) {
    badges.push({ name: 'Breakfast Champion', emoji: '🍳', description: '7-day breakfast streak!' })
  }
  
  if (userStats.waterStreak >= 30) {
    badges.push({ name: 'Hydration Master', emoji: '💧', description: '30-day water goal streak!' })
  }
  
  if (userStats.healthScore >= 85) {
    badges.push({ name: 'Nutrition Expert', emoji: '⭐', description: 'Excellent health score!' })
  }
  
  if (userStats.spotsExplored >= 10) {
    badges.push({ name: 'Food Explorer', emoji: '🗺️', description: 'Tried 10+ healthy spots!' })
  }
  
  return badges
}

// Student-specific time zone handling
export const getStudentScheduleTime = (time) => {
  const date = new Date(time)
  return {
    display: formatTime(date),
    isClassTime: (date.getHours() >= 9 && date.getHours() <= 17),
    isStudyTime: (date.getHours() >= 19 && date.getHours() <= 23),
    isBreakTime: (date.getHours() >= 12 && date.getHours() <= 13)
  }
}