import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Calendar, Activity, ClipboardList, Phone } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../../context/AuthContext'

export default function HealthWorkerDashboard() {
  const { userProfile } = useAuth()
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Dr. {userProfile?.name}! 👩‍⚕️
          </h1>
          <p className="text-blue-200">Health Worker Dashboard - Track patient health & nutrition</p>
          <div className="mt-2 text-xs text-blue-300">
            📅 {new Date().toLocaleDateString()} • 🏥 {userProfile?.organization || 'Independent Practice'}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-800/50 border-blue-600 backdrop-blur-lg cursor-pointer hover:bg-blue-800/70 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Add Patient</h3>
              <p className="text-blue-200 text-sm">Register new patient for monitoring</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/50 border-blue-600 backdrop-blur-lg cursor-pointer hover:bg-blue-800/70 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Schedule Checkup</h3>
              <p className="text-blue-200 text-sm">Book consultation appointments</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/50 border-blue-600 backdrop-blur-lg cursor-pointer hover:bg-blue-800/70 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Health Assessment</h3>
              <p className="text-blue-200 text-sm">Conduct nutrition assessments</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-800/50 border-blue-600 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Active Patients</p>
                  <p className="text-2xl font-bold text-white">24</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/50 border-blue-600 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Today's Appointments</p>
                  <p className="text-2xl font-bold text-white">8</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/50 border-blue-600 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Assessments Done</p>
                  <p className="text-2xl font-bold text-white">156</p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/50 border-blue-600 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Critical Cases</p>
                  <p className="text-2xl font-bold text-red-400">3</p>
                </div>
                <Phone className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients */}
        <Card className="bg-blue-800/50 border-blue-600 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white">Recent Patients</CardTitle>
            <CardDescription className="text-blue-200">Latest patient consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1,2,3].map((patient) => (
                <div key={patient} className="flex items-center justify-between p-4 bg-blue-700/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <span className="text-white font-semibold">P{patient}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Patient {patient}</p>
                      <p className="text-blue-200 text-sm">Last checkup: 2 days ago</p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}