import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUser } from "@/lib/auth"
import { useNavigate } from "react-router-dom"

const getCategoryStyle = (category) => {
  const styles = {
    charity: "bg-blue-400 text-white",
    medical: "bg-red-400 text-white",
    education: "bg-green-400 text-white",
    emergency: "bg-orange-400 text-white",
    personal: "bg-purple-400 text-white"
  }
  return styles[category] || styles.personal
}

function FollowingCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const user = getUser()
    if (!user || !user.user_id) return
    fetchFollowing(user.user_id)
  }, [])

  const handleClick = (campaign_id) => {
    navigate(`/all-campaigns/${campaign_id}`)
  }

  const fetchFollowing = async (donorId) => {
    try {
      setLoading(true)
      const backendUrl = import.meta.env.VITE_BACKEND_URL
      const res = await fetch(`${backendUrl}/follows/get-following/${donorId}`)
      if (!res.ok) throw new Error("Failed to fetch followed campaigns")
      const data = await res.json()
      setCampaigns(data.following || [])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl">
  <CardHeader>
    <CardTitle className="text-white">Campaigns You Follow</CardTitle>
    <CardDescription className="text-gray-300">
      Quick access to campaigns you're interested in
    </CardDescription>
  </CardHeader>

  <CardContent>
    {loading && <p className="text-gray-400">Loading...</p>}
    {error && <p className="text-red-500">{error}</p>}
    {!loading && campaigns.length === 0 && (
      <p className="text-gray-400">You are not following any campaigns.</p>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {campaigns.map((campaign) => (
        <div
          key={campaign.campaign_id}
          className="relative group overflow-hidden rounded-xl border border-gray-800/50 bg-gray-900/50 backdrop-blur-sm shadow-2xl transition-all hover:scale-105"
        >
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-48 object-cover rounded-t-xl"
          />

          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryStyle(campaign.category)}`}>
                {campaign.category}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-200">
                {campaign.status}
              </span>
            </div>

            <h4 className="font-semibold text-white mt-1">{campaign.title}</h4>

            <Button
  variant="outline"
  size="sm"
  className="w-full mt-2 text-green-400 border-green-400 bg-primary hover:bg-green-500/20"
  onClick={() => handleClick(campaign.campaign_id)}
>
  View Details
</Button>

          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

  )
}

export default FollowingCampaigns
