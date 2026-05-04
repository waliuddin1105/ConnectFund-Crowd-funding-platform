import { useState,useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast.js';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import AdminKeyStats from '@/components/Dashboards/Admin/AdminKeyStats';
import PendingCampaigns from '@/components/Dashboards/Admin/PendingCampaigns';
import ApprovedCampaigns from '@/components/Dashboards/Admin/ApprovedCampaigns';
import RejectedCampaigns from '@/components/Dashboards/Admin/RejectedCampaigns';
import UsersTab from '@/components/Dashboards/Admin/UsersTab';
import TransactionHistory from '@/components/Dashboards/Admin/TransactionHistory';
import AnalyticsTab from '@/components/Dashboards/Admin/AnalyticsTab';
import AdminControls from '@/components/Dashboards/Admin/AdminControls';
import UnauthorizedBox from '@/components/UnauthorizedBox';
import { getUser } from '@/lib/auth.js';
import { MessageCircle } from 'lucide-react';
const AdminDashboard = () => {
  const { toast } = useToast();
  const [user,setUser] = useState(null)
  const navigate = useNavigate()
  useEffect(() => {
          window.scrollTo(0, 0);
             let storedUser = getUser()
              setUser(storedUser)
      }, []);
  return (
    <>
      <Navbar />

      {user?.role == 'admin' ? (<main
        className="min-h-screen relative overflow-hidden text-white bg-gray-900"
        style={{
          backgroundImage: 'url("/your-background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/85 to-gray-900/90" />

        {/* Accent Glows */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/15 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/12 rounded-full blur-2xl animate-pulse delay-700" />

        <div className="relative container mx-auto py-10 px-6 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-300 mt-1">
              Manage campaigns, users, and platform operations
            </p>
          </div>

          {/* Key Stats (Glass Card) */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 shadow-[0_0_15px_rgba(0,255,255,0.12)]">
            <AdminKeyStats />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="campaigns" className="space-y-6">

            {/* Tab Buttons */}
            <TabsList className="grid grid-cols-5 bg-gray-800/60 border border-cyan-500/20 backdrop-blur-md rounded-xl p-1">
              <TabsTrigger
                value="campaigns"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-lg"
              >
                Campaigns
              </TabsTrigger>

              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-lg"
              >
                Users
              </TabsTrigger>

              <TabsTrigger
                value="financials"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-lg"
              >
                Financials
              </TabsTrigger>

              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-lg"
              >
                Analytics
              </TabsTrigger>

              <TabsTrigger
                value="controls"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-lg"
              >
                Controls
              </TabsTrigger>
            </TabsList>

            {/* Campaigns */}
            <TabsContent value="campaigns">
              <div className="space-y-6">
                <PendingCampaigns />
                <ApprovedCampaigns />
                <RejectedCampaigns />
              </div>
            </TabsContent>

            {/* Users */}
            <TabsContent value="users" className="space-y-6">
              <UsersTab />
            </TabsContent>

            {/* Financials */}
            <TabsContent value="financials" className="space-y-6">
              <TransactionHistory />
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsTab />
            </TabsContent>

            {/* Controls */}
            <TabsContent value="controls" className="space-y-6">
              <AdminControls />
            </TabsContent>

          </Tabs>
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
      </main>) : <UnauthorizedBox message={'You need to be an admin to visit this page'}/>}
    </>
  );
};

export default AdminDashboard;
