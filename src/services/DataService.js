// Complete DataService with all methods
class DataService {
  constructor() {
    this.storageKey = 'nutribridge_data'
    this.userKey = 'nutribridge_user'
    this.mealsKey = 'nutribridge_meals'
    this.waterKey = 'nutribridge_water'
    
    // Initialize with default data if needed
    this.initializeDefaultData()
  }

  // Initialize default data structure
  initializeDefaultData() {
    if (!localStorage.getItem(this.userKey)) {
      const defaultUser = this.getDefaultUserData()
      localStorage.setItem(this.userKey, JSON.stringify(defaultUser))
    }
  }

  // Get user data (MAIN METHOD THAT WAS MISSING)
  getUserData() {
    try {
      const userData = localStorage.getItem(this.userKey)
      return userData ? JSON.parse(userData) : this.getDefaultUserData()
    } catch (error) {
      console.error('Error getting user data:', error)
      return this.getDefaultUserData()
    }
  }

  // Get default user structure
  getDefaultUserData() {
    return {
      profile: {
        name: 'Student',
        age: 20,
        weight: 65,
        height: 170,
        activityLevel: 'moderate',
        dietaryPreferences: [],
        allergies: [],
        healthGoals: ['Better Focus', 'More Energy'],
        college: 'Your College',
        course: 'Your Course'
      },
      currentStats: {
        healthScore: 65,
        streak: 3,
        totalChallengesCompleted: 2,
        spotsExplored: 1,
        budgetSpent: 120,
        budgetLimit: 300
      },
      todayLog: {
        date: new Date().toDateString(),
        breakfast: false,
        lunch: false,
        dinner: false,
        snacks: 1,
        waterGlasses: 3,
        vitamins: ['Vitamin D'],
        fastFood: 0,
        studyHours: 5,
        sleepHours: 7,
        mood: 'good',
        stressLevel: 4,
        energyLevel: 7,
        meals: [],
        budgetSpent: 0
      },
      weeklyData: this.generateWeeklyData(),
      challenges: this.getDefaultChallenges(),
      preferences: {
        notifications: true,
        aiTips: true,
        locationTracking: true,
        socialFeatures: true
      },
      goals: {
        waterGoal: 8,
        calorieGoal: 2000,
        proteinGoal: 60,
        stepsGoal: 8000
      },
      streaks: {
        waterStreak: 3,
        breakfastStreak: 2,
        healthyEatingStreak: 5
      }
    }
  }

  // Generate realistic weekly data
  generateWeeklyData() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const weeklyData = {}
    
    days.forEach((day, index) => {
      // Generate realistic varying data
      weeklyData[day] = {
        healthScore: Math.floor(Math.random() * 30) + 60, // 60-90
        waterGlasses: Math.floor(Math.random() * 4) + 5, // 5-8
        meals: Math.floor(Math.random() * 2) + 2, // 2-3
        calories: Math.floor(Math.random() * 600) + 1800, // 1800-2400
        protein: Math.floor(Math.random() * 40) + 60, // 60-100g
        fastFood: Math.floor(Math.random() * 3), // 0-2
        studyHours: Math.floor(Math.random() * 6) + 4, // 4-9
        stressLevel: Math.floor(Math.random() * 6) + 3 // 3-8
      }
    })
    
    return weeklyData
  }

  // Get default challenges
  getDefaultChallenges() {
    return [
      {
        id: 'breakfast_7day',
        title: '7-Day Breakfast Challenge',
        description: 'Don\'t skip breakfast for 7 consecutive days',
        type: 'habit',
        progress: 3,
        target: 7,
        points: 100,
        active: true,
        startDate: new Date().toISOString()
      },
      {
        id: 'hydration_daily',
        title: 'Daily Hydration Goal',
        description: 'Drink 8 glasses of water every day',
        type: 'daily',
        progress: 3,
        target: 8,
        points: 50,
        active: true,
        startDate: new Date().toISOString()
      },
      {
        id: 'spot_explorer',
        title: 'Healthy Spot Explorer',
        description: 'Try 5 different healthy spots this month',
        type: 'exploration',
        progress: 1,
        target: 5,
        points: 150,
        active: true,
        startDate: new Date().toISOString()
      }
    ]
  }

  // Save user data
  saveUserData(data) {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(data))
      return data
    } catch (error) {
      console.error('Error saving user data:', error)
      return null
    }
  }

  // Update specific fields
  updateUserData(updates) {
    try {
      const currentData = this.getUserData()
      const updatedData = this.deepMerge(currentData, updates)
      return this.saveUserData(updatedData)
    } catch (error) {
      console.error('Error updating user data:', error)
      return null
    }
  }

  // Deep merge objects
  deepMerge(target, source) {
    const output = Object.assign({}, target)
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] })
          else
            output[key] = this.deepMerge(target[key], source[key])
        } else {
          Object.assign(output, { [key]: source[key] })
        }
      })
    }
    return output
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item)
  }

  // Log today's activity
  logActivity(type, value) {
    try {
      const userData = this.getUserData()
      const today = new Date().toDateString()
      
      // Reset if it's a new day
      if (userData.todayLog.date !== today) {
        userData.todayLog = {
          ...this.getDefaultUserData().todayLog,
          date: today
        }
      }
      
      // Update specific activity
      switch(type) {
        case 'water':
          userData.todayLog.waterGlasses = Math.min(userData.todayLog.waterGlasses + 1, 15)
          break
        case 'meal':
          userData.todayLog[value] = true
          break
        case 'snack':
          userData.todayLog.snacks += 1
          break
        case 'study':
          userData.todayLog.studyHours = value
          break
        case 'sleep':
          userData.todayLog.sleepHours = value
          break
        case 'stress':
          userData.todayLog.stressLevel = value
          break
        case 'energy':
          userData.todayLog.energyLevel = value
          break
        case 'fastfood':
          userData.todayLog.fastFood += 1
          break
      }
      
      // Update health score
      userData.currentStats.healthScore = this.calculateHealthScore(userData.todayLog)
      
      return this.saveUserData(userData)
    } catch (error) {
      console.error('Error logging activity:', error)
      return null
    }
  }

  // Calculate dynamic health score
  calculateHealthScore(todayLog) {
    try {
      const breakfastScore = todayLog.breakfast ? 25 : 0
      const waterScore = Math.min((todayLog.waterGlasses / 8) * 25, 25)
      const mealScore = ((todayLog.lunch ? 1 : 0) + (todayLog.dinner ? 1 : 0)) * 12.5
      const sleepScore = Math.min((todayLog.sleepHours / 8) * 15, 15)
      const fastFoodPenalty = todayLog.fastFood * 10
      const stressPenalty = Math.max(0, (todayLog.stressLevel - 5) * 3)
      
      return Math.max(0, Math.min(100, breakfastScore + waterScore + mealScore + sleepScore - fastFoodPenalty - stressPenalty))
    } catch (error) {
      console.error('Error calculating health score:', error)
      return 65 // Default fallback
    }
  }

  // Log detailed meal entry
  logMealEntry(mealEntry) {
    try {
      const meals = this.getMealHistory()
      const today = new Date().toDateString()
      
      if (!meals[today]) {
        meals[today] = []
      }
      
      meals[today].push({
        id: this.generateId(),
        ...mealEntry,
        timestamp: new Date().toISOString()
      })
      
      localStorage.setItem(this.mealsKey, JSON.stringify(meals))
      return meals[today]
    } catch (error) {
      console.error('Error logging meal entry:', error)
      return []
    }
  }

  // Get meal history
  getMealHistory(days = 30) {
    try {
      const stored = localStorage.getItem(this.mealsKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error getting meal history:', error)
      return {}
    }
  }

  // Log water intake with detailed tracking
  logWaterIntake(amount, timestamp = new Date()) {
    try {
      const waterLog = this.getWaterHistory()
      const today = timestamp.toDateString()
      
      if (!waterLog[today]) {
        waterLog[today] = []
      }
      
      waterLog[today].push({
        id: this.generateId(),
        amount,
        timestamp: timestamp.toISOString(),
        type: amount >= 2 ? 'bottle' : amount >= 1 ? 'glass' : 'sip'
      })
      
      localStorage.setItem(this.waterKey, JSON.stringify(waterLog))
      
      // Update daily total
      const userData = this.getUserData()
      const totalToday = waterLog[today].reduce((sum, entry) => sum + entry.amount, 0)
      
      this.updateUserData({
        todayLog: {
          ...userData.todayLog,
          waterGlasses: totalToday
        }
      })
      
      return waterLog[today]
    } catch (error) {
      console.error('Error logging water intake:', error)
      return []
    }
  }

  // Get water history
  getWaterHistory(days = 30) {
    try {
      const stored = localStorage.getItem(this.waterKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error getting water history:', error)
      return {}
    }
  }

  // Get nearby spots (mock data for now)
  async getNearbySpots(location, filters = {}) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockSpots = [
        {
          id: 'green_cafe_001',
          name: 'Green Cafe',
          type: 'Vegetarian Restaurant',
          category: 'cafe',
          rating: 4.5,
          priceRange: { min: 80, max: 200, currency: '₹' },
          healthScore: 9.2,
          location: { 
            lat: location?.lat || 28.6139, 
            lng: location?.lng || 77.2090,
            address: 'Student Center, Block A'
          },
          features: ['Organic', 'Vegan Options', 'Fresh Juices', 'WiFi'],
          mealTypes: ['breakfast', 'lunch', 'dinner', 'snacks'],
          isOpen: true,
          crowdLevel: 'medium',
          waitTime: Math.floor(Math.random() * 10) + 2,
          image: '🥗',
          phone: '+91-9876543210'
        }
      ]
      
      return mockSpots.map(spot => ({
        ...spot,
        distance: Math.random() * 2000 + 100,
        calculatedDistance: Math.random() * 2000 + 100
      }))
    } catch (error) {
      console.error('Error getting nearby spots:', error)
      return []
    }
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Get smart reminders
  getSmartReminders() {
    try {
      const userData = this.getUserData()
      const now = new Date()
      const hour = now.getHours()
      const reminders = []

      if (hour >= 7 && hour <= 10 && !userData.todayLog.breakfast) {
        reminders.push({
          type: 'meal',
          priority: 'high',
          message: 'Time for breakfast! Your brain needs fuel for the day.',
          action: 'Log Breakfast'
        })
      }

      if (userData.todayLog.waterGlasses < 4 && hour > 10) {
        reminders.push({
          type: 'water',
          priority: 'medium',
          message: `You're ${8 - userData.todayLog.waterGlasses} glasses behind your hydration goal.`,
          action: 'Log Water'
        })
      }

      return reminders
    } catch (error) {
      console.error('Error getting smart reminders:', error)
      return []
    }
  }

  // Export data
  exportData() {
    try {
      return {
        user: this.getUserData(),
        meals: this.getMealHistory(),
        water: this.getWaterHistory(),
        exportDate: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      return null
    }
  }

  // Clear all data (for testing)
  clearAllData() {
    try {
      localStorage.removeItem(this.userKey)
      localStorage.removeItem(this.mealsKey)
      localStorage.removeItem(this.waterKey)
      this.initializeDefaultData()
      return true
    } catch (error) {
      console.error('Error clearing data:', error)
      return false
    }
  }

  // Check if service is working
  isHealthy() {
    try {
      const testData = this.getUserData()
      return testData && testData.profile && testData.todayLog
    } catch (error) {
      console.error('DataService health check failed:', error)
      return false
    }
  }
}

// Export as singleton instance
const dataServiceInstance = new DataService()

// Debug logging
console.log('🔧 DataService initialized:', {
  isHealthy: dataServiceInstance.isHealthy(),
  methods: Object.getOwnPropertyNames(DataService.prototype).filter(name => name !== 'constructor')
})

export default dataServiceInstance