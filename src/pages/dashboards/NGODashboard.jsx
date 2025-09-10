import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Users, Target, TrendingUp, Calendar, MapPin, Plus, FileText, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../context/AuthContext'

export default function NGODashboard() {
  const { userProfile } = useAuth()

  // Programs state
  const [programs, setPrograms] = useState([
    { id: 1, name: "Rural Child Nutrition", location: "Maharashtra", beneficiaries: 450, status: "Active" },
    { id: 2, name: "School Meal Program", location: "Gujarat", beneficiaries: 1200, status: "Active" },
    { id: 3, name: "Emergency Relief", location: "Rajasthan", beneficiaries: 300, status: "Ongoing" }
  ])

  // Beneficiaries state
  const [beneficiaries, setBeneficiaries] = useState([
    { id: 1, name: "Priya Singh", location: "Delhi", status: "Verified" },
    { id: 2, name: "Rahul Sharma", location: "Maharashtra", status: "Pending" },
    { id: 3, name: "Anita Gupta", location: "Gujarat", status: "Verified" },
  ])

  // Events state
  const [events, setEvents] = useState([
    { id: 1, name: "Child Nutrition Camp", date: "2025-08-16", location: "Jaipur" },
    { id: 2, name: "Health Awareness Workshop", date: "2025-08-21", location: "Gujarat" }
  ])

  // Modal states
  const [showNewProgram, setShowNewProgram] = useState(false)
  const [showManageBeneficiaries, setShowManageBeneficiaries] = useState(false)
  const [showScheduleEvent, setShowScheduleEvent] = useState(false)
  const [showImpactReport, setShowImpactReport] = useState(false)
  const [impactReportLoading, setImpactReportLoading] = useState(false)
  const [impactReport, setImpactReport] = useState(null)

  // New Program form states
  const [programName, setProgramName] = useState("")
  const [programLocation, setProgramLocation] = useState("")
  const [programStatus, setProgramStatus] = useState("Active")
  const [programBeneficiaries, setProgramBeneficiaries] = useState("")
  const [programSuccess, setProgramSuccess] = useState("")

  // New Beneficiary form states
  const [beneficiaryName, setBeneficiaryName] = useState("")
  const [beneficiaryLocation, setBeneficiaryLocation] = useState("")
  const [beneficiaryStatus, setBeneficiaryStatus] = useState("Pending")
  const [beneficiarySuccess, setBeneficiarySuccess] = useState("")

  // New Event form states
  const [eventName, setEventName] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [eventSuccess, setEventSuccess] = useState("")

  // Functions for Programs
  const handleCreateProgram = () => {
    if (!programName || !programLocation || !programBeneficiaries) {
      setProgramSuccess("Please enter all fields.")
      return
    }
    setProgramSuccess("Creating program...")
    setTimeout(() => {
      setPrograms([
        ...programs,
        {
          id: Date.now(),
          name: programName,
          location: programLocation,
          beneficiaries: Number(programBeneficiaries),
          status: programStatus
        }
      ])
      setProgramSuccess(`Program "${programName}" created in ${programLocation}.`)
      setShowNewProgram(false)
      setProgramName("")
      setProgramLocation("")
      setProgramStatus("Active")
      setProgramBeneficiaries("")
    }, 1200)
  }

  const handleDeleteProgram = (id) => {
    setPrograms(programs.filter(p => p.id !== id))
  }

  // Functions for Beneficiaries
  const handleAddBeneficiary = () => {
    if (!beneficiaryName || !beneficiaryLocation) {
      setBeneficiarySuccess("Please enter all fields.")
      return
    }
    setBeneficiarySuccess("Adding beneficiary...")
    setTimeout(() => {
      setBeneficiaries([
        ...beneficiaries,
        {
          id: Date.now(),
          name: beneficiaryName,
          location: beneficiaryLocation,
          status: beneficiaryStatus
        }
      ])
      setBeneficiarySuccess(`Beneficiary "${beneficiaryName}" added.`)
      setBeneficiaryName("")
      setBeneficiaryLocation("")
      setBeneficiaryStatus("Pending")
    }, 1000)
  }

  const handleUpdateBeneficiaryStatus = (id, status) => {
    setBeneficiaries(beneficiaries.map(b => b.id === id ? { ...b, status } : b))
  }

  const handleDeleteBeneficiary = (id) => {
    setBeneficiaries(beneficiaries.filter(b => b.id !== id))
  }

  // Functions for Events
  const handleAddEvent = () => {
    if (!eventName || !eventDate || !eventLocation) {
      setEventSuccess("Please enter all fields.")
      return
    }
    setEventSuccess("Scheduling event...")
    setTimeout(() => {
      setEvents([
        ...events,
        {
          id: Date.now(),
          name: eventName,
          date: eventDate,
          location: eventLocation
        }
      ])
      setEventSuccess(`Event "${eventName}" scheduled.`)
      setEventName("")
      setEventDate("")
      setEventLocation("")
    }, 1000)
  }

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id))
  }

  // Impact Report
  const handleDownloadImpactReport = () => {
    setImpactReportLoading(true)
    setTimeout(() => {
      const activePrograms = programs.filter(p => p.status === "Active").length
      const completedPrograms = programs.filter(p => p.status === "Completed").length
      const successRate = programs.length ? Math.round((completedPrograms / programs.length) * 100) : 0
      const beneficiaryCount = beneficiaries.length
      const eventCount = events.length
      setImpactReport(
        `Impact Report\n\nTotal Programs: ${programs.length}\nActive Programs: ${activePrograms}\nCompleted Programs: ${completedPrograms}\nSuccess Rate: ${successRate}%\nBeneficiaries: ${beneficiaryCount}\nEvents Held: ${eventCount}`
      )
      setImpactReportLoading(false)
    }, 1200)
  }

  // Refresh all stats (simulate reload)
  const handleRefresh = () => {
    // For demo, just force re-render
    setPrograms([...programs])
    setBeneficiaries([...beneficiaries])
    setEvents([...events])
  }

  // Stats for cards
  const activeProgramsCount = programs.filter(p => p.status === "Active").length
  const beneficiaryCount = beneficiaries.length
  const locationCount = [...new Set(programs.map(p => p.location))].length
  const successRate = programs.length ? Math.round((programs.filter(p => p.status === "Completed").length / programs.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome {userProfile?.organization || userProfile?.name}! 
          </h1>
          <p className="text-indigo-200">NGO Dashboard - Manage Programs & Track Impact</p>
          <div className="mt-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-sm inline-block">
            🏢 NGO Dashboard
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            className="bg-indigo-800/50 border-indigo-600 backdrop-blur-lg cursor-pointer hover:bg-indigo-800/70 transition-all"
            onClick={() => setShowNewProgram(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">New Program</h3>
              <p className="text-indigo-200 text-sm">Create nutrition intervention program</p>
            </CardContent>
          </Card>

          <Card
            className="bg-indigo-800/50 border-indigo-600 backdrop-blur-lg cursor-pointer hover:bg-indigo-800/70 transition-all"
            onClick={() => setShowManageBeneficiaries(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Manage Beneficiaries</h3>
              <p className="text-indigo-200 text-sm">Track program participants</p>
            </CardContent>
          </Card>

          <Card
            className="bg-indigo-800/50 border-indigo-600 backdrop-blur-lg cursor-pointer hover:bg-indigo-800/70 transition-all"
            onClick={() => setShowScheduleEvent(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Schedule Event</h3>
              <p className="text-indigo-200 text-sm">Organize nutrition camps</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-indigo-800/50 border-indigo-600 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-200 text-sm">Active Programs</p>
                  <p className="text-2xl font-bold text-white">{activeProgramsCount}</p>
                </div>
                <Target className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-800/50 border-indigo-600 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-200 text-sm">Beneficiaries</p>
                  <p className="text-2xl font-bold text-white">{beneficiaryCount}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-800/50 border-indigo-600 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-200 text-sm">Locations</p>
                  <p className="text-2xl font-bold text-white">{locationCount}</p>
                </div>
                <MapPin className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-800/50 border-indigo-600 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-200 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-indigo-400">{successRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Program Modal */}
        {showNewProgram && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-indigo-900 rounded-xl p-8 max-w-md w-full shadow-lg border border-indigo-600">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Plus className="w-6 h-6 mr-2 text-blue-400" />
                Create New Program
              </h2>
              <div className="mb-4">
                <label className="block text-indigo-200 mb-2">Program Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-indigo-800 text-white border border-indigo-700"
                  value={programName}
                  onChange={e => setProgramName(e.target.value)}
                  placeholder="e.g. Urban Child Nutrition"
                />
              </div>
              <div className="mb-4">
                <label className="block text-indigo-200 mb-2">Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-indigo-800 text-white border border-indigo-700"
                  value={programLocation}
                  onChange={e => setProgramLocation(e.target.value)}
                  placeholder="e.g. Delhi"
                />
              </div>
              <div className="mb-4">
                <label className="block text-indigo-200 mb-2">Beneficiaries</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg bg-indigo-800 text-white border border-indigo-700"
                  value={programBeneficiaries}
                  onChange={e => setProgramBeneficiaries(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-indigo-200 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 rounded-lg bg-indigo-800 text-white border border-indigo-700"
                  value={programStatus}
                  onChange={e => setProgramStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <Button className="w-full" variant="primary" onClick={handleCreateProgram}>
                Create Program
              </Button>
              <Button className="w-full mt-2" variant="outline" onClick={() => setShowNewProgram(false)}>
                Cancel
              </Button>
              {programSuccess && (
                <div className="mt-4 text-blue-400 text-center">{programSuccess}</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Manage Beneficiaries Modal */}
        {showManageBeneficiaries && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-indigo-900 rounded-xl p-8 max-w-lg w-full shadow-lg border border-indigo-600">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                <Users className="w-6 h-6 mr-2 text-green-400" />
                Manage Beneficiaries
              </h2>
              {/* Add Beneficiary Form */}
              <div className="mb-6">
                <label className="block text-indigo-200 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-indigo-800 text-white border border-indigo-700 mb-2"
                  value={beneficiaryName}
                  onChange={e => setBeneficiaryName(e.target.value)}
                  placeholder="e.g. Sunil Kumar"
                />
                <label className="block text-indigo-200 mb-1">Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-indigo-800 text-white border border-indigo-700 mb-2"
                  value={beneficiaryLocation}
                  onChange={e => setBeneficiaryLocation(e.target.value)}
                  placeholder="e.g. Mumbai"
                />
                <label className="block text-indigo-200 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 rounded-lg bg-indigo-800 text-white border border-indigo-700"
                  value={beneficiaryStatus}
                  onChange={e => setBeneficiaryStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <Button className="w-full mt-2" variant="primary" onClick={handleAddBeneficiary}>
                  Add Beneficiary
                </Button>
                {beneficiarySuccess && (
                  <div className="mt-2 text-green-400 text-center">{beneficiarySuccess}</div>
                )}
              </div>
              {/* List of Beneficiaries */}
              <div className="mb-2 text-indigo-200 font-semibold">Beneficiary List:</div>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {beneficiaries.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-2 bg-indigo-800 rounded mb-2">
                    <div>
                      <span className="text-white">{b.name}</span>
                      <span className="text-indigo-300 ml-2 text-xs">{b.location}</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${b.status === "Verified" ? "bg-green-600 text-white" : b.status === "Pending" ? "bg-yellow-600 text-white" : "bg-gray-500 text-white"}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {b.status !== "Verified" && (
                        <Button variant="outline" size="sm" onClick={() => handleUpdateBeneficiaryStatus(b.id, "Verified")}>Verify</Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleDeleteBeneficiary(b.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline" onClick={() => setShowManageBeneficiaries(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        )}

        {/* Schedule Event Modal */}
        {showScheduleEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-indigo-900 rounded-xl p-8 max-w-md w-full shadow-lg border border-indigo-600">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-purple-400" />
                Schedule Nutrition Event
              </h2>
              <div className="mb-4">
                <label className="block text-indigo-200 mb-2">Event Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-indigo-800 text-white border border-indigo-700"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  placeholder="e.g. Nutrition Awareness Camp"
                />
              </div>
              <div className="mb-4">
                <label className="block text-indigo-200 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg bg-indigo-800 text-white border border-indigo-700"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-indigo-200 mb-2">Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-indigo-800 text-white border border-indigo-700"
                  value={eventLocation}
                  onChange={e => setEventLocation(e.target.value)}
                  placeholder="e.g. Jaipur"
                />
              </div>
              <Button className="w-full" variant="primary" onClick={handleAddEvent}>
                Schedule Event
              </Button>
              {eventSuccess && (
                <div className="mt-2 text-green-400 text-center">{eventSuccess}</div>
              )}
              {/* List of Events */}
              <div className="mt-6 mb-3 text-indigo-200 font-semibold">Upcoming Events:</div>
              <div style={{ maxHeight: "140px", overflowY: "auto" }}>
                {events.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-2 bg-indigo-800 rounded mb-2">
                    <div>
                      <span className="text-white">{e.name}</span>
                      <span className="text-indigo-300 ml-2 text-xs">{e.location}</span>
                      <span className="ml-2 text-indigo-100 text-xs">{e.date}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(e.id)}>Delete</Button>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline" onClick={() => setShowScheduleEvent(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        )}

        {/* Impact Report Modal */}
        {showImpactReport && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-indigo-900 rounded-xl p-8 max-w-md w-full shadow-lg border border-indigo-600">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-indigo-400" />
                Download Impact Report
              </h2>
              <Button
                variant="primary"
                className="mb-2 w-full"
                onClick={handleDownloadImpactReport}
                disabled={impactReportLoading}
              >
                <FileText className="w-4 h-4 mr-2" />
                {impactReportLoading ? "Preparing Report..." : "Download Report"}
              </Button>
              {impactReport && (
                <pre className="text-indigo-400 text-center mb-2 whitespace-pre-wrap">{impactReport}</pre>
              )}
              <Button className="w-full mt-2" variant="outline" onClick={() => setShowImpactReport(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        )}

        {/* Active Programs */}
        <Card className="bg-indigo-800/50 border-indigo-600 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white">Active Programs</CardTitle>
            <CardDescription className="text-indigo-200">Current nutrition intervention programs</CardDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="mt-2 ml-2"
              onClick={() => setShowImpactReport(true)}
            >
              <FileText className="w-4 h-4 mr-1" />
              Download Impact Report
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {programs.map((program, index) => (
                <div key={program.id} className="flex items-center justify-between p-4 bg-indigo-700/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{program.name}</p>
                      <p className="text-indigo-200 text-sm">{program.location} • {program.beneficiaries} beneficiaries</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs mb-2">
                      {program.status}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteProgram(program.id)}>Delete</Button>
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