"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Navbar from "@/components/Navbar"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import FAQs from "@/components/FAQs"
import { MessageCircle } from "lucide-react"


function formatCurrency(n) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `$${Number(n || 0).toLocaleString()}`
  }
}

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [pledge, setPledge] = useState(50)
  const [stats, setStats] = useState([])
  const navigate = useNavigate()
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const res = await axios.get(`${backendUrl}/campaigns/stats`);
        setStats(res.data.stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchFullyFundedCampaigns = async () => {
      try {
        const response = await fetch(`${backendUrl}/campaigns/fully-funded`)
        const data = await response.json()

        if (data.success) {
          setCampaigns(data.campaigns)

          console.log(`Loaded ${data.count} fully-funded campaigns`)
        } else {
          console.error('Failed to fetch campaigns:', data.error)
        }
      } catch (error) {
        console.error('Error fetching fully-funded campaigns:', error)
      }
    }

    fetchFullyFundedCampaigns()
  }, [])

  const exampleGoal = 10000
  const pledgeImpactPct = Math.min(100, Math.max(0, Math.round((Number(pledge || 0) / exampleGoal) * 100)))

  return (
    <>
      <Navbar />
      <main className="font-sans bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 min-h-screen">
        <section className="relative border-b border-gray-800/50 min-h-[65vh] md:min-h-[75vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-emerald-900/20 animate-gradient"></div>

          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="/hero-img.jpg"
              alt="Crowdfunding hero background"
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
          </div>

          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-500/30 rounded-full animate-float"></div>
            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-500/30 rounded-full animate-float-delayed"></div>
            <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-blue-500/30 rounded-full animate-float-delayed"></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-emerald-500/30 rounded-full animate-float-slow"></div>
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-emerald-500/30 rounded-full animate-float-slow"></div>
          </div>

          {/* Hero content */}
          <div className="relative mx-auto max-w-6xl px-4 py-20 z-10">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl pb-3 font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300 animate-fade-in">
                Fund ideas worth building.
              </h1>
              <p className="mt-6 text-xl text-gray-300 leading-relaxed animate-fade-in-delayed">
                Join thousands of creators and supporters shaping the future—start your journey today!
                Be part of campaigns that make a real impact!
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-more-delayed">
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
                >
                  <Link to={"/all-campaigns"}>Explore campaigns</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg rounded-xl transition-all hover:scale-105"
                >
                  <Link to={'/create-campaign'} className="text-white hover:text-white">Start a campaign</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent"></div>
        </section>


        {/* Platform KPIs */}
        <section className="border-b border-gray-800/50 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 to-transparent"></div>
          <div className="mx-auto max-w-6xl px-4 py-16 grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {[
              { label: "Total raised", value: formatCurrency(stats.total_raised), gradient: "from-emerald-400 to-green-500" },
              { label: "Donors", value: stats.total_donors, gradient: "from-blue-400 to-cyan-500" },
              { label: "Success rate", value: `${Math.round(stats.success_rate)}%`, gradient: "from-purple-400 to-pink-500" },
              { label: "Active campaigns", value: stats.active_campaigns, gradient: "from-orange-400 to-red-500" }
            ].map((stat, i) => (
              <div key={i} className="group rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 backdrop-blur-sm hover:border-gray-700 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10">
                <div className="text-sm text-gray-400 uppercase tracking-wide">{stat.label}</div>
                <div className={`mt-2 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient}`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-gray-800/50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">How it works</h2>
            <p className="text-center text-gray-400 mb-8">Simple steps to make your dreams a reality</p>
            <Tabs defaultValue="backers" className="mt-8">
              <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto bg-gray-900/50 border border-gray-800 rounded-xl p-1">
                <TabsTrigger value="backers" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"><p className="text-white"> For Donors</p></TabsTrigger>
                <TabsTrigger value="creators" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"><p className="text-white"> For Creators</p></TabsTrigger>
              </TabsList>
              <TabsContent value="backers" className="mt-8">
                <ol className="grid gap-6 md:grid-cols-3">
                  {[
                    { title: "Explore", desc: "Find ideas by title, search, or Sort by dates.", icon: "🔍" },
                    { title: "Pledge", desc: "Choose a campaign to support tier and back them.", icon: "💳" },
                    { title: "Track", desc: "Get updates and follow progress to completion.", icon: "📊" }
                  ].map((step, i) => (
                    <li key={i} className="group rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-gray-800/40 p-6 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10">
                      <h3 className="font-semibold text-xl mb-2">{i + 1}. {step.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                    </li>
                  ))}
                </ol>
              </TabsContent>
              <TabsContent value="creators" className="mt-8">
                <ol className="grid gap-6 md:grid-cols-3">
                  {[
                    { title: "Create", desc: "Post your campaign with Goal, description, and a timeline.", icon: "✨" },
                    { title: "Monitor", desc: "Track Your Campaign's progress.", icon: "🚀" },
                    { title: "Deliver", desc: "Update donors and acknowledge their payments.", icon: "🎁" }
                  ].map((step, i) => (
                    <li key={i} className="group rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-gray-800/40 p-6 hover:border-blue-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
                      <h3 className="font-semibold text-xl mb-2">{i + 1}. {step.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Pledge impact calculator */}
        <section className="border-b border-gray-800/50 bg-gradient-to-b from-purple-900/5 via-transparent to-blue-900/5">
          <div className="mx-auto max-w-6xl px-4 py-16 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-gray-800/40 p-8 backdrop-blur-sm hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-2xl">Estimate your impact</h3>
              </div>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                See how your pledge contributes toward a typical goal of {formatCurrency(exampleGoal)}.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  value={pledge}
                  onChange={(e) => setPledge(e.target.value)}
                  aria-label="Pledge amount"
                  className="bg-gray-950/50 border-gray-700 focus:border-purple-500 text-lg py-6"
                />
                <Button
                  variant="secondary"
                  onClick={() => setPledge(50)}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-6"
                >
                  Reset
                </Button>
              </div>
              <div className="mt-6">
                <Progress value={pledgeImpactPct} className="h-3 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-green-500" />

                <div className="mt-4 p-4 rounded-xl bg-gray-950/50 border border-gray-800">
                  <div className="text-sm text-gray-400">
                    Your pledge of <span className="font-bold text-emerald-400 text-lg">{formatCurrency(pledge)}</span> covers
                    approximately <span className="font-bold text-emerald-400 text-lg">{pledgeImpactPct}%</span> of a{" "}
                    {formatCurrency(exampleGoal)} goal.
                  </div>
                </div>
              </div>
            </div>

            {/* Trust & Safety */}
            <div className="rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-gray-800/40 p-8 backdrop-blur-sm hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl"></div>
                <h3 className="font-semibold text-2xl">Trust & Safety</h3>
              </div>
              <ul className="mt-6 grid gap-4">
                {[
                  { title: "All-or-Nothing Funding", desc: "Creators only receive funds if the goal is met.", icon: "✓" },
                  { title: "Creator Verification", desc: "Identity checks and transparent project details.", icon: "✓" },
                  { title: "Secure Payments", desc: "Protected transactions and PCI-compliant processing.", icon: "✓" }
                ].map((item, i) => (
                  <li key={i} className="rounded-xl border border-gray-800/50 bg-gray-950/30 p-4 hover:border-blue-500/30 transition-all hover:translate-x-1">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold text-xl">{item.icon}</span>
                      <div>
                        <span className="font-semibold text-white">{item.title}</span>
                        <p className="text-sm text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Success highlights */}
        <section className="border-b border-gray-800/50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Fully funded on Crowdfund</h2>
                <p className="text-gray-400 mt-2">Celebrating success stories from our community</p>
              </div>
              
            </div>
            <div className="mt-6 flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {campaigns.map((p) => {
                const pct = Math.min(100, Math.round((p.raised_amount / p.goal_amount) * 100))
                return (
                  <figure key={p.campaign_id} className="group shrink-0 w-80 rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-gray-800/40 overflow-hidden hover:border-emerald-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
                    <div className="aspect-[16/9] w-full overflow-hidden bg-gray-800 relative">
                      <img
                        src={p.image || "/placeholder.svg"}
                        alt={`${p.title} cover`}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <figcaption className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">{p.category}</Badge>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg shadow-emerald-500/30">100% funded</Badge>
                      </div>
                      <div className="mt-2 font-semibold text-lg line-clamp-2 group-hover:text-emerald-400 transition-colors">{p.title}</div>
                      <div className="mt-4">
                        <Progress
                          value={pct}
                          className="h-2 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-green-500"
                        />
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="font-bold text-emerald-400 text-lg">{formatCurrency(p.raised_amount)}</span>
                          <span className="text-gray-500">of {formatCurrency(p.goal_amount)}</span>
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </div>
        </section>

        {/* Success Stories */}

        {/* Final CTA */}
        <section id="start" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-emerald-900/20"></div>
          <div className="mx-auto max-w-6xl px-4 py-24 text-center relative z-10">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <p className="text-sm uppercase tracking-widest text-purple-400 font-semibold">Get Started Today</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 pb-6">
              Ready to launch your campaign?
            </h2>
            <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
              Join thousands of creators bringing new ideas to life. Your journey starts here.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 text-lg rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
              >
                <Link to={"/all-campaigns"}>Find inspiration</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 backdrop-blur-sm px-10 py-7 text-lg rounded-xl transition-all hover:scale-105"
              >
                <Link to={'/create-campaign'} className="text-white hover:text-white">Start a campaign</Link>
              </Button>
            </div>
          </div>
        </section>
        <FAQs />

        {/* Sticky Chat Button */}
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
      </main>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-gradient {
          animation: gradient 8s ease-in-out infinite;
        }
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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-delayed {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
        .animate-fade-in-more-delayed {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
      `}</style>
    </>
  )
}