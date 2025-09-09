import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, DollarSign, Users, TrendingUp, Gift, MapPin, Award, FileText, BarChart3, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../context/AuthContext'

// Dummy data for demonstration
const recentDonationsData = [
  { amount: "₹5,000", program: "Rural Child Nutrition", date: "2 days ago", impact: "25 children fed" },
  { amount: "₹3,000", program: "School Meal Program", date: "1 week ago", impact: "15 children fed" },
  { amount: "₹2,000", program: "Emergency Relief", date: "2 weeks ago", impact: "10 families helped" }
]

// Dummy programs
const nutritionPrograms = [
  { name: "Village Nutrition Drive", location: "Madhya Pradesh", children: 120, status: "Active" },
  { name: "Urban School Meals", location: "Delhi", children: 80, status: "Active" },
  { name: "Flood Relief Nutrition", location: "Assam", children: 65, status: "Completed" },
  { name: "Orphanage Nutrition", location: "Hyderabad", children: 40, status: "Active" },
]

export default function DonorDashboard() {
  const { userProfile } = useAuth()
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [showPrograms, setShowPrograms] = useState(false)
  const [showImpact, setShowImpact] = useState(false)
  const [donationAmount, setDonationAmount] = useState("")
  const [selectedProgram, setSelectedProgram] = useState("")
  const [donationStatus, setDonationStatus] = useState("")
  const [impactReportLoading, setImpactReportLoading] = useState(false)
  const [impactReport, setImpactReport] = useState(null)

  // Simulate donation
  const handleDonate = () => {
    if (!donationAmount || !selectedProgram) {
      setDonationStatus("Please enter amount and select a program.")
      return
    }
    setDonationStatus("Processing donation...")
    setTimeout(() => {
      setDonationStatus(`Thank you! You donated ₹${donationAmount} to ${selectedProgram}.`)
      setShowDonationForm(false)
      setDonationAmount("")
      setSelectedProgram("")
    }, 2000)
  }

  // Simulate download of impact report
  const handleDownloadReport = () => {
    setImpactReportLoading(true)
    setTimeout(() => {
      setImpactReport("Your impact report is ready! (PDF download simulated)")
      setImpactReportLoading(false)
    }, 2000)
  }

  // Stats could come from backend
  const stats = [
    { label: "Total Donated", value: "₹25,000", icon: <DollarSign className="w-8 h-8 text-green-400" /> },
    { label: "Children Helped", value: "142", icon: <Users className="w-8 h-8 text-blue-400" /> },
    { label: "Programs Supported", value: "8", icon: <Heart className="w-8 h-8 text-red-400" /> },
    { label: "Impact Score", value: "95%", icon: <TrendingUp className="w-8 h-8 text-green-400" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome {userProfile?.name}! 💚
          </h1>
          <p className="text-green-200">Donor Dashboard - Track Your Impact & Contributions</p>
          <div className="mt-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm inline-block">
            💰 Donor Dashboard
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="bg-green-800/50 border-green-600 backdrop-blur-lg cursor-pointer hover:bg-green-800/70 transition-all"
            onClick={() => setShowDonationForm(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Make Donation</h3>
              <p className="text-green-200 text-sm">Support child nutrition programs</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-green-800/50 border-green-600 backdrop-blur-lg cursor-pointer hover:bg-green-800/70 transition-all"
            onClick={() => setShowPrograms(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Find Programs</h3>
              <p className="text-green-200 text-sm">Discover local nutrition programs</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-green-800/50 border-green-600 backdrop-blur-lg cursor-pointer hover:bg-green-800/70 transition-all"
            onClick={() => setShowImpact(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">View Impact</h3>
              <p className="text-green-200 text-sm">See how your donations help</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx} className="bg-green-800/50 border-green-600 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Donation Form Modal */}
        {showDonationForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-green-900 rounded-xl p-8 max-w-md w-full shadow-lg border border-green-600">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Gift className="w-6 h-6 mr-2 text-green-400" />
                Make a Donation
              </h2>
              <div className="mb-4">
                <label className="block text-green-200 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg bg-green-800 text-white border border-green-700"
                  value={donationAmount}
                  min={1}
                  onChange={e => setDonationAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div className="mb-4">
                <label className="block text-green-200 mb-2">Select Program</label>
                <select
                  className="w-full px-3 py-2 rounded-lg bg-green-800 text-white border border-green-700"
                  value={selectedProgram}
                  onChange={e => setSelectedProgram(e.target.value)}
                >
                  <option value="">-- Choose a program --</option>
                  {nutritionPrograms.map(p => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.location})
                    </option>
                  ))}
                </select>
              </div>
              <Button className="w-full" variant="primary" onClick={handleDonate}>
                Donate
              </Button>
              <Button className="w-full mt-2" variant="outline" onClick={() => setShowDonationForm(false)}>
                Cancel
              </Button>
              {donationStatus && (
                <div className="mt-4 text-green-400 text-center">{donationStatus}</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Programs Modal */}
        {showPrograms && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-green-900 rounded-xl p-8 max-w-lg w-full shadow-lg border border-green-600">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-purple-400" />
                Nutrition Programs
              </h2>
              {nutritionPrograms.map((program, idx) => (
                <div key={idx} className="mb-4 p-4 bg-green-800 rounded-lg border border-green-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-white">{program.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      program.status === "Active" ? "bg-green-500/20 text-green-300" : "bg-gray-400/20 text-gray-300"
                    }`}>
                      {program.status}
                    </span>
                  </div>
                  <div className="text-green-200 text-sm">{program.location} • {program.children} children</div>
                </div>
              ))}
              <Button className="w-full mt-2" variant="outline" onClick={() => setShowPrograms(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        )}

        {/* Impact Modal */}
        {showImpact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-green-900 rounded-xl p-8 max-w-lg w-full shadow-lg border border-green-600">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-orange-400" />
                Your Impact
              </h2>
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  <span className="text-green-200">Meals funded this year: <span className="text-white font-bold">2,420</span></span>
                </div>
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  <span className="text-green-200">Children helped: <span className="text-white font-bold">142</span></span>
                </div>
                <div className="flex items-center mb-2">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" />
                  <span className="text-green-200">Programs supported: <span className="text-white font-bold">8</span></span>
                </div>
                <div className="flex items-center mb-2">
                  <Heart className="w-5 h-5 mr-2 text-red-400" />
                  <span className="text-green-200">Impact score: <span className="text-green-400 font-bold">95%</span></span>
                </div>
              </div>
              <div className="mb-6 text-green-200">
                <p className="mb-2">Your donations have enabled <span className="font-semibold text-white">better nutrition and health</span> for hundreds of children.</p>
                <p className="mb-2">Read recent impact stories and download your detailed impact report:</p>
              </div>
              <Button 
                variant="primary"
                className="mb-2 w-full"
                onClick={handleDownloadReport}
                disabled={impactReportLoading}
              >
                <FileText className="w-4 h-4 mr-2" />
                {impactReportLoading ? "Preparing Report..." : "Download Impact Report"}
              </Button>
              {impactReport && (
                <div className="text-green-400 text-center mb-2">{impactReport}</div>
              )}
              <Button className="w-full mt-2" variant="outline" onClick={() => setShowImpact(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        )}

        {/* Recent Donations */}
        <Card className="bg-green-800/50 border-green-600 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white">Recent Donations</CardTitle>
            <CardDescription className="text-green-200">Your contribution history</CardDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDonationsData.map((donation, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-green-700/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{donation.program}</p>
                      <p className="text-green-200 text-sm">{donation.date} • {donation.impact}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{donation.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}