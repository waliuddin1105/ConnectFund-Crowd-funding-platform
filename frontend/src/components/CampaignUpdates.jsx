import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MessageSquare, Calendar } from "lucide-react"
import React from 'react'

const formatTimeAgo = (dateString) => {
  const dateUTC = new Date(dateString);
  const datePK = new Date(dateUTC.getTime() + 5 * 60 * 60 * 1000);

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - datePK.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;

  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

function CampaignUpdates({ campaign_id, creator_name }) {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true)
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${backendUrl}/campaigns/get-updates/${campaign_id}`);
        const data = await response.json();

        if (data.success && data.updates.length > 0) {
          setUpdates(data.updates);
          console.log(data.updates)
        } else {
          setUpdates([]);
        }
      } catch (error) {
        console.error("Error fetching updates:", error);
        setUpdates([]);
      } finally {
        setLoading(false)
      }
    };

    fetchUpdates();
  }, [campaign_id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="relative inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-4"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl animate-pulse"></div>
        </div>
        <p className="text-gray-400">Loading updates...</p>
      </div>
    )
  }

  if (updates.length === 0) {
    return (
      <Card className="shadow-2xl bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 border border-gray-700 mb-4">
              <MessageSquare className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Updates Yet</h3>
            <p className="text-gray-400">The creator hasn't posted any updates for this campaign.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <Card 
          key={update.update_id} 
          className="shadow-2xl bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:border-gray-700 transition-all"
        >
          <CardHeader className="border-b border-gray-800/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>{formatTimeAgo(update.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-xs">
                    {creator_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {creator_name}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-gray-300 leading-relaxed">{update.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default CampaignUpdates