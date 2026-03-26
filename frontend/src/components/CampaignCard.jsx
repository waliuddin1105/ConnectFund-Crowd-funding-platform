import { Calendar, Users, Target, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function CampaignCard({ campaign }) {
  const navigate = useNavigate()

  // Navigate to campaign details on card click
  const handleCardClick = () => {
    navigate(`/all-campaigns/${campaign.campaign_id}`)
  }

  const progressPercentage = Math.min(
    (campaign.raised_amount / campaign.goal_amount) * 100,
    100
  )

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getDaysRemaining = () => {
    const today = new Date()
    const endDate = new Date(campaign.end_date)
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const daysRemaining = getDaysRemaining()

  // Category styling
  const getCategoryStyle = (category) => {
    const styles = {
      charity: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
      medical: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      education: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      emergency: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
      personal: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    }
    return styles[category.toLowerCase()] || styles.personal
  }

  // Progress bar color
  const getProgressColor = () => {
    if (progressPercentage >= 100) return "bg-gradient-to-r from-emerald-400 to-green-500"
    if (progressPercentage >= 75) return "bg-gradient-to-r from-blue-400 to-cyan-500"
    if (progressPercentage >= 50) return "bg-gradient-to-r from-yellow-400 to-orange-500"
    return "bg-gradient-to-r from-red-400 to-pink-500"
  }

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50 cursor-pointer h-[540px] flex flex-col"
      onClick={handleCardClick}
    >
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-px rounded-2xl " />

      {/* Image Container */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl shrink-0">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

        {/* Category Badge */}
        <div className="absolute left-4 top-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold capitalize shadow-lg backdrop-blur-sm border border-white/20 ${getCategoryStyle(
              campaign.category
            )}`}
          >
            {campaign.category}
          </span>
        </div>

        {/* Days Remaining or Funded Badge */}
        {progressPercentage >= 100 ? (
          <div className="absolute right-4 top-4">
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg border border-white/20">
              <Target className="h-3.5 w-3.5" />
              Funded
            </div>
          </div>
        ) : daysRemaining > 0 ? (
          <div className="absolute right-4 top-4">
            <div className="flex items-center gap-1.5 rounded-full bg-gray-900/90 border border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-200 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              {daysRemaining} days left
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4 min-h-[100px]">
          <h3 className="mb-2 text-lg font-bold leading-snug text-white line-clamp-2 transition-all">
            {campaign.title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Progress Section - fixed height */}
        <div className="mb-4">
          <div className="mb-3">
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className={`h-full transition-all duration-500 ease-out ${getProgressColor()}`}
                style={{ width: `${progressPercentage}%` }}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="space-y-0.5">
              <div className="font-bold text-white text-base">
                {formatCurrency(campaign.raised_amount)}
              </div>
              <div className="text-gray-500 text-xs">
                of {formatCurrency(campaign.goal_amount)}
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 text-base">
                {progressPercentage.toFixed(0)}%
              </div>
              <div className="text-gray-500 text-xs">funded</div>
            </div>
          </div>
        </div>

        {/* Meta Information - fixed height */}
        <div className="mb-4 flex flex-col gap-2 text-xs text-gray-400 min-h-[40px]">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-purple-400" />
            Started {new Date(campaign.created_at + "Z").toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            <span className="truncate">Creator: {campaign.creator_name || 'creator_name'}</span>
          </div>
        </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/all-campaigns/${campaign.campaign_id}`)
            }}
            className="rounded-xl border-2 border-gray-700 hover:border-gray-600 bg-gray-800/50 hover:bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-200 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Details
          </button>
      </div>
    </div>
  )
}