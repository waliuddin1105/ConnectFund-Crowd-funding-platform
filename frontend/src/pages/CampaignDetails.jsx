import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Calendar, Users, Target, Clock, ArrowLeft, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import Navbar from "@/components/Navbar.jsx"
import RecentDonors from "@/components/RecentDonors.jsx"
import CampaignUpdates from "@/components/CampaignUpdates.jsx"
import CampaignComments from "@/components/CampaignComments"
import { getUser } from "@/lib/auth.js"

export default function CampaignDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [donationAmount, setDonationAmount] = useState("")
  const [isFollowed, setIsFollowed] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        setError(null)

        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const response = await fetch(`${backendUrl}/campaigns/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error(`Campaign not found`)
        }

        const data = await response.json()
        if (data.success && data.campaign) {
          setCampaign(data.campaign)
        }

        setLoading(false)
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    if (id) {
      fetchCampaign()
    }
  }, [id])

  const handleDonate = async () => {
    const amount = parseFloat(donationAmount);
    if (!donationAmount || isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive"
      });
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const user = getUser();
    const donationData = {
      user_id: user.user_id,
      campaign_id: id,
      amount: amount,
    };

    try {
      const response = await fetch(`${backendUrl}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      const data = await response.json();

      if (!response.ok) {
        navigate('/cancel')
      }

      navigate('/success')
      setDonationAmount("");

    } catch (error) {
      console.error('❌ Error creating donation:', error);
      toast({
        title: "Donation failed",
        description: "Unable to process your donation. Please try again.",
        variant: "destructive",
      });
    }

    console.log(`Donating $${amount} to campaign ${id}`);
  };

  const user = getUser();
  const handleFollowButton = async (e) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to follow campaigns.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(
        `${backendUrl}/follows/toggle-follow/${user.user_id}/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setIsFollowed(data.action === "followed");
        toast({
          title: data.action === "followed" ? "Following Campaign!" : "Unfollowed",
          description: data.action === "followed" 
            ? "You'll receive updates about this campaign" 
            : "You've unfollowed this campaign",
        });
      } else {
        console.error("Error toggling follow:", data.message);
        toast({
          title: "Action Failed",
          description: data.message || "Failed to toggle follow",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Network error:", err);
      toast({
        title: "Network Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-24">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl animate-pulse"></div>
            </div>
            <p className="text-gray-400 font-medium text-lg">Loading campaign details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-24">
            <div className="relative inline-block mb-6">
              <div className="rounded-full bg-red-500/10 p-6 border border-red-500/20">
                <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Campaign Not Found</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button 
              onClick={() => navigate('/all-campaigns')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105"
            >
              Back to Campaigns
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const progressPercentage = Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getDaysRemaining = () => {
    const today = new Date()
    const endDate = new Date(campaign.end_date)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const getCategoryStyle = (category) => {
    const styles = {
      charity: "bg-blue-500 text-white",
      medical: "bg-red-500 text-white",
      education: "bg-green-500 text-white",
      emergency: "bg-orange-500 text-white",
      personal: "bg-purple-500 text-white"
    }
    return styles[category?.toLowerCase()] || styles.personal
  }

  const daysRemaining = getDaysRemaining()

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/all-campaigns')}
            className="mb-6 gap-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 text-gray-200 rounded-xl transition-all hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 text-blue-400" />
            Back to All Campaigns
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Campaign Image */}
              <div className="relative aspect-video mb-6 rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold capitalize shadow-lg ${getCategoryStyle(campaign.category)}`}>
                    {campaign.category}
                  </span>
                </div>
              </div>

              {/* Campaign Title and Description */}
              <div className="mb-8 p-6 rounded-2xl bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm">
                <h1 className="text-4xl font-bold text-white mb-4">{campaign.title}</h1>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg">{campaign.description}</p>
                </div>
              </div>

              {/* Campaign Stats */}
              <Card className="mb-6 shadow-2xl bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="text-3xl font-bold text-blue-400">{formatCurrency(campaign.raised_amount)}</div>
                      <div className="text-sm text-gray-400 mt-1">Raised</div>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <div className="text-3xl font-bold text-purple-400">{formatCurrency(campaign.goal_amount)}</div>
                      <div className="text-sm text-gray-400 mt-1">Goal</div>
                    </div>
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="text-3xl font-bold text-green-400">{progressPercentage.toFixed(0)}%</div>
                      <div className="text-sm text-gray-400 mt-1">Funded</div>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <div className="text-3xl font-bold text-orange-400">{daysRemaining}</div>
                      <div className="text-sm text-gray-400 mt-1">Days Left</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for Details, Updates, and Comments */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-900/50 border border-gray-800 p-1 rounded-xl">
                  <TabsTrigger 
                    value="details" 
                    className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Campaign Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="updates"
                    className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Updates
                  </TabsTrigger>
                  <TabsTrigger 
                    value="comments"
                    className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Comments
                  </TabsTrigger>
                </TabsList>

                {/* Campaign Details Tab */}
                <TabsContent value="details">
                  <Card className="shadow-2xl bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Target className="h-5 w-5 text-blue-400" />
                        Campaign Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-300 p-3 rounded-lg bg-gray-800/30">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <span>Started on {new Date(campaign.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300 p-3 rounded-lg bg-gray-800/30">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <span>Ends on {new Date(campaign.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300 p-3 rounded-lg bg-gray-800/30">
                        <Users className="h-5 w-5 text-blue-400" />
                        <span>
                          Created by <span className="font-semibold text-white">{campaign.creator ? campaign.creator.username : "Unknown"}</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Updates Tab */}
                <TabsContent value="updates">
                  <CampaignUpdates campaign_id={id} creator_name={campaign.creator.username} />
                </TabsContent>

                {/* Comments Tab */}
                <TabsContent value="comments">
                  <CampaignComments campaign_id={id} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Donation Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Donation Card */}
                <Card className="shadow-2xl bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-400">Progress</span>
                        <span className="text-sm font-bold text-blue-400">{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg shadow-blue-500/50"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Funding Info */}
                    <div className="mb-6 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
                      <div className="text-3xl font-bold text-white mb-2">
                        {formatCurrency(campaign.raised_amount)}
                      </div>
                      <div className="text-gray-400">
                        raised of <span className="text-gray-300 font-semibold">{formatCurrency(campaign.goal_amount)}</span> goal
                      </div>
                    </div>

                    {/* Donation Form */}
                    {progressPercentage < 100 && daysRemaining > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Donation Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">$</span>
                          <input
                            type="number"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/50 text-white placeholder:text-gray-500 transition-all"
                            placeholder="Enter amount"
                            min="1"
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {progressPercentage >= 100 ? (
                        <div className="text-center py-6 px-4 rounded-xl bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                            <Target className="h-6 w-6" />
                            <span className="font-bold text-lg">Campaign Funded!</span>
                          </div>
                          <p className="text-sm text-gray-400">This campaign has reached its goal.</p>
                        </div>
                      ) : daysRemaining === 0 ? (
                        <div className="text-center py-6 px-4 rounded-xl bg-red-500/10 border border-red-500/20">
                          <div className="text-red-400 font-bold text-lg mb-2">Campaign Ended</div>
                          <p className="text-sm text-gray-400">This campaign is no longer accepting donations.</p>
                        </div>
                      ) : (
                        user && (
                          <Button
                            onClick={handleDonate}
                            disabled={!donationAmount || parseFloat(donationAmount) <= 0 || isNaN(parseFloat(donationAmount))}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            size="lg"
                          >
                            Donate Now
                          </Button>
                        )
                      )}

                      <div className="flex gap-2">
                        {user && (
                          <Button
                            onClick={handleFollowButton}
                            disabled={loading}
                            className={`flex-1 gap-2 py-4 rounded-xl font-semibold transition-all hover:scale-105 ${
                              isFollowed
                                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50"
                                : "bg-gray-800 hover:bg-gray-700 text-gray-200 border-2 border-gray-700"
                            }`}
                          >
                            <Heart
                              className={`h-5 w-5 ${isFollowed ? "fill-current" : ""}`}
                            />
                            {isFollowed ? "Following" : "Follow"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Donors Card */}
                <RecentDonors campaign_id={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}