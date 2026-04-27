import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getToken } from "@/lib/auth.js"

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function RecentCampaignDonations() {
    const [donations, setDonations] = useState([])
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    useEffect(() => {
        const fetchDonations = async () => {
            const access_token = getToken()

            const response = await fetch(`${backendUrl}/creator/recent-donations`, {
                headers: access_token ? { Authorization: `Bearer ${access_token}` } : {},
            })

            const data = await response.json()
            if (data?.recent_donations) setDonations(data.recent_donations)
        }

        fetchDonations()
    }, [])

    return (
        <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-6">
                <div className="space-y-4">
                    {donations.length > 0 ? (
                        donations.map((donation) => (
                            <div
                                key={donation.donation_id}
                                className="flex items-center justify-between p-4 rounded-2xl bg-gray-800/30 border border-gray-700/40"
                            >
                                {/* Left section */}
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        {donation.user?.profile_image ? (
                                            <AvatarImage
                                                src={donation.user.profile_image}
                                                alt={donation.user.username}
                                            />
                                        ) : (
                                            <AvatarFallback>
                                                {donation.user?.username
                                                    ? donation.user.username.charAt(0).toUpperCase()
                                                    : "?"}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>

                                    <div>
                                        <p className="font-semibold text-white">
                                            {donation.user?.username || "Unknown User"}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {donation.campaign?.title}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatDateTime(donation.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="text-right">
                                    <p className="text-lg font-bold text-blue-400">
                                        {formatCurrency(donation.amount)}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-gray-700/40 bg-gray-800/30">
                            <div className="p-3 rounded-full bg-gray-700/30">
                                <span className="text-2xl">💸</span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-white">
                                No Donations Yet
                            </h3>
                            <p className="text-sm text-gray-400 max-w-sm">
                                Donations made on your campaigns will appear here once supporters start contributing.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default RecentCampaignDonations
