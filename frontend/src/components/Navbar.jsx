import { useMemo, useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, Heart, LogOut, Settings, LayoutDashboard, Plus } from "lucide-react"
import { getUser, logout } from "@/lib/auth.js"

function getDashboardLink(role) {
  switch (role) {
    case "admin":
      return { href: "/admin-dashboard", label: "Admin Dashboard" }
    case "donor":
      return { href: "/donor-dashboard", label: "Donor Dashboard" }
    case "creator":
      return { href: "/creator-dashboard", label: "Creator Dashboard" }
    default:
      return { href: "/", label: "Home" }
  }
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function Navbar() {
  const [user, setUser] = useState(null)
  const location = useLocation()
  useEffect(() => {
    const storedUser = getUser()
    if (storedUser) {
      try {
        setUser(storedUser)
      } catch (e) {
        console.error("Failed to parse user from localStorage", e)
        setUser(null)
      }
    }
  }, [])

  const dashboard = useMemo(() => getDashboardLink(user?.role), [user?.role])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white backdrop-blur-md shadow-xl">
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 md:px-8 max-w-7xl">

        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-white/10" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white border-white/10">
              <SheetHeader>
                <SheetTitle className="text-white text-xl font-bold">Menu</SheetTitle>
              </SheetHeader>

              {/* Mobile Navigation */}
              <nav className="mt-6 flex flex-col gap-2">
                <Link
                  to="/"
                  className="px-4 py-2.5 text-sm font-medium text-gray-200 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/all-campaigns"
                  className="px-4 py-2.5 text-sm font-medium text-gray-200 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Explore Campaigns
                </Link>
                <Link
                  to="/contact-us"
                  className="px-4 py-2.5 text-sm font-medium text-gray-200 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Contact
                </Link>

                <div className="mt-6 pt-6 border-t border-white/10">
                  {user?.role == 'creator' && (
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white mb-3">
                    <Link to="/create-campaign">
                      <Plus className="h-4 w-4 mr-2" />
                      Start a Campaign
                    </Link>
                  </Button>

                  )}
                  {user ? (
                    <div className="space-y-2">
                      <Button variant="outline" asChild className="w-full border-white/20 hover:bg-white/10 text-white">
                        <Link to={dashboard.href}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          {dashboard.label}
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full border-white/20 hover:bg-white/10 text-white">
                        <Link to="/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </Button>
                      <Button variant="ghost" onClick={logout} className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium truncate">{user?.username}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.role}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button asChild className="w-full bg-primary hover:bg-primary/90">
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full border-white/20 hover:bg-white/10 text-white">
                        <Link to="/register">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Heart className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight transition-colors">
              CrowdFund
            </span>
          </Link>
        </div>

        {/* Center: Desktop navigation */}
        <nav className="hidden md:flex items-center gap-14">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors relative group 
      ${location.pathname === "/" ? "text-cyan-400" : "text-gray-200 hover:text-cyan-400"}`}
          >
            Home
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-cyan-400 transition-all duration-300
      ${location.pathname === "/" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
          </Link>

          <Link
            to="/all-campaigns"
            className={`text-sm font-medium transition-colors relative group 
      ${location.pathname === "/all-campaigns" ? "text-cyan-400" : "text-gray-200 hover:text-cyan-400"}`}
          >
            All Campaigns
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-cyan-400 transition-all duration-300
      ${location.pathname === "/all-campaigns" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
          </Link>

          <Link
            to="/contact-us"
            className={`text-sm font-medium transition-colors relative group 
      ${location.pathname === "/contact-us" ? "text-cyan-400" : "text-gray-200 hover:text-cyan-400"}`}
          >
            Contact
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-cyan-400 transition-all duration-300
      ${location.pathname === "/contact-us" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {user?.role == 'creator' && (
            <Button asChild className="hidden md:inline-flex bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/20 transition-all">
            <Link to="/create-campaign">
              <Plus className="h-4 w-4 mr-2" />
              Start Campaign
            </Link>
          </Button>

          )}
          {user ? (
            <>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full p-0 hover:bg-white/10 focus:ring-2 focus:ring-primary/50">
                    <Avatar className="h-10 w-10 border-2 border-primary/50">
                      {user?.profile_image ? (
                        <AvatarImage src={user.profile_image} alt={`${user.username} avatar`} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-semibold">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 text-white border-white/10">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.username || "User"}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                    <Link to={dashboard.href} className="flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      {dashboard.label}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                    <Link to="/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden md:inline-flex hover:bg-white/10 hover:text-cyan-400">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg">
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
