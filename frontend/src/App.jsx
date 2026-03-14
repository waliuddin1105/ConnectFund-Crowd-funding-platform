import { Toaster } from './components/ui/toaster'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'


function App() {
  const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },

  ])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}

export default App
