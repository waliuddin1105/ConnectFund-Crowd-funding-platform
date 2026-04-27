import { useState, useEffect } from "react"
import { Calendar, CheckCircle, Clock, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function DonationHistory({ donorId }) {
  const [donationHistory, setDonationHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const res = await fetch(`${backendUrl}/donations/history/${donorId}`)
        const data = await res.json()
        setDonationHistory(data.donation_history || [])
      } catch (error) {
        console.error("Error fetching donation history:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [donorId])

  const formatCurrency = (amount) => `Rs. ${amount.toLocaleString()}`

  const getCategoryStyle = (category) => {
    switch (category?.toLowerCase()) {
      case "education": return "bg-blue-500 text-white"
      case "health": return "bg-green-500 text-white"
      case "environment": return "bg-teal-500 text-white"
      case "disaster relief": return "bg-red-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const downloadReceipt = (id) => alert(`Downloading receipt for donation #${id} (not implemented yet)`)

  return (
    <Card className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white">Donation History</CardTitle>
        <CardDescription>View all your past donations</CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : donationHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No donations found.</div>
        ) : (
          <div className="space-y-4">
            {donationHistory.map((donation, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30"
              >
                {/* Left Section */}
                <div className="flex items-center gap-4">
                  <img
                    src={donation.image}
                    alt={donation.title}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-700"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{donation.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <span className={`px-2 py-1 rounded-full ${getCategoryStyle(donation.category)}`}>
                        {donation.category}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Calendar className="h-3 w-3 text-blue-400" />
                        {new Date(donation.donation_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg text-white">{formatCurrency(donation.amount)}</div>
                    <Badge
                      variant={donation.status === "completed" ? "default" : "secondary"}
                      className="mt-1 flex items-center gap-1"
                    >
                      {donation.status === "completed" ? (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      ) : (
                        <Clock className="h-3 w-3 text-yellow-400" />
                      )}
                      {donation.status}
                    </Badge>
                  </div>

                  {donation.status === "completed" && (
                    <Button onClick={() => downloadReceipt(index)} variant="ghost" size="sm">
                      <Download className="h-4 w-4 text-purple-400" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DonationHistory
