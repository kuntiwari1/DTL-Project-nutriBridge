class MealDataService {
  
  // Get all meals for a specific date
  static getMealsForDate(date = new Date()) {
    const dateKey = date.toDateString()
    const userData = DataService.getUserData()
    const mealHistory = userData.mealHistory || {}
    
    return mealHistory[dateKey] || []
  }

  // Get meals for current day
  static getTodaysMeals() {
    return this.getMealsForDate(new Date())
  }

  // Get meals for a date range
  static getMealsForRange(startDate, endDate) {
    const userData = DataService.getUserData()
    const mealHistory = userData.mealHistory || {}
    const meals = []
    
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateKey = currentDate.toDateString()
      const dayMeals = mealHistory[dateKey] || []
      meals.push(...dayMeals.map(meal => ({
        ...meal,
        date: dateKey
      })))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return meals
  }

  // Get meals by type (breakfast, lunch, dinner, snacks)
  static getMealsByType(mealType, days = 7) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const allMeals = this.getMealsForRange(startDate, endDate)
    return allMeals.filter(meal => meal.mealType === mealType)
  }

  // Get meal statistics
  static getMealStatistics(days = 7) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const meals = this.getMealsForRange(startDate, endDate)
    
    return {
      totalMeals: meals.length,
      totalCalories: meals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
      totalProtein: meals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
      healthyMeals: meals.filter(meal => meal.healthy).length,
      unhealthyMeals: meals.filter(meal => !meal.healthy).length,
      mealTypes: {
        breakfast: meals.filter(m => m.mealType === 'breakfast').length,
        lunch: meals.filter(m => m.mealType === 'lunch').length,
        dinner: meals.filter(m => m.mealType === 'dinner').length,
        snacks: meals.filter(m => m.mealType === 'snacks').length
      },
      avgCaloriesPerDay: meals.reduce((sum, meal) => sum + (meal.calories || 0), 0) / days,
      popularMeals: this.getMostPopularMeals(meals),
      frequentLocations: this.getFrequentLocations(meals)
    }
  }

  // Get most popular meals
  static getMostPopularMeals(meals) {
    const mealCounts = {}
    meals.forEach(meal => {
      mealCounts[meal.meal] = (mealCounts[meal.meal] || 0) + 1
    })
    
    return Object.entries(mealCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([meal, count]) => ({ meal, count }))
  }

  // Get frequent dining locations
  static getFrequentLocations(meals) {
    const locationCounts = {}
    meals.forEach(meal => {
      if (meal.location) {
        locationCounts[meal.location] = (locationCounts[meal.location] || 0) + 1
      }
    })
    
    return Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([location, count]) => ({ location, count }))
  }
}

export default MealDataService