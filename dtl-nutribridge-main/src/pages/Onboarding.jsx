import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Leaf, Heart, Users, MapPin } from 'lucide-react'
import { Button } from '../components/ui/button'

const onboardingSlides = [
  {
    id: 1,
    icon: Leaf,
    title: "Welcome to",
    subtitle: "NutriBridge",
    description: "Your trusted companion for child nutrition tracking and food donation management",
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: 2,
    icon: Heart,
    title: "Track Child Growth",
    subtitle: "Monitor Development",
    description: "Record anthropometric data, generate WHO-based growth charts, and receive malnutrition alerts",
    color: "from-rose-500 to-pink-600"
  },
  {
    id: 3,
    icon: Users,
    title: "Donate Food",
    subtitle: "Help Communities",
    description: "Share surplus food with NGOs and Anganwadi centers. Earn gratitude badges for your contributions",
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: 4,
    icon: MapPin,
    title: "Connect Locally",
    subtitle: "Find Nearby Centers",
    description: "Locate donation centers and health clusters on interactive maps with real-time updates",
    color: "from-purple-500 to-violet-600"
  }
]

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity
}

export default function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const paginate = (newDirection) => {
    if (currentSlide + newDirection >= onboardingSlides.length) {
      onComplete()
      return
    }
    if (currentSlide + newDirection < 0) return
    
    setDirection(newDirection)
    setCurrentSlide(currentSlide + newDirection)
  }

  const current = onboardingSlides[currentSlide]
  const IconComponent = current.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Skip button */}
      <div className="absolute top-8 right-6 z-10">
        <Button 
          variant="ghost" 
          className="text-white/70 hover:text-white"
          onClick={onComplete}
        >
          Skip
        </Button>
      </div>

      {/* Progress indicators */}
      <div className="absolute top-8 left-6 flex space-x-2 z-10">
        {onboardingSlides.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white w-8' 
                : index < currentSlide 
                  ? 'bg-white/70' 
                  : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x)

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1)
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1)
                }
              }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div 
                className={`w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-2xl`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <IconComponent className="w-16 h-16 text-white" />
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-white/80 text-lg mb-2">{current.title}</h1>
                <h2 className="text-white text-3xl font-bold mb-6">{current.subtitle}</h2>
                <p className="text-white/70 text-lg leading-relaxed px-4">
                  {current.description}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white"
            onClick={() => paginate(-1)}
            disabled={currentSlide === 0}
          >
            Previous
          </Button>

          <Button
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-2xl font-medium shadow-lg"
            onClick={() => paginate(1)}
          >
            {currentSlide === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}