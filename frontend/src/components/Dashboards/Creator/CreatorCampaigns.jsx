import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, Trash2, Plus, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getToken } from "@/lib/auth.js"

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

const getCategoryStyle = (category) => {
  const styles = {
    charity: "bg-blue-500 text-white",
    medical: "bg-red-500 text-white",
    education: "bg-green-500 text-white",
    emergency: "bg-orange-500 text-white",
    personal: "bg-purple-500 text-white",
  }
  return styles[category] || styles.personal
}

const getStatusBadge = (status) => {
  const styles = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    draft: "bg-gray-100 text-gray-800",
  }
  return styles[status] || styles.draft
}

function CreatorCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [updateContent, setUpdateContent] = useState("")
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  const [loadingUpdate, setLoadingUpdate] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const navigate = useNavigate()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    const access_token = getToken()
    const response = await fetch(`${backendUrl}/creator/campaigns`, {
      headers: access_token ? { Authorization: `Bearer ${access_token}` } : {},
    })
    const data = await response.json()
    if (data?.campaigns) setCampaigns(data.campaigns)
  }

  const confirmDeleteCampaign = (campaign) => {
    setCampaignToDelete(campaign)
    setDeleteModalOpen(true)
  }

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return
    const access_token = getToken()
    const response = await fetch(
      `${backendUrl}/campaigns/delete-campaign/${campaignToDelete.campaign_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )
    const data = await response.json()
    if (data?.success) {
      setCampaigns((prev) =>
        prev.filter((c) => c.campaign_id !== campaignToDelete.campaign_id)
      )
    }
    setDeleteModalOpen(false)
    setCampaignToDelete(null)
  }

  const handlePostUpdate = async () => {
    if (!updateContent.trim() || !selectedCampaignId) return
    setLoadingUpdate(true)
    const access_token = getToken()
    const response = await fetch(`${backendUrl}/campaigns/post-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        campaign_id: selectedCampaignId,
        content: updateContent,
      }),
    })
    const data = await response.json()
    setLoadingUpdate(false)

    if (data?.success) {
      alert("Update posted successfully!")
      setUpdateContent("")
      setSelectedCampaignId(null)
    } else {
      alert(data.message || "Failed to post update")
    }
  }

  return (
    <div className="max-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 p-4">
      <div className="grid grid-cols-1 gap-6">
        {campaigns.length === 0 ? (
          <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl p-10 text-center">
            <CardContent>
              <h3 className="text-2xl font-bold mb-2">No Campaigns Found</h3>
              <p className="text-gray-400 mb-4">
                You haven't created any campaigns yet. Start your first campaign and reach your goals!
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105"
                onClick={() => navigate("/create-campaign")}
              >
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => {
            const progress = (campaign.raised_amount / campaign.goal_amount) * 100
            return (
              <Card
                key={campaign.campaign_id}
                className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full md:w-32 h-32 object-cover rounded-2xl shadow-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-2xl font-bold mb-1 text-white">{campaign.title}</h3>
                          <div className="flex gap-2 items-center">
                            <Badge className={getCategoryStyle(campaign.category)}>
                              {campaign.category}
                            </Badge>
                            <Badge className={getStatusBadge(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
                            size="sm"
                            onClick={() =>
                              navigate(`/all-campaigns/${campaign.campaign_id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {campaign.status !== "completed" && (
                            <>
                              <Button
                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                size="sm"
                                onClick={() => confirmDeleteCampaign(campaign)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                                size="sm"
                                onClick={() =>
                                  setSelectedCampaignId(campaign.campaign_id)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {campaign.status !== "completed" && (
                        <>
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-2 text-gray-300">
                              <span>
                                {formatCurrency(campaign.raised_amount)} raised of{" "}
                                {formatCurrency(campaign.goal_amount)}
                              </span>
                              <span className="font-bold text-white">{progress.toFixed(0)}%</span>
                            </div>
                            <Progress
                              value={progress}
                              className="h-3 rounded-xl bg-gray-800/50"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4 mt-4 text-sm text-gray-400">
                            <div>
                              <p>Donors</p>
                              <p className="font-semibold text-white">{campaign.total_donors}</p>
                            </div>
                            <div>
                              <p>Start Date</p>
                              <p className="font-semibold text-white">{formatDate(campaign.start_date)}</p>
                            </div>
                            <div>
                              <p>End Date</p>
                              <p className="font-semibold text-white">{formatDate(campaign.end_date)}</p>
                            </div>
                          </div>

                          {selectedCampaignId === campaign.campaign_id && (
                            <div className="mt-4">
                              <Input
                                placeholder="Write an update..."
                                value={updateContent}
                                onChange={(e) => setUpdateContent(e.target.value)}
                                className="bg-gray-800/50 text-white placeholder:text-gray-400"
                              />
                              <Button
                                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                                onClick={handlePostUpdate}
                                disabled={loadingUpdate}
                              >
                                {loadingUpdate ? "Posting..." : "Post Update"}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-96 p-6 bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-200"
              >
                <X />
              </Button>
            </div>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete the campaign "{campaignToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                onClick={handleDeleteCampaign}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CreatorCampaigns
