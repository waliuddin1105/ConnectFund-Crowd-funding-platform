import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, Users, Target, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getToken, getUser } from "@/lib/auth.js"

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function CreatorKeyStats() {
  const [stats, setStats] = useState(null)
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    const fetchStats = async () => {
      const storedUser = getUser()
      const access_token = getToken()
      const response = await fetch(`${backendUrl}/creator/dashboard`, {
        headers: {
          Authorization: access_token ? `Bearer ${access_token}` : ""
        }
      })

      const data = await response.json()
      if (data?.Success) setStats(data.Success)
    }

    fetchStats()
  }, [])

  if (!stats) {
    return (
      <div className="py-24 text-center text-gray-400">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-6"></div>
        Loading statistics...
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Raised */}
      <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl hover:scale-105 transition-all">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-400" /> Total Raised
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.total_raised)}</div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl hover:scale-105 transition-all">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" /> Active Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.active_campaigns}</div>
        </CardContent>
      </Card>

      {/* Total Donors */}
      <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl hover:scale-105 transition-all">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
            <Users className="h-5 w-5 text-green-400" /> Total Donors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.total_donors}</div>
        </CardContent>
      </Card>

      {/* Recent Donation */}
      <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl hover:scale-105 transition-all">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-400" /> Recent Donation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(stats.recent_donation.amount)}
          </div>
        </CardContent>
      </Card>

     
    </div>
  )
}

export default CreatorKeyStats
