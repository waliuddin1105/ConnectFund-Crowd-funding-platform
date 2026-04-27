import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getUser } from "@/lib/auth"

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

function ActiveCampaigns() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeCampaigns, setActiveCampaigns] = useState([])
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [updatesLoading, setUpdatesLoading] = useState(false)
    const [updatesError, setUpdatesError] = useState(null)

    useEffect(() => {
        const storedUser = getUser()
        setUser(storedUser)

        if (storedUser && storedUser.user_id) {
            fetchActiveCampaigns(storedUser.user_id)
        }
    }, [])

    const fetchActiveCampaigns = async (donorId) => {
        try {
            setLoading(true)
            const backendUrl = import.meta.env.VITE_BACKEND_URL
            const res = await fetch(`${backendUrl}/donations/active-campaigns/${donorId}`)
            if (!res.ok) throw new Error("Failed to fetch active campaigns")
            const data = await res.json()
            setActiveCampaigns(data.active_campaigns || [])
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchCampaignUpdates = async (campaignId) => {
        try {
            setUpdatesLoading(true)
            setUpdatesError(null)
            const backendUrl = import.meta.env.VITE_BACKEND_URL
            const res = await fetch(`${backendUrl}/campaigns/get-updates/${campaignId}`)
            if (!res.ok) throw new Error("Failed to fetch campaign updates")
            const data = await res.json()
            setSelectedCampaign((prev) => ({
                ...prev,
                updates: data.updates || [],
            }))
        } catch (err) {
            console.error(err)
            setUpdatesError(err.message)
        } finally {
            setUpdatesLoading(false)
        }
    }

    const handleViewUpdates = (campaign) => {
        setSelectedCampaign({ ...campaign, updates: [] }) // initialize updates empty
        fetchCampaignUpdates(campaign.campaign_id)
    }

    if (loading) {
        return <p className="text-center text-gray-400 py-12">Loading active campaigns...</p>
    }

    if (error) {
        return <p className="text-center text-red-500 py-12">{error}</p>
    }

    if (activeCampaigns.length === 0) {
        return (
            <p className="text-center text-gray-400 py-12">
                You have no active campaigns you are supporting.
            </p>
        )
    }

    return (
        <>
            <div className="space-y-6">
                {activeCampaigns.map((campaign) => {
                    const progress = campaign.goal_amount
                        ? Math.round((campaign.raised_amount / campaign.goal_amount) * 100)
                        : 0

                    return (
                        <Card
                            key={campaign.campaign_id}
                            className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl"
                        >
                            <CardContent className="space-y-4 pt-5">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-white">{campaign.title}</h4>
                                    {/* Lighter % Funded badge */}
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700/70 text-white">
                                        {progress}% Funded
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <Progress
                                        value={progress}
                                        className="h-2 bg-gray-700/40 [&>div]:bg-green-500"
                                    />
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>{formatCurrency(campaign.raised_amount)} raised</span>
                                        <span>Goal: {formatCurrency(campaign.goal_amount)}</span>
                                    </div>
                                </div>


                                {/* ---------- View Updates Dialog ---------- */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="w-full text-white bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
                                            size="sm"
                                            onClick={() => handleViewUpdates(campaign)}
                                        >
                                            View Campaign Updates
                                        </Button>
                                    </DialogTrigger>

                                    {selectedCampaign &&
                                        selectedCampaign.campaign_id === campaign.campaign_id && (
                                            <DialogContent className="bg-gray-900 text-white">
                                                <DialogHeader>
                                                    <DialogTitle>Updates – {selectedCampaign.title}</DialogTitle>
                                                </DialogHeader>

                                                {updatesLoading ? (
                                                    <p>Loading updates...</p>
                                                ) : updatesError ? (
                                                    <p className="text-red-500">{updatesError}</p>
                                                ) : selectedCampaign.updates?.length ? (
                                                    <div className="mt-4 space-y-4">
                                                        {selectedCampaign.updates.map((u, i) => (
                                                            <div
                                                                key={i}
                                                                className="p-3 border rounded-lg bg-gray-800/50"
                                                            >
                                                                <p className="text-xs text-gray-400">
                                                                    {formatDate(u.created_at)}
                                                                </p>
                                                                <p className="mt-1 text-sm">{u.content}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p>No updates available.</p>
                                                )}
                                            </DialogContent>
                                        )}
                                </Dialog>
                                {/* ------------------------------------------ */}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </>
    )
}

export default ActiveCampaigns
