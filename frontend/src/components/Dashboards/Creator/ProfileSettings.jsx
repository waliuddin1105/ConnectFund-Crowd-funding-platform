import { useState } from "react"
import { User, ImagePlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast.js"
import { getToken } from "@/lib/auth.js"

function ProfileSettings() {
  const { toast } = useToast()
  const user = JSON.parse(localStorage.getItem("user"))
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [password, setPassword] = useState("")
  const [profileImage, setProfileImage] = useState(user?.profile_image || "")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      )

      const data = await res.json()
      setProfileImage(data.secure_url)

      toast({
        title: "Image uploaded",
        description: "Your profile picture has been updated.",
      })
    } catch (err) {
      toast({
        title: "Upload Error",
        description: "Could not upload image. Try again.",
        variant: "destructive",
      })
    }

    setUploading(false)
  }

  const handleUpdate = async () => {
    setLoading(true)

    const response = await fetch(`${backendUrl}/users/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        username,
        email,
        password: password || "string",
        profile_image: profileImage || "string",
      }),
    })

    const data = await response.json()
    setLoading(false)

    if (data?.Success) {
      localStorage.setItem("user", JSON.stringify(data.user))
      toast({
        title: "Profile Updated",
        description: "Your account details were saved successfully!",
      })
    } else {
      toast({
        title: "Update Failed",
        description: data.Error || "Something went wrong!",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="bg-gray-900/50 border border-gray-800/50 shadow-2xl rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* PROFILE IMAGE */}
        <div className="flex flex-col items-start gap-3">
          <Label className="text-sm font-medium text-gray-300">Profile Image</Label>

          {profileImage && (
            <img
              src={profileImage}
              alt="profile"
              className="w-24 h-24 rounded-full border border-gray-700 object-cover"
            />
          )}

          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="bg-gray-800/30 text-white border border-gray-700"
            />
            <ImagePlus className="text-white" />
          </div>

          {uploading && (
            <p className="text-sm text-gray-400">Uploading...</p>
          )}
        </div>

        {/* USER FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="bg-gray-800/30 text-white border border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Email</Label>
            <Input
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="bg-gray-800/30 text-white border border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">New Password (optional)</Label>
            <Input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="bg-gray-800/30 text-white border border-gray-700"
            />
          </div>
        </div>

        <Button
          onClick={handleUpdate}
          disabled={loading || uploading}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default ProfileSettings
