import { Toaster } from './components/ui/toaster'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AllCampaigns from './pages/AllCampaigns'
import Home from './pages/Home'
import CampaignDetails from './pages/CampaignDetails'


function App() {
  const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/all-campaigns', element: <AllCampaigns /> },
    { path: '/', element: <Home /> },
    { path: '/all-campaigns/:id', element: <CampaignDetails /> },
  ])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}

export default App
