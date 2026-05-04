import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/Navbar"
import KeyStats from "@/components/Dashboards/Donor/KeyStats"
import DonationHistory from "@/components/Dashboards/Donor/DonationHistory"
import ActiveCampaigns from "@/components/Dashboards/Donor/ActiveCampaigns"
import FollowingCampaigns from "@/components/Dashboards/Donor/FollowingCampaigns"
import ProfileSettings from "@/components/Dashboards/Creator/ProfileSettings"
import { getUser } from "@/lib/auth.js"
import UnauthorizedBox from "@/components/UnauthorizedBox"
import { MessageCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
export default function DonorDashboard() {
  const [user, setUser] = useState({})
  const navigate = useNavigate()
  useEffect(() => {
    const storedUser = getUser()
    setUser(storedUser)
  }, [])

  return (
    <>
      <Navbar />
      {user?.role == 'donor' ? (
        <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Donor Dashboard</h1>
            <p className="text-gray-400">Track your impact and manage your donations</p>
          </div>

          {/* Key Stats */}
          <KeyStats />

          {/* Main Content Tabs */}
          <Card className="bg-gray-900/50 border border-gray-800/50 shadow-2xl rounded-2xl">
            <CardContent className="space-y-6">
              <Tabs defaultValue="donations" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <TabsTrigger value="donations" className="text-white hover:bg-gray-700/50">
                    Donations
                  </TabsTrigger>
                  <TabsTrigger value="active" className="text-white hover:bg-gray-700/50">
                    Active Campaigns
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="text-white hover:bg-gray-700/50">
                    Campaigns Following
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-white hover:bg-gray-700/50">
                    Settings
                  </TabsTrigger>
                </TabsList>

                {/* Donation History Tab */}
                <TabsContent value="donations" className="space-y-6">
                  <DonationHistory donorId={user.user_id} />
                </TabsContent>

                {/* Active Campaigns Tab */}
                <TabsContent value="active" className="space-y-6">
                  <ActiveCampaigns />
                </TabsContent>

                {/* Follows Tab */}
                <TabsContent value="favorites" className="space-y-6">
                  <FollowingCampaigns />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <ProfileSettings />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <button
                  onClick={() => navigate('/chat')}
                  className="fixed bottom-6 right-6 z-50 group"
                  aria-label="Open chat"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    
                    {/* Button */}
                    <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full shadow-2xl shadow-blue-500/50 transition-all group-hover:scale-110">
                      <MessageCircle className="h-7 w-7 text-white" />
                      
                      {/* Notification pulse */}
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Tooltip */}
                  <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Chat with AI Assistant
                  </span>
                </button>
      </div>
      ) : <UnauthorizedBox message={"You need to be a donor to visit this page"}/>}
    </>
  )
}
