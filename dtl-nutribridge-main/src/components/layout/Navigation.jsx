import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Gift, MapPin, User } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/child-tracker', icon: Users, label: 'Children' },
  { path: '/food-donation', icon: Gift, label: 'Donate' },
  { path: '/map', icon: MapPin, label: 'Map' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function Navigation() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-lg border-t border-gray-700 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center py-2 px-3 rounded-xl transition-all relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-emerald-500/20 rounded-xl"
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon 
                className={`w-5 h-5 relative z-10 ${
                  isActive ? 'text-emerald-400' : 'text-gray-400'
                }`} 
              />
              <span 
                className={`text-xs mt-1 relative z-10 ${
                  isActive ? 'text-emerald-400' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}