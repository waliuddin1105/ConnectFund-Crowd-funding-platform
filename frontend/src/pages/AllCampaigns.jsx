import { useState, useMemo, useEffect } from "react"
import { Search, Filter, SortAsc, Sparkles } from "lucide-react"
import CampaignCard from "../components/CampaignCard"
import Navbar from "@/components/Navbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function AllCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // API call to fetch campaigns from database
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${backendUrl}/campaigns/`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data);

        if (data.success && data.campaigns) {
          setCampaigns(data.campaigns);
        } else {
          throw new Error('Invalid response format');
        }

      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    if (!campaigns.length) return []

    let filtered = campaigns.filter(campaign => {
      const title = campaign.title || ""

      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter

      return matchesSearch && matchesCategory
    })

    // Sort campaigns
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.start_date) - new Date(a.start_date)
        case "oldest":
          return new Date(a.start_date) - new Date(b.start_date)
        case "goal_high":
          return b.goal_amount - a.goal_amount
        case "goal_low":
          return a.goal_amount - b.goal_amount
        case "progress_high":
          return (b.raised_amount / b.goal_amount) - (a.raised_amount / a.goal_amount)
        case "progress_low":
          return (a.raised_amount / a.goal_amount) - (b.raised_amount / b.goal_amount)
        default:
          return 0
      }
    })

    return filtered
  }, [campaigns, searchTerm, categoryFilter, sortBy])

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setSortBy("newest")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-24">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500 mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl animate-pulse"></div>
            </div>
            <p className="text-gray-400 font-medium text-lg">Loading campaigns...</p>
            <p className="text-gray-500 text-sm mt-2">Discovering amazing projects for you</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
            <h3 className="text-2xl font-bold text-white mb-3">Error Loading Campaigns</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100">
        {/* Hero Header Section */}
        <div className="relative border-b border-gray-800/50 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-1/4 w-2 h-2 bg-purple-500/30 rounded-full animate-float"></div>
            <div className="absolute top-40 right-1/3 w-3 h-3 bg-blue-500/30 rounded-full animate-float-delayed"></div>
            <div className="absolute top-60 left-1/2 w-2 h-2 bg-emerald-500/30 rounded-full animate-float-slow"></div>
          </div>

          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="text-center max-w-3xl mx-auto">

              <h1 className="text-5xl pb-3 md:text-6xl font-bold leading-tight mb-0 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300">
                All Campaigns
              </h1>
              <p className="text-xl text-gray-400">
                Discover and support meaningful causes from our community
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="mb-10 space-y-6">
            {/* Search Bar */}
            <div className="relative group">

              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 
                  rounded-2xl blur-xl opacity-0 group-hover:opacity-100 
                  transition-opacity z-0"></div>

              <div className="relative z-10">

                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 
                 text-gray-400 pointer-events-none transition-colors 
                 group-hover:text-purple-400 z-20"
                />

                <input
                  type="text"
                  placeholder="Search campaigns by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-14 pl-14 pr-6 rounded-2xl border border-gray-800/50 
                 bg-gray-900/50 text-gray-100 placeholder:text-gray-500 
                 focus:outline-none focus:ring-2 focus:ring-purple-500/50 
                 focus:border-purple-500/50 backdrop-blur-sm 
                 transition-all text-lg z-10"
                />

              </div>
            </div>


            {/* Filters Row */}
            <div className="rounded-2xl border border-gray-800/50 bg-gray-900/30 backdrop-blur-sm p-6">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Category Filter */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Filter className="h-5 w-5 text-purple-400" />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48 h-12 bg-gray-800/50 border-gray-700 hover:border-gray-600 rounded-xl text-gray-200">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-gray-200">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="charity">Charity</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <SortAsc className="h-5 w-5 text-blue-400" />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 h-12 bg-gray-800/50 border-gray-700 hover:border-gray-600 rounded-xl text-gray-200">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-gray-200">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="goal_high">Highest Goal</SelectItem>
                      <SelectItem value="goal_low">Lowest Goal</SelectItem>
                      <SelectItem value="progress_high">Most Funded</SelectItem>
                      <SelectItem value="progress_low">Least Funded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="ml-auto border-2 border-gray-700 hover:border-gray-600 bg-gray-800/50 hover:bg-gray-800 text-gray-200 rounded-xl px-6 h-12 transition-all hover:scale-105"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-sm">
              <p className="text-sm text-gray-400">
                Showing <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-bold text-base">{filteredAndSortedCampaigns.length}</span> of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-bold text-base">{campaigns.length}</span> campaigns
              </p>
            </div>
          </div>

          {/* Campaigns Grid */}
          {filteredAndSortedCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedCampaigns.map(campaign => (
                <div key={campaign.campaign_id} className="transform transition-all hover:scale-105">
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="relative inline-block mb-6">
                <div className="rounded-full bg-gray-800/50 p-8 border border-gray-700/50 backdrop-blur-sm">
                  <Filter className="h-16 w-16 text-gray-600" />
                </div>
                <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-2xl"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No campaigns found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Try adjusting your search criteria or clearing the filters to see more results
              </p>
              <Button
                onClick={clearFilters}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(-15px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}