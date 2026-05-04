import React from 'react'
import Navbar from '@/components/Navbar'
import ProfileSettings from '@/components/Dashboards/Creator/ProfileSettings'

function SettingsPage() {
  return (
    <main
      className="min-h-screen relative overflow-hidden text-white bg-gray-900"
    >
      {/* gradient overlay so bg is visible but dark enough */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90" />

      {/* glowing accents (less blur than login page) */}
      <div className="absolute top-24 left-10 w-56 h-56 bg-purple-600/15 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-16 right-10 w-72 h-72 bg-cyan-500/12 rounded-full blur-2xl animate-pulse delay-700" />

      <div className="relative min-h-screen flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-700 to-cyan-400 bg-clip-text text-transparent">
            Profile Settings
          </h1>

          <div className="bg-gray-800/70 border border-cyan-500/30 rounded-2xl shadow-[0_0_12px_rgba(0,255,255,0.15)] backdrop-blur-md p-8">
            <ProfileSettings />
          </div>
        </main>
      </div>
    </main>
  )
}

export default SettingsPage
