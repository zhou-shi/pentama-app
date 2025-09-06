'use client'

import Dashboard from '@/components/Dashboard'
import Landing from '@/components/Landing'
import ProfileCompletion from '@/components/ProfileCompletion'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function Home() {
  const { user, userProfile, loading } = useAuth()
  const [profileCompleted, setProfileCompleted] = useState(false)

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  // Not logged in - show landing page
  if (!user) {
    return (
      <main>
        <Landing />
      </main>
    )
  }

  // Logged in but profile incomplete - show profile completion form
  if (!userProfile?.completedAt && !profileCompleted) {
    return (
      <main>
        <ProfileCompletion onComplete={() => setProfileCompleted(true)} />
      </main>
    )
  }

  // Logged in with complete profile - show dashboard
  return (
    <main className='overflow-y-auto scrollbar-hide lg:overflow-hidden'>
      <Dashboard />
    </main>
  )
}
