import { Toaster } from './components/ui/toaster'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import AllCampaigns from './pages/AllCampaigns.jsx'
import CampaignDetails from './pages/CampaignDetails.jsx'
import CreateCampaign from './pages/CreateCampaign.jsx'
import DonorDashboard from './pages/DonorDashboard.jsx'
import CreatorDashboard from './pages/CreatorDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ContactUs from './pages/ContactUs.jsx'
import SettingsPage from './pages/SettingsPage'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'

function App() {
  const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/all-campaigns', element: <AllCampaigns /> },
    { path: '/all-campaigns/:id', element: <CampaignDetails /> },
    { path: '/create-campaign', element: <CreateCampaign /> },
    { path: '/donor-dashboard', element: <DonorDashboard /> },
    { path: '/creator-dashboard', element: <CreatorDashboard /> },
    { path: '/admin-dashboard', element: <AdminDashboard /> },
    { path: '/contact-us', element: <ContactUs /> },
    { path: '/settings', element: <SettingsPage /> },
    { path: '/success', element: <PaymentSuccess /> },
    { path: '/cancel', element: <PaymentCancel /> },

  ])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}

export default App
