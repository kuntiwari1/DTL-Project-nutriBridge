import React, { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

const translations = {
  en: {
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    childTracker: 'Child Tracker',
    foodDonation: 'Food Donation',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    addChild: 'Add Child',
    donate: 'Donate Food',
  },
  hi: {
    welcome: 'स्वागत',
    dashboard: 'डैशबोर्ड',
    childTracker: 'बाल ट्रैकर',
    foodDonation: 'भोजन दान',
    profile: 'प्रोफाइल',
    login: 'लॉगिन',
    register: 'पंजीकरण',
    logout: 'लॉगआउट',
    addChild: 'बच्चा जोड़ें',
    donate: 'भोजन दान करें',
  },
  kn: {
    welcome: 'ಸ್ವಾಗತ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    childTracker: 'ಮಕ್ಕಳ ಟ್ರ್ಯಾಕರ್',
    foodDonation: 'ಆಹಾರ ದಾನ',
    profile: 'ಪ್ರೊಫೈಲ್',
    login: 'ಲಾಗಿನ್',
    register: 'ನೋಂದಣಿ',
    logout: 'ಲಾಗ್ಔಟ್',
    addChild: 'ಮಗುವನ್ನು ಸೇರಿಸಿ',
    donate: 'ಆಹಾರ ದಾನ ಮಾಡಿ',
  }
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')

  const t = (key) => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}