import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  MapPin, 
  Settings, 
  Bell, 
  Shield, 
  LogOut,
  Edit3,
  Camera,
  Moon,
  Sun,
  Globe
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'

export default function Profile() {
  const { user, userProfile, logout, updateUserProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    location: userProfile?.location || '',
    bio: userProfile?.bio || ''
  })

  const handleSave = async () => {
    try {
      await updateUserProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const stats = [
    { label: 'Children Tracked', value: userProfile?.childrenCount || 0 },
    { label: 'Donations Made', value: userProfile?.donationsCount || 0 },
    { label: 'Impact Score', value: userProfile?.impactScore || 0 }
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {userProfile?.name?.charAt(0) || user?.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {userProfile?.name || user?.displayName || 'User'}
                    </h1>
                    <p className="text-gray-400 capitalize">{userProfile?.role || 'Member'}</p>
                    <p className="text-gray-500 text-sm flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {userProfile?.location || 'Location not set'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Profile Form */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white">Edit Profile</CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-300">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full h-20 px-3 py-2 rounded-md bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Settings */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
              <div>
                <p className="text-white font-medium">Theme</p>
                <p className="text-gray-400 text-sm">Switch between light and dark mode</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">Language</p>
                <p className="text-gray-400 text-sm">Select your preferred language</p>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 rounded bg-gray-600 border border-gray-500 text-white text-sm"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">Notifications</p>
                <p className="text-gray-400 text-sm">Manage your notification preferences</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Configure
            </Button>
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">Privacy & Security</p>
                <p className="text-gray-400 text-sm">Manage your privacy settings</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg">
        <CardContent className="p-6">
          <Button
            onClick={logout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}