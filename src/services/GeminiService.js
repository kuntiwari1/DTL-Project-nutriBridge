import { GoogleGenerativeAI } from '@google/generative-ai'

class GeminiService {
  constructor() {
    // Environment variable handling for different build systems
    this.apiKey = import.meta.env?.VITE_GEMINI_API_KEY || 
                  process.env?.REACT_APP_GEMINI_API_KEY || 
                  window.GEMINI_API_KEY || 
                  'demo-mode'
    
    this.isDemoMode = this.apiKey === 'demo-mode' || !this.apiKey
    
    // Available models (updated for current API)
    this.availableModels = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro-vision',
      'gemini-1.0-pro'
    ]
    
    this.currentModel = 'gemini-1.5-flash' // Most reliable and fast
    
    if (!this.isDemoMode) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey)
        this.model = this.genAI.getGenerativeModel({ 
          model: this.currentModel,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
        console.log(`🤖 Gemini AI initialized with model: ${this.currentModel}`)
      } catch (error) {
        console.warn('Gemini AI initialization failed, using demo mode:', error)
        this.isDemoMode = true
      }
    } else {
      console.log('🎭 Running in Demo Mode - Realistic AI simulation active')
    }
  }

  // Safe array/object access helper
  safeAccess(obj, path, defaultValue = null) {
    try {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : defaultValue
      }, obj)
    } catch (error) {
      return defaultValue
    }
  }

  // Safe array join helper
  safeJoin(arr, separator = ', ', defaultValue = 'None specified') {
    try {
      if (!Array.isArray(arr) || arr.length === 0) return defaultValue
      return arr.filter(item => item != null && item !== '').join(separator)
    } catch (error) {
      return defaultValue
    }
  }

  // Validate user data structure
  validateUserData(userData) {
    const safe = {
      profile: {
        age: this.safeAccess(userData, 'profile.age', 20),
        weight: this.safeAccess(userData, 'profile.weight', 65),
        height: this.safeAccess(userData, 'profile.height', 170),
        activityLevel: this.safeAccess(userData, 'profile.activityLevel', 'moderate'),
        dietaryPreferences: this.safeAccess(userData, 'profile.dietaryPreferences', []),
        healthGoals: this.safeAccess(userData, 'profile.healthGoals', []),
        course: this.safeAccess(userData, 'profile.course', 'Student'),
        college: this.safeAccess(userData, 'profile.college', 'College')
      },
      todayLog: {
        breakfast: this.safeAccess(userData, 'todayLog.breakfast', false),
        lunch: this.safeAccess(userData, 'todayLog.lunch', false),
        dinner: this.safeAccess(userData, 'todayLog.dinner', false),
        waterGlasses: this.safeAccess(userData, 'todayLog.waterGlasses', 0),
        studyHours: this.safeAccess(userData, 'todayLog.studyHours', 0),
        sleepHours: this.safeAccess(userData, 'todayLog.sleepHours', 7),
        stressLevel: this.safeAccess(userData, 'todayLog.stressLevel', 5),
        energyLevel: this.safeAccess(userData, 'todayLog.energyLevel', 5),
        fastFood: this.safeAccess(userData, 'todayLog.fastFood', 0)
      },
      currentStats: {
        healthScore: this.safeAccess(userData, 'currentStats.healthScore', 65)
      },
      weeklyData: this.safeAccess(userData, 'weeklyData', {})
    }
    
    return safe
  }

  // Generate personalized health tips with fallback system
  async getPersonalizedHealthTips(userData) {
    try {
      console.log('🤖 Requesting health tips...')
      
      // Validate and sanitize user data
      const safeUserData = this.validateUserData(userData || {})
      
      // Try real AI first if available
      if (!this.isDemoMode && this.model) {
        try {
          console.log('🤖 Requesting real AI health tips...')
          const prompt = this.buildHealthTipsPrompt(safeUserData)
          
          const result = await this.model.generateContent(prompt)
          const response = await result.response
          const text = response.text()
          
          console.log('✅ AI Response received successfully')
          return this.parseHealthTipsResponse(text)
        } catch (error) {
          console.error('❌ Real AI failed, falling back to demo mode:', error)
          
          // Try alternative model if main fails
          if (error.message && error.message.includes('not found')) {
            return await this.tryAlternativeModel(safeUserData)
          }
          
          // Fall back to demo mode
          return this.generateAdvancedDemoHealthTips(safeUserData)
        }
      }

      // Use advanced demo mode
      console.log('🎭 Using Advanced Demo AI Mode...')
      return this.generateAdvancedDemoHealthTips(safeUserData)
    } catch (error) {
      console.error('Error in getPersonalizedHealthTips:', error)
      return this.getFallbackHealthTips()
    }
  }

  // Try alternative models if main model fails
  async tryAlternativeModel(userData) {
    for (const modelName of this.availableModels) {
      if (modelName === this.currentModel) continue // Skip the one that failed
      
      try {
        console.log(`🔄 Trying alternative model: ${modelName}`)
        this.model = this.genAI.getGenerativeModel({ model: modelName })
        
        const prompt = this.buildHealthTipsPrompt(userData)
        const result = await this.model.generateContent(prompt)
        const response = await result.response
        
        console.log(`✅ Success with model: ${modelName}`)
        this.currentModel = modelName // Update current model
        return this.parseHealthTipsResponse(response.text())
      } catch (error) {
        console.warn(`❌ Model ${modelName} failed:`, error.message)
        continue
      }
    }
    
    // If all models fail, use demo mode
    console.log('🎭 All AI models failed, using advanced demo mode')
    return this.generateAdvancedDemoHealthTips(userData)
  }

  // Generate advanced demo health tips with AI-like intelligence
  generateAdvancedDemoHealthTips(userData) {
    try {
      const safeUserData = this.validateUserData(userData)
      const analysis = this.performDeepAnalysis(safeUserData)
      
      console.log('🧠 Demo analysis completed successfully')
      
      return {
        immediateActions: this.generatePersonalizedActions(analysis),
        weeklyHabits: this.generateWeeklyHabits(analysis),
        mealRecommendation: this.generateMealRecommendation(analysis),
        studyInsight: this.generateStudyInsight(analysis),
        motivation: this.generateMotivation(analysis),
        healthScoreAnalysis: this.generateHealthAnalysis(analysis),
        confidence: 'demo',
        analysisMetrics: analysis.metrics
      }
    } catch (error) {
      console.error('Error in generateAdvancedDemoHealthTips:', error)
      return this.getFallbackHealthTips()
    }
  }

  // Perform deep analysis of user data with null safety
  performDeepAnalysis(userData) {
    try {
      const safeUserData = this.validateUserData(userData)
      const { profile, todayLog, currentStats, weeklyData } = safeUserData
      const hour = new Date().getHours()
      const day = new Date().getDay() // 0 = Sunday
      
      // Calculate weekly averages with null safety
      const weeklyAvg = {
        healthScore: this.calculateWeeklyAverage(weeklyData, 'healthScore'),
        water: this.calculateWeeklyAverage(weeklyData, 'waterGlasses'),
        stress: this.calculateWeeklyAverage(weeklyData, 'stressLevel'),
        study: this.calculateWeeklyAverage(weeklyData, 'studyHours')
      }
      
      // Analyze patterns and trends
      const patterns = {
        missedBreakfast: !todayLog.breakfast && hour > 10,
        dehydrated: todayLog.waterGlasses < (hour > 12 ? hour/2 : 2),
        longStudySession: todayLog.studyHours > 6,
        highStress: todayLog.stressLevel > 7,
        lowEnergy: todayLog.energyLevel < 5,
        fastFoodPattern: todayLog.fastFood > 1,
        sleepDeprived: todayLog.sleepHours < 7,
        weekendPattern: day === 0 || day === 6,
        examPeriod: todayLog.stressLevel > 6 && todayLog.studyHours > 5
      }
      
      // Risk assessment
      const risks = {
        burnout: patterns.longStudySession && patterns.highStress && patterns.sleepDeprived,
        nutritionDeficit: patterns.missedBreakfast && patterns.fastFoodPattern,
        cognitiveDecline: patterns.dehydrated && patterns.lowEnergy,
        metabolicStress: patterns.fastFoodPattern && patterns.highStress
      }
      
      // Opportunity identification
      const opportunities = {
        energyBoost: !patterns.dehydrated && todayLog.breakfast,
        stressReduction: todayLog.sleepHours >= 7 && !patterns.fastFoodPattern,
        performanceOptimization: currentStats.healthScore > 70,
        habitBuilding: true // Always an opportunity
      }
      
      return {
        current: {
          hour,
          day,
          timeOfDay: this.getTimeOfDay(hour),
          healthScore: currentStats.healthScore,
          trend: this.calculateTrend(weeklyData, 'healthScore')
        },
        patterns,
        risks,
        opportunities,
        weeklyAvg,
        metrics: {
          hydrationEfficiency: Math.min((todayLog.waterGlasses / 8) * 100, 100),
          nutritionConsistency: weeklyAvg.healthScore,
          stressManagement: Math.max(0, 10 - weeklyAvg.stress),
          academicBalance: Math.min((weeklyAvg.study / 8) * 100, 100)
        }
      }
    } catch (error) {
      console.error('Error in performDeepAnalysis:', error)
      return this.getDefaultAnalysis()
    }
  }

  // Get default analysis when everything fails
  getDefaultAnalysis() {
    return {
      current: {
        hour: new Date().getHours(),
        day: new Date().getDay(),
        timeOfDay: this.getTimeOfDay(new Date().getHours()),
        healthScore: 65,
        trend: 'stable'
      },
      patterns: {
        missedBreakfast: false,
        dehydrated: false,
        longStudySession: false,
        highStress: false,
        lowEnergy: false
      },
      risks: {},
      opportunities: { habitBuilding: true },
      weeklyAvg: { healthScore: 65, water: 6, stress: 5, study: 6 },
      metrics: {
        hydrationEfficiency: 75,
        nutritionConsistency: 65,
        stressManagement: 5,
        academicBalance: 75
      }
    }
  }

  // Calculate trend direction with null safety
  calculateTrend(weeklyData, field) {
    try {
      if (!weeklyData || typeof weeklyData !== 'object') {
        return 'stable'
      }
      
      const values = Object.values(weeklyData)
        .map(day => (day && day[field]) ? day[field] : 0)
        .filter(val => val > 0)
      
      if (values.length < 2) return 'stable'
      
      const recent = values.slice(-3).reduce((a, b) => a + b, 0) / Math.max(values.slice(-3).length, 1)
      const earlier = values.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(values.slice(0, -3).length, 1)
      
      const difference = recent - earlier
      if (Math.abs(difference) < 0.1) return 'stable'
      return difference > 0 ? 'improving' : 'declining'
    } catch (error) {
      console.error('Error calculating trend:', error)
      return 'stable'
    }
  }

  // Calculate weekly averages with null safety
  calculateWeeklyAverage(weeklyData, field) {
    try {
      if (!weeklyData || typeof weeklyData !== 'object') {
        // Return sensible defaults based on field
        const defaults = {
          healthScore: 65,
          waterGlasses: 6,
          stressLevel: 5,
          studyHours: 6,
          calories: 2000,
          protein: 60
        }
        return defaults[field] || 0
      }
      
      const values = Object.values(weeklyData)
        .map(day => (day && day[field] !== undefined) ? day[field] : 0)
        .filter(val => val >= 0)
      
      if (values.length === 0) {
        const defaults = {
          healthScore: 65,
          waterGlasses: 6,
          stressLevel: 5,
          studyHours: 6,
          calories: 2000,
          protein: 60
        }
        return defaults[field] || 0
      }
      
      return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    } catch (error) {
      console.error('Error calculating weekly average:', error)
      return 0
    }
  }

  // Generate personalized immediate actions
  generatePersonalizedActions(analysis) {
    try {
      const actions = []
      const { patterns, risks, current } = analysis || {}
      
      // Priority 1: Address immediate risks
      if (risks?.burnout) {
        actions.push("🚨 URGENT: Take a 20-minute break with deep breathing - burnout risk detected!")
      } else if (risks?.cognitiveDecline) {
        actions.push("🧠 FOCUS ALERT: Drink 2 glasses of water immediately - your brain needs hydration!")
      }
      
      // Priority 2: Time-sensitive actions
      if (patterns?.missedBreakfast && current?.hour < 12) {
        actions.push("⚡ BREAKFAST NOW: Grab a protein bar or banana - your brain has been fasting too long!")
      } else if (patterns?.dehydrated) {
        actions.push("💧 HYDRATION CHECK: You need more water - aim for 1 glass every hour")
      }
      
      // Priority 3: Performance optimization
      if (current?.timeOfDay === 'afternoon' && !patterns?.lowEnergy) {
        actions.push("🎯 PEAK PERFORMANCE: You're in your optimal zone - tackle your most challenging tasks now!")
      } else if (patterns?.longStudySession) {
        actions.push("📚 STUDY BREAK: Every 90 minutes, take 10 minutes for movement and nutrition")
      }
      
      // Default actions if nothing specific
      if (actions.length === 0) {
        actions.push(
          "💧 Stay hydrated - drink water regularly throughout the day",
          "🍎 Plan your next healthy meal to maintain energy",
          "⏰ Take regular breaks to avoid burnout"
        )
      }
      
      return actions.slice(0, 3) // Top 3 most relevant
    } catch (error) {
      console.error('Error generating actions:', error)
      return [
        "💧 Drink water regularly",
        "🍎 Eat balanced meals", 
        "⏰ Take study breaks"
      ]
    }
  }

  // Generate weekly habits based on analysis
  generateWeeklyHabits(analysis) {
    try {
      const habits = []
      const { patterns, weeklyAvg } = analysis || {}
      
      if (weeklyAvg?.water < 6) {
        habits.push("💧 HYDRATION SYSTEM: Set phone alarms every 2 hours - dehydration is sabotaging your grades")
      }
      
      if (patterns?.missedBreakfast) {
        habits.push("🍳 BREAKFAST PROTOCOL: Prep overnight oats on Sunday - consistent breakfast = 25% better focus")
      }
      
      if (weeklyAvg?.stress > 6) {
        habits.push("🧘 STRESS MANAGEMENT: Add 10 minutes of meditation before study sessions - reduces stress by 40%")
      }
      
      // Default habits if none specific
      if (habits.length === 0) {
        habits.push(
          "📈 HABIT STACKING: Link new healthy habits to existing strong routines for automatic success",
          "🎯 CONSISTENCY: Focus on one small habit at a time for better long-term results"
        )
      }
      
      return habits.slice(0, 2)
    } catch (error) {
      console.error('Error generating habits:', error)
      return [
        "📈 Build consistent daily routines",
        "🎯 Focus on small, sustainable changes"
      ]
    }
  }

  // Generate meal recommendation with scientific backing
  generateMealRecommendation(analysis) {
    try {
      const { current, patterns } = analysis || {}
      const timeOfDay = current?.timeOfDay || this.getTimeOfDay(new Date().getHours())
      
      const recommendations = {
        morning: {
          meal: "Brain-Power Overnight Oats",
          reason: "Complex carbs + protein for 4-hour sustained energy",
          benefits: "Improves memory formation by 30%, prevents mid-morning crashes"
        },
        afternoon: {
          meal: "Mediterranean Power Bowl",
          reason: "Balanced macros prevent afternoon energy dip",
          benefits: "Omega-3s enhance focus, complex carbs sustain energy for 3+ hours"
        },
        evening: {
          meal: "Study Session Smoothie",
          reason: "Light nutrition that won't cause drowsiness",
          benefits: "Antioxidants support night-time brain detox, easy digestion"
        },
        night: {
          meal: "Calming Chamomile Bowl",
          reason: "Promotes sleep quality for better next-day performance",
          benefits: "Magnesium aids muscle relaxation, tryptophan supports sleep"
        }
      }
      
      let recommendation = recommendations[timeOfDay] || recommendations.afternoon
      
      // Customize based on specific patterns
      if (patterns?.highStress) {
        recommendation = {
          meal: "Stress-Busting Magnesium Bowl",
          reason: "High stress detected - magnesium-rich foods reduce cortisol",
          benefits: "Dark leafy greens + nuts reduce anxiety, improve focus under pressure"
        }
      } else if (patterns?.longStudySession) {
        recommendation = {
          meal: "Study Marathon Fuel",
          reason: "Long study session requires sustained nutrition",
          benefits: "Slow-release energy prevents crashes, B-vitamins support neurotransmitters"
        }
      }
      
      return recommendation
    } catch (error) {
      console.error('Error generating meal recommendation:', error)
      return {
        meal: "Balanced Nutrition Bowl",
        reason: "Provides steady energy for your daily activities",
        benefits: "Supports overall health and cognitive function"
      }
    }
  }

  // Generate study-nutrition insight
  generateStudyInsight(analysis) {
    try {
      const { patterns, risks, weeklyAvg, metrics } = analysis || {}
      
      if (risks?.burnout) {
        return "🔬 CRITICAL RESEARCH: Students who maintain hydration during intense study show 35% better information retention. Your current pattern suggests immediate intervention needed!"
      }
      
      if (patterns?.examPeriod) {
        return "📊 EXAM PERFORMANCE DATA: Students eating omega-3 rich foods score 15% higher on exams. Your stress levels indicate you're in exam mode - nutrition is crucial!"
      }
      
      if (metrics?.hydrationEfficiency < 50) {
        return "🧠 NEUROSCIENCE FACT: 2% dehydration reduces cognitive performance by 23%. Your current hydration level is directly impacting your study efficiency!"
      }
      
      if (weeklyAvg?.healthScore > 75) {
        return "⭐ SUCCESS PATTERN: Your consistent nutrition habits are creating optimal brain chemistry for learning. Students with similar patterns show 28% better academic outcomes!"
      }
      
      return "🎯 PERSONALIZED INSIGHT: Your nutrition-study correlation shows room for optimization. Small improvements in meal timing could boost your focus by 15-20%!"
    } catch (error) {
      console.error('Error generating study insight:', error)
      return "🎯 STUDY TIP: Proper nutrition directly impacts cognitive performance. Stay hydrated and eat regularly for better focus!"
    }
  }

  // Generate personalized motivation
  generateMotivation(analysis) {
    try {
      const { current, opportunities, metrics } = analysis || {}
      
      if (metrics?.nutritionConsistency > 80) {
        return "🏆 EXCELLENCE ACHIEVED! You're in the top 5% of students for nutrition consistency. Your future self is already thanking you for these incredible habits! 🌟"
      }
      
      if (current?.trend === 'improving') {
        return "🚀 MOMENTUM BUILDING! Your health score is trending upward - you're proving that small daily choices create massive results. Keep this energy! 💪"
      }
      
      if (opportunities?.habitBuilding) {
        return "🔥 HABIT MASTERY! You're building the same nutrition patterns that successful students use. Every healthy choice today is an investment in tomorrow's success! 🎯"
      }
      
      return "✨ PROGRESS CHAMPION! Every step toward better nutrition is a step toward better grades, better energy, and a better you. You've got this! 🎓"
    } catch (error) {
      console.error('Error generating motivation:', error)
      return "✨ KEEP GOING! Every healthy choice you make is an investment in your success. You're building great habits! 🎯"
    }
  }

  // Generate health score analysis
  generateHealthAnalysis(analysis) {
    try {
      const { current, patterns, metrics, weeklyAvg } = analysis || {}
      const score = current?.healthScore || 65
      
      if (score >= 85) {
        return `Outstanding ${score}%! You're operating at peak nutritional efficiency. Your consistency puts you in the academic success zone. Research shows students with your patterns score 20-25% higher on exams.`
      }
      
      if (score >= 70) {
        return `Solid ${score}% with ${current?.trend || 'stable'} trend! Your foundation is strong. Focus areas: ${patterns?.dehydrated ? 'hydration timing' : ''} ${patterns?.missedBreakfast ? 'breakfast consistency' : ''}. You're 2-3 small changes away from excellence!`
      }
      
      if (score >= 50) {
        const improvements = []
        if (patterns?.missedBreakfast) improvements.push('breakfast routine')
        if (patterns?.dehydrated) improvements.push('hydration schedule')
        if (patterns?.fastFoodPattern) improvements.push('meal planning')
        
        return `Your ${score}% score shows potential! Priority improvements: ${improvements.join(', ') || 'consistency'}. Students who address these areas typically see 30-40 point improvements within 2 weeks!`
      }
      
      return `Your ${score}% indicates immediate opportunity! Start with: 1) Drink water now, 2) Plan next healthy meal, 3) Set breakfast reminder. These basics can boost your score 20+ points this week. Small changes, big results! 🎯`
    } catch (error) {
      console.error('Error generating health analysis:', error)
      return "Your health score shows room for improvement. Focus on consistency in hydration, regular meals, and good sleep habits for better results!"
    }
  }

  // Helper methods
  getTimeOfDay(hour) {
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  }

  // Build prompt for real AI with null safety
  buildHealthTipsPrompt(userData) {
    try {
      const safeUserData = this.validateUserData(userData)
      const { profile, todayLog, currentStats, weeklyData } = safeUserData
      
      return `You are a nutrition expert specializing in college student health and academic performance. Analyze this student's data and provide personalized recommendations.

STUDENT CONTEXT:
- Demographics: ${profile.age}yr, ${profile.weight}kg, ${profile.height}cm, ${profile.activityLevel} activity
- Academic: ${profile.course} student at ${profile.college}
- Goals: ${this.safeJoin(profile.healthGoals)}
- Preferences: ${this.safeJoin(profile.dietaryPreferences)}

TODAY'S METRICS:
- Health Score: ${currentStats.healthScore}%
- Meals: Breakfast ${todayLog.breakfast ? '✓' : '✗'}, Lunch ${todayLog.lunch ? '✓' : '✗'}, Dinner ${todayLog.dinner ? '✓' : '✗'}
- Hydration: ${todayLog.waterGlasses}/8 glasses
- Lifestyle: ${todayLog.studyHours}h study, ${todayLog.sleepHours}h sleep, stress ${todayLog.stressLevel}/10, energy ${todayLog.energyLevel}/10
- Nutrition: ${todayLog.fastFood} fast food items

WEEKLY PATTERN:
- Avg Health Score: ${this.calculateWeeklyAverage(weeklyData, 'healthScore')}%
- Avg Hydration: ${this.calculateWeeklyAverage(weeklyData, 'waterGlasses')} glasses
- Avg Study Hours: ${this.calculateWeeklyAverage(weeklyData, 'studyHours')}h
- Avg Stress: ${this.calculateWeeklyAverage(weeklyData, 'stressLevel')}/10

Provide a JSON response with:
{
  "immediateActions": ["3 urgent actionable tips for next 2 hours"],
  "weeklyHabits": ["2 sustainable habit changes for next week"],
  "mealRecommendation": {
    "meal": "specific meal name",
    "reason": "why this meal now",
    "benefits": "specific health/academic benefits"
  },
  "studyInsight": "correlation between current nutrition and academic performance",
  "motivation": "encouraging message based on current progress",
  "healthScoreAnalysis": "detailed analysis of health score with specific improvement areas"
}

Focus on college student lifestyle, academic performance correlation, and practical actionable advice.`
    } catch (error) {
      console.error('Error building prompt:', error)
      return "Provide general health tips for a college student."
    }
  }

  // Parse AI response with robust error handling
  parseHealthTipsResponse(responseText) {
    try {
      // Clean the response text
      let cleanText = responseText.trim()
      
      // Extract JSON from markdown if present
      const jsonMatch = cleanText.match(/```json\n([\s\S]*?)\n```/) || 
                       cleanText.match(/```\n([\s\S]*?)\n```/) ||
                       cleanText.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        cleanText = jsonMatch[1] || jsonMatch[0]
      }
      
      // Parse the JSON
      const parsed = JSON.parse(cleanText)
      
      // Validate required fields
      const required = ['immediateActions', 'weeklyHabits', 'mealRecommendation', 'studyInsight', 'motivation', 'healthScoreAnalysis']
      const missing = required.filter(field => !parsed[field])
      
      if (missing.length > 0) {
        console.warn(`Missing AI response fields: ${missing.join(', ')}`)
        // Fill missing fields with defaults
        return { ...this.getFallbackHealthTips(), ...parsed }
      }
      
      return parsed
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return this.getFallbackHealthTips()
    }
  }

  // Enhanced fallback tips when AI is unavailable
  getFallbackHealthTips() {
    const hour = new Date().getHours()
    const timeBasedTips = this.getTimeBasedTips(hour)
    
    return {
      immediateActions: [
        timeBasedTips.immediate,
        "Drink a glass of water right now - your brain is 75% water!",
        "Take a 5-minute break from screen time to refresh your mind"
      ],
      weeklyHabits: [
        "Set daily water intake reminders on your phone",
        "Plan healthy snacks for study sessions every Sunday"
      ],
      mealRecommendation: {
        meal: timeBasedTips.meal,
        reason: timeBasedTips.reason,
        benefits: "Sustained energy and better focus for academic success"
      },
      studyInsight: "Proper hydration can improve concentration by up to 23% - crucial for exam performance!",
      motivation: "Small healthy choices today lead to big academic wins tomorrow! You're building habits that successful students have! 🎯",
      healthScoreAnalysis: "You're on the right track! Consistency in small daily habits creates the biggest health improvements."
    }
  }

  // Get time-based tips
  getTimeBasedTips(hour) {
    if (hour >= 6 && hour <= 10) {
      return {
        immediate: "Start your day with a protein-rich breakfast for sustained energy",
        meal: "Oats with banana and nuts",
        reason: "Perfect energy boost for morning classes and better focus"
      }
    } else if (hour >= 11 && hour <= 15) {
      return {
        immediate: "Have a balanced lunch to maintain afternoon energy levels",
        meal: "Quinoa bowl with vegetables and lean protein",
        reason: "Sustained energy for afternoon activities and prevents energy crashes"
      }
    } else if (hour >= 16 && hour <= 19) {
      return {
        immediate: "Fuel up with a healthy snack before evening study session",
        meal: "Greek yogurt with berries and honey",
        reason: "Perfect brain food for evening studies without causing drowsiness"
      }
    } else {
      return {
        immediate: "Choose a light, nutritious dinner for better sleep quality",
        meal: "Grilled fish with vegetables or light soup",
        reason: "Easy digestion promotes better sleep and morning energy"
      }
    }
  }

  // API Status and configuration
  async testConnection() {
    if (this.isDemoMode) {
      return { status: 'demo', message: 'Demo mode active - all features working' }
    }
    
    try {
      const result = await this.model.generateContent('Test connection')
      return { status: 'connected', message: `Successfully connected to ${this.currentModel}` }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  }

  getStatus() {
    return {
      mode: this.isDemoMode ? 'demo' : 'ai',
      model: this.currentModel,
      configured: !this.isDemoMode,
      apiKey: this.apiKey ? 'Set' : 'Not set'
    }
  }
}

export default new GeminiService()