import React, { useEffect, useState } from 'react'
import { getUser } from '@/lib/auth'
import { Heart, DollarSign, TrendingUp, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

function KeyStats() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const storedUser = getUser()
    setUser(storedUser)

    if (storedUser && storedUser.user_id) {
      fetchDonorStats(storedUser.user_id)
    }
  }, [])

  const fetchDonorStats = async (donorId) => {
    try {
      setLoading(true)
      const backendUrl = import.meta.env.VITE_BACKEND_URL
      const res = await fetch(`${backendUrl}/donations/donor-stats/${donorId}`)
      if (!res.ok) throw new Error("Failed to fetch donor stats")
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-6"></div>
        Loading donor stats...
      </div>
    )
  }

  if (error) return <p className="text-center text-red-500">Error: {error}</p>
  if (!stats) return <p className="text-center text-gray-400">No stats available.</p>

  const totalDonated = stats.total_donated || 0
  const totalCampaignsSupported = stats.campaigns_supported || 0
  const recentDonation = stats.recent_campaign || {}
  const impactScore = stats.impact_score || "0/5"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

      {/* Total Donated */}
      <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-400" /> Total Donated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalDonated)}</div>
        </CardContent>
      </Card>

      {/* Campaigns Supported */}
      <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-400" /> Campaigns Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalCampaignsSupported}</div>
        </CardContent>
      </Card>

      {/* Most Recent Donation */}
      <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-400" /> Most Recent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(recentDonation.amount || 0)}
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate">{recentDonation.title || "N/A"}</p>
        </CardContent>
      </Card>

      {/* Impact Score */}
      <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" /> Impact Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{impactScore}</div>
        </CardContent>
      </Card>

    </div>
  )
}

export default KeyStats
