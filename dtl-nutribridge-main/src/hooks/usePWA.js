import { useState, useEffect } from 'react'

export const usePWA = () => {
  const [isOnboarded, setIsOnboarded] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nutribridge-onboarded') === 'true'
    }
    return false
  })

  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstallable(false)
      setDeferredPrompt(null)
      return true
    }
    
    return false
  }

  const completeOnboarding = () => {
    localStorage.setItem('nutribridge-onboarded', 'true')
    setIsOnboarded(true)
  }

  return {
    isOnboarded,
    setIsOnboarded: completeOnboarding,
    isInstallable,
    installApp
  }
}