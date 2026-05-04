import Navbar from "@/components/Navbar"
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react"

export default function ContactUs() {
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const defaultImgURL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1763711531/default_pfp_w2lnen.jpg`
  const admins = [
    {
      id: 1,
      name: "Wali Uddin",
      role: "Backend Developer",
      email: "k230719@nu.edu.pk",
      phone: "+1 (555) 123-4567",
      image: defaultImgURL,
      bio: "Commits after every two lines of code, all labeled “Minor fixes.”",
      availability: "Mon - Fri, 9 AM - 6 PM EST"
    },
    {
      id: 2,
      name: "Sajjad Ahmed",
      role: "Full Stack Developer",
      email: "k230754@nu.edu.pk",
      phone: "+1 (555) 234-5678",
      image: defaultImgURL,
      bio: "Wipes the entire project and its commit history, and then blames AI for it.",
      availability: "Mon - Sat, 8 AM - 8 PM EST"
    },
    {
      id: 3,
      name: "Saad Zaidi",
      role: "Backend + AI Developer",
      email: "k230874@nu.edu.pk",
      phone: "+1 (555) 345-6789",
      image: defaultImgURL,
      bio: "Building backend with efficient copilot vibe coding",
      availability: "Mon - Fri, 10 AM - 7 PM EST"
    }
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-600/10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Contact Our Team
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Have questions or need assistance? Our dedicated admin team is ready to support you on your crowdfunding journey.
              </p>
            </div>
          </div>
        </div>

        {/* Admin Cards Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-600/0 group-hover:from-cyan-500/5 group-hover:to-purple-600/5 transition-all duration-300" />

                <div className="relative p-6">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                      <img
                        src={admin.image}
                        alt={admin.name}
                        className="relative h-32 w-32 rounded-full object-cover border-4 border-gray-700 group-hover:border-cyan-500 transition-all duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {admin.name}
                    </h3>
                    <p className="text-sm font-medium text-cyan-400 mb-3">
                      {admin.role}
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {admin.bio}
                    </p>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors group/item">
                      <Mail className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <a
                        href={`mailto:${admin.email}`}
                        className="text-sm text-gray-300 hover:text-cyan-400 transition-colors truncate"
                      >
                        {admin.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors group/item">
                      <Phone className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <a
                        href={`tel:${admin.phone}`}
                        className="text-sm text-gray-300 hover:text-cyan-400 transition-colors"
                      >
                        {admin.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                      <Clock className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">
                        {admin.availability}
                      </span>
                    </div>
                  </div>

                  {/* Contact Button */}
                  <button
                    onClick={() => window.open(
                      `https://mail.google.com/mail/?view=cm&fs=1&to=${admin.email}`,
                      "_blank"
                    )}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg hover:shadow-cyan-500/50"
                  >
                    <Send className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    Send Message
                  </button>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Office Location */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Our Office</h3>
                <p className="text-gray-400">
                  123 Innovation Drive<br />
                  Tech City, TC 12345<br />
                  United States
                </p>
              </div>

              {/* Response Time */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Response Time</h3>
                <p className="text-gray-400">
                  We typically respond within<br />
                  24 hours during business days<br />
                  48 hours on weekends
                </p>
              </div>

              {/* Support Hours */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">24/7 Support</h3>
                <p className="text-gray-400">
                  Emergency support available<br />
                  through our help center<br />
                  Round-the-clock assistance
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}