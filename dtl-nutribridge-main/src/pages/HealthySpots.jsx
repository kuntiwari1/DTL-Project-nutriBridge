import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, ArrowLeft
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'

// Consistent Badge Component
const Badge = ({ children, className = "", variant = "default" }) => {
  const variants = {
    default: "bg-blue-50 text-blue-700 border-blue-200",
    secondary: "bg-gray-50 text-gray-600 border-gray-200",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200"
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default function HealthySpots() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [nearbySpots, setNearbySpots] = useState([])

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-900 text-xl font-semibold">Finding healthy spots near you...</div>
          <div className="text-gray-600 text-sm mt-2">Using GPS to locate the best nutrition options</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  🗺️ Healthy Spots Near You
                </h1>
                <p className="text-gray-600">
                  Discover nutritious food options sorted by distance, health score & reviews
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge>📍 {nearbySpots.length} spots found</Badge>
            <Badge variant="info">🎯 GPS Enabled</Badge>
            <Badge variant="success">⚡ Real-time Data</Badge>
            <Badge variant="warning">🎓 Student Reviewed</Badge>
          </div>
        </motion.div>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">GPS Healthy Spots Coming Soon!</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We're working on bringing you the best healthy food spots near your location with real-time data and student reviews.
            </p>
            <div className="flex justify-center space-x-3">
              <Button 
                variant="primary"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button 
                variant="outline"
              >
                Get Notified When Ready
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}