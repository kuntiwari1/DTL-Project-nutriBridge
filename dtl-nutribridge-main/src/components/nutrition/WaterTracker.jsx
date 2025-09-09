import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Minus, Target, Award, Bell, BellOff, 
  Clock, Settings, BookOpen, Moon, Sun, AlertCircle 
} from 'lucide-react'
import WaterDropIcon from '../icons/WaterDropIcon'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import DataService from '../../services/DataService'

const WaterTracker = ({ onWaterLogged }) => {
  const [todayWater, setTodayWater] = useState(0)
  const [goal, setGoal] = useState(8)
  const [streak, setStreak] = useState(0)
  const [lastLogTime, setLastLogTime] = useState(null)
  
  // Notification states
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [nextNotificationTime, setNextNotificationTime] = useState(null)
  const [studyModeActive, setStudyModeActive] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    frequency: 'smart', // smart, regular, frequent
    quietHours: { start: 22, end: 7 }, // 10 PM to 7 AM
    weekendMode: true,
    studyBoost: false
  })

  useEffect(() => {
    loadWaterData()
    initializeNotifications()
  }, [])

  useEffect(() => {
    // Schedule next notification when water is logged
    if (notificationsEnabled && todayWater >= 0) {
      scheduleNextNotification()
    }
  }, [todayWater, notificationsEnabled, studyModeActive])

  const loadWaterData = () => {
    const userData = DataService.getUserData()
    setTodayWater(userData.todayLog.waterGlasses || 0)
    setGoal(userData.goals?.waterGoal || 8)
    setStreak(userData.streaks?.waterStreak || 0)
    
    // Load last log time
    const waterHistory = DataService.getWaterHistory ? DataService.getWaterHistory() : {}
    const today = new Date().toDateString()
    const todayLogs = waterHistory[today] || []
    if (todayLogs.length > 0) {
      const lastLog = todayLogs[todayLogs.length - 1]
      setLastLogTime(new Date(lastLog.timestamp))
    }
  }

  const initializeNotifications = async () => {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('Notifications not supported')
        return
      }

      // Check current permission
      let permission = Notification.permission
      
      if (permission === 'default') {
        // Request permission with user-friendly approach
        permission = await requestNotificationPermission()
      }

      if (permission === 'granted') {
        setNotificationsEnabled(true)
        console.log('✅ Water notifications enabled')
        setupNotificationHandlers()
        scheduleNextNotification()
      } else {
        console.log('❌ Notification permission denied')
        setNotificationsEnabled(false)
      }
    } catch (error) {
      console.error('Error initializing notifications:', error)
    }
  }

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission()
      return permission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }

  const setupNotificationHandlers = () => {
    // Listen for notification actions if service worker is available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'WATER_LOGGED_FROM_NOTIFICATION') {
          handleNotificationWaterLog(event.data.amount || 1)
        } else if (event.data.type === 'SNOOZE_WATER_REMINDER') {
          handleSnoozeReminder()
        }
      })
    }

    // Handle visibility change to reschedule notifications
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && notificationsEnabled) {
        scheduleNextNotification()
      }
    })
  }

  const calculateSmartInterval = () => {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    // Base interval in minutes
    let interval = 90 // Default 1.5 hours
    
    // Time-based adjustments for student schedule
    if (hour >= 7 && hour <= 9) {
      interval = 60 // Morning routine - every hour
    } else if (hour >= 10 && hour <= 12) {
      interval = 75 // Morning classes - frequent
    } else if (hour >= 13 && hour <= 17) {
      interval = 60 // Afternoon peak - most important time
    } else if (hour >= 18 && hour <= 21) {
      interval = 90 // Evening study - regular
    } else if (hour >= 22 || hour <= 6) {
      return null // Quiet hours - no notifications
    }

    // Progress-based adjustments
    const progress = getProgress()
    const expectedProgress = (hour / 24) * 100
    
    if (progress < expectedProgress - 20) {
      interval -= 30 // Behind schedule - more frequent
    } else if (progress > expectedProgress + 10) {
      interval += 20 // Ahead of schedule - less frequent
    }

    // Study mode adjustments
    if (studyModeActive) {
      interval -= 15 // More frequent during study
    }

    // Weekend adjustments
    if (isWeekend && notificationSettings.weekendMode) {
      interval += 20 // More relaxed on weekends
    }

    // Ensure reasonable bounds
    return Math.max(30, Math.min(180, interval))
  }

  const isQuietHours = (time = new Date()) => {
    const hour = time.getHours()
    const { start, end } = notificationSettings.quietHours
    
    if (start > end) { // Crosses midnight
      return hour >= start || hour < end
    } else {
      return hour >= start && hour < end
    }
  }

  const scheduleNextNotification = () => {
    if (!notificationsEnabled) return

    // Clear any existing timeouts
    if (window.waterReminderTimeout) {
      clearTimeout(window.waterReminderTimeout)
    }

    const interval = calculateSmartInterval()
    if (!interval) return // Quiet hours

    const now = new Date()
    const nextTime = new Date(now.getTime() + interval * 60 * 1000)

    // Don't schedule during quiet hours
    if (isQuietHours(nextTime)) {
      // Schedule for after quiet hours
      const nextMorning = new Date()
      nextMorning.setHours(notificationSettings.quietHours.end, 0, 0, 0)
      if (nextMorning <= now) {
        nextMorning.setDate(nextMorning.getDate() + 1)
      }
      setNextNotificationTime(nextMorning)
      scheduleNotificationAt(nextMorning)
    } else {
      setNextNotificationTime(nextTime)
      scheduleNotificationAt(nextTime)
    }
  }

  const scheduleNotificationAt = (scheduledTime) => {
    const now = new Date()
    const delay = scheduledTime.getTime() - now.getTime()
    
    if (delay <= 0) return

    window.waterReminderTimeout = setTimeout(() => {
      sendWaterReminder()
    }, delay)

    console.log(`💧 Next water reminder: ${scheduledTime.toLocaleTimeString()}`)
  }

  const sendWaterReminder = () => {
    const progress = getProgress()
    const hour = new Date().getHours()
    const behind = Math.max(0, goal - todayWater)
    
    // Smart contextual messages
    let title, body, urgency = 'medium'
    
    if (behind >= 4) {
      title = "Hydration Alert! 🚨"
      body = `You're ${behind} glasses behind! Your brain needs water to focus properly.`
      urgency = 'high'
    } else if (behind >= 2) {
      title = "Water Break Time! 💧"
      body = `Friendly reminder: ${behind} more glasses to reach your daily goal.`
      urgency = 'medium'
    } else if (hour >= 14 && hour <= 16) {
      title = "Afternoon Energy Boost! ☀️"
      body = "Beat the afternoon slump with a refreshing glass of water!"
      urgency = 'low'
    } else if (studyModeActive) {
      title = "Study Break Hydration! 📚💧"
      body = "Study sessions work better when you're hydrated. Take a water break!"
      urgency = 'medium'
    } else {
      title = "Stay Hydrated! 💙"
      body = "Time for a glass of water. Your body will thank you!"
      urgency = 'low'
    }

    // Create notification with actions
    const notification = new Notification(title, {
      body,
      icon: '/icons/water-drop.png',
      badge: '/icons/water-badge.png',
      tag: 'water-reminder',
      renotify: urgency === 'high',
      requireInteraction: urgency === 'high',
      silent: urgency === 'low',
      data: {
        type: 'water-reminder',
        urgency,
        currentWater: todayWater,
        goal,
        behind
      },
      actions: [
        { action: 'log', title: '💧 Log Water' },
        { action: 'snooze', title: '⏰ Snooze 30min' }
      ]
    })

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()
      // Optionally open water tracker directly
    }

    // Auto-close after 10 seconds for low urgency
    if (urgency === 'low') {
      setTimeout(() => notification.close(), 10000)
    }

    // Schedule next notification
    scheduleNextNotification()
  }

  const handleNotificationWaterLog = (amount = 1) => {
    logWater(amount)
    
    // Show success feedback
    new Notification("Great job! 🎉", {
      body: `Logged ${amount} glass${amount > 1 ? 'es' : ''} of water. Keep it up!`,
      icon: '/icons/success.png',
      tag: 'water-success',
      silent: true
    })

    // Auto-close success notification
    setTimeout(() => {
      // Close any success notifications
      // Note: Can't programmatically close notifications in modern browsers
      // But they'll auto-close due to tag replacement
    }, 3000)
  }

  const handleSnoozeReminder = () => {
    // Schedule notification in 30 minutes
    const snoozeTime = new Date(Date.now() + 30 * 60 * 1000)
    if (!isQuietHours(snoozeTime)) {
      scheduleNotificationAt(snoozeTime)
      setNextNotificationTime(snoozeTime)
    }
  }

  const logWater = (amount = 1) => {
    const newTotal = Math.max(0, todayWater + amount)
    setTodayWater(newTotal)
    setLastLogTime(new Date())
    
    // Save to DataService with enhanced logging
    if (DataService.logWaterIntake) {
      DataService.logWaterIntake(amount)
    } else {
      // Fallback to basic update
      DataService.updateUserData({
        todayLog: {
          waterGlasses: newTotal
        }
      })
    }

    // Check for goal achievement
    if (newTotal >= goal && (newTotal - amount) < goal) {
      celebrateGoalAchievement()
    }
    
    if (onWaterLogged) {
      onWaterLogged({
        amount,
        total: newTotal,
        goal,
        timestamp: new Date().toISOString(),
        source: 'manual'
      })
    }
  }

  const celebrateGoalAchievement = () => {
    // Show achievement notification
    if (notificationsEnabled) {
      new Notification("Daily Goal Achieved! 🏆", {
        body: "🎉 Congratulations! You've reached your daily hydration goal!",
        icon: '/icons/trophy.png',
        tag: 'goal-achieved',
        requireInteraction: true
      })
    }

    // Update streak
    const userData = DataService.getUserData()
    const newStreak = (userData.streaks?.waterStreak || 0) + 1
    setStreak(newStreak)
    
    DataService.updateUserData({
      streaks: {
        ...userData.streaks,
        waterStreak: newStreak
      }
    })
  }

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await requestNotificationPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        scheduleNextNotification()
      }
    } else {
      setNotificationsEnabled(false)
      if (window.waterReminderTimeout) {
        clearTimeout(window.waterReminderTimeout)
      }
      setNextNotificationTime(null)
    }
  }

  const toggleStudyMode = () => {
    setStudyModeActive(!studyModeActive)
    // Reschedule notifications with new frequency
    if (notificationsEnabled) {
      scheduleNextNotification()
    }
  }

  const getProgress = () => (todayWater / goal) * 100

  const getMotivationalMessage = () => {
    const progress = getProgress()
    const hour = new Date().getHours()
    
    if (progress >= 100) return "🎉 Goal achieved! Great job staying hydrated!"
    if (progress >= 75) return "💪 Almost there! Just a few more glasses!"
    if (progress >= 50) return "🌊 Good progress! Keep it up!"
    if (progress >= 25) return "💧 Good start! Remember to drink regularly!"
    if (hour > 14 && progress < 40) return "⚠️ Behind schedule - time to catch up!"
    return "🚰 Let's start hydrating! Your brain will thank you!"
  }

  const getSmartInsight = () => {
    const hour = new Date().getHours()
    const progress = getProgress()
    const expectedProgress = (hour / 24) * 100
    const timeSinceLastLog = lastLogTime ? (Date.now() - lastLogTime.getTime()) / (1000 * 60) : 999
    
    if (timeSinceLastLog > 120) {
      return "🕒 It's been over 2 hours since your last water intake"
    }
    if (progress < expectedProgress - 20) {
      return "📉 You're behind your optimal hydration schedule"
    }
    if (hour >= 14 && hour <= 16 && todayWater < 4) {
      return "🌞 Afternoon dehydration can reduce focus by 23%"
    }
    if (studyModeActive) {
      return "📚 Study mode active: Enhanced hydration reminders enabled"
    }
    return "💡 Tip: Consistent hydration improves memory and concentration"
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            {/* Using your custom WaterDropIcon */}
            <WaterDropIcon 
              size={20} 
              color="#3b82f6" 
              className="mr-2"
              animated={todayWater >= goal}
            />
            Smart Water Tracker
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleNotifications}
              className={`${notificationsEnabled 
                ? 'bg-green-50 border-green-300 text-green-700' 
                : 'border-gray-300 text-gray-500'
              }`}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-3 h-3 mr-1" />
                  Smart Alerts
                </>
              ) : (
                <>
                  <BellOff className="w-3 h-3 mr-1" />
                  Enable Alerts
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleStudyMode}
              className={`${studyModeActive 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'border-gray-300 text-gray-500'
              }`}
            >
              {studyModeActive ? (
                <>
                  <BookOpen className="w-3 h-3 mr-1" />
                  Study Mode
                </>
              ) : (
                <>
                  <BookOpen className="w-3 h-3 mr-1" />
                  Study Mode
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Smart Insight Banner */}
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-blue-800 text-xs font-medium flex items-center">
            <WaterDropIcon size={12} color="#1e40af" className="mr-1" />
            Smart Insight
          </div>
          <div className="text-blue-700 text-xs mt-1">{getSmartInsight()}</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Progress Visualization with Water Drop Icons */}
          <div className="text-center">
            {/* Visual Progress with Individual Water Drops */}
            <div className="flex justify-center space-x-2 mb-4">
              {[...Array(goal)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: i < todayWater ? 1 : 0.3 
                  }}
                  transition={{ 
                    delay: i * 0.1,
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300
                  }}
                  className="cursor-pointer"
                  onClick={() => i < todayWater ? logWater(-1) : logWater(1)}
                >
                  <WaterDropIcon 
                    size={i < todayWater ? 24 : 20}
                    color={i < todayWater ? "#3b82f6" : "#e5e7eb"}
                    className={`transition-all duration-300 hover:scale-110 ${
                      i < todayWater ? 'drop-shadow-md' : ''
                    }`}
                    animated={i === todayWater - 1 && todayWater >= goal}
                  />
                </motion.div>
              ))}
            </div>

            {/* Large Progress Display */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Water Glass SVG with enhanced styling */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Glass outline */}
                <path
                  d="M25 20 L75 20 L70 90 L30 90 Z"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                {/* Water fill */}
                <path
                  d={`M25 ${20 + (70 * (1 - Math.min(getProgress() / 100, 1)))} L75 ${20 + (70 * (1 - Math.min(getProgress() / 100, 1)))} L70 90 L30 90 Z`}
                  fill="#3b82f6"
                  opacity="0.6"
                  className="transition-all duration-500"
                />
                {/* Bubbles animation */}
                {[...Array(3)].map((_, i) => (
                  <circle
                    key={i}
                    r="2"
                    fill="#ffffff"
                    opacity="0.8"
                  >
                    <animateMotion
                      dur={`${2 + i}s`}
                      repeatCount="indefinite"
                      path={`M${40 + i * 10} 85 Q${45 + i * 10} 50 ${40 + i * 10} 25`}
                    />
                  </circle>
                ))}
              </svg>
              
              {/* Progress text with water drop icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-2xl font-bold text-gray-900">{todayWater}</span>
                    <WaterDropIcon size={16} color="#3b82f6" />
                  </div>
                  <div className="text-xs text-gray-600">of {goal}</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-2">{Math.round(getProgress())}% of daily goal</div>
            <div className="text-xs text-blue-600 font-medium">{getMotivationalMessage()}</div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => logWater(-1)}
              disabled={todayWater <= 0}
              className="flex flex-col items-center py-3 h-auto"
            >
              <Minus className="w-4 h-4 mb-1" />
              <span className="text-xs">Remove</span>
            </Button>
            
            <Button
              variant="primary"
              onClick={() => logWater(1)}
              className="flex flex-col items-center py-3 h-auto relative overflow-hidden"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <WaterDropIcon 
                  size={16} 
                  color="white" 
                  className="mb-1"
                />
                <span className="text-xs">Add Glass</span>
              </motion.div>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => logWater(2)}
              className="flex flex-col items-center py-3 h-auto"
            >
              <div className="flex space-x-1 mb-1">
                <WaterDropIcon size={12} color="#3b82f6" />
                <WaterDropIcon size={12} color="#3b82f6" />
              </div>
              <span className="text-xs">Big Glass</span>
            </Button>
          </div>

          {/* Quick Amounts with Water Drop Icons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <WaterDropIcon size={14} color="#374151" className="mr-1" />
              Quick Add
            </label>
            <div className="flex space-x-2">
              {[
                { amount: 0.5, label: '½ Glass', icon: <WaterDropIcon size={12} color="#6b7280" /> },
                { amount: 1, label: '1 Glass', icon: <WaterDropIcon size={14} color="#3b82f6" /> },
                { amount: 2, label: '1 Bottle', icon: <div className="flex space-x-0.5"><WaterDropIcon size={12} color="#3b82f6" /><WaterDropIcon size={12} color="#3b82f6" /></div> }
              ].map((option) => (
                <Button
                  key={option.amount}
                  variant="outline"
                  size="sm"
                  onClick={() => logWater(option.amount)}
                  className="flex-1 text-xs flex flex-col items-center py-2 h-auto"
                >
                  <div className="mb-1">{option.icon}</div>
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Goal Achievement Celebration */}
          {todayWater >= goal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="inline-block mb-2"
              >
                <WaterDropIcon size={32} color="#16a34a" animated={true} />
              </motion.div>
              <div className="text-green-800 font-semibold">🎉 Daily Goal Achieved!</div>
              <div className="text-green-600 text-sm">Perfect hydration today! Keep up the excellent work!</div>
            </motion.div>
          )}

          {/* Statistics */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <WaterDropIcon size={16} color="#6b7280" className="mr-2" />
              Today's Hydration
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600 flex items-center justify-center space-x-1">
                  <span>{todayWater}</span>
                  <WaterDropIcon size={14} color="#3b82f6" />
                </div>
                <div className="text-xs text-gray-600">Glasses</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{(todayWater * 250).toLocaleString()}</div>
                <div className="text-xs text-gray-600">ML</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{streak}</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Notification Status */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {notificationsEnabled ? (
                <div className="flex items-center text-green-600">
                  <Bell className="w-3 h-3 mr-1" />
                  <span>Smart reminders active</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <BellOff className="w-3 h-3 mr-1" />
                  <span>Tap to enable smart reminders</span>
                </div>
              )}
            </div>
            
            {nextNotificationTime && notificationsEnabled && (
              <div className="flex items-center text-blue-600">
                <Clock className="w-3 h-3 mr-1" />
                <span>Next: {nextNotificationTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            )}
          </div>

          {/* Last logged info */}
          {lastLogTime && (
            <div className="text-xs text-gray-500 text-center flex items-center justify-center space-x-1">
              <WaterDropIcon size={10} color="#6b7280" />
              <span>
                Last logged: {lastLogTime.toLocaleTimeString()} • {Math.round((Date.now() - lastLogTime.getTime()) / (1000 * 60))} min ago
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default WaterTracker