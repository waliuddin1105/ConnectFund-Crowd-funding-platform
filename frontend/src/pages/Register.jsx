import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Button } from "../components/ui/button"
import { Mail, Lock, User, Sparkles, ArrowRight, AlertCircle, Users, Zap, Check, Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "../lib/utils.js"


// Inline RoleCard component
function RoleCard({ role, selected, onSelect }) {
    const isCreator = role === "creator"

    return (
        <div
            onClick={onSelect}
            className={cn(
                "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:scale-[1.02]",
                selected
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                    : "border-gray-700 bg-gray-800/50 hover:border-blue-400/50 hover:bg-gray-800"
            )}
        >
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300",
                        selected
                            ? "bg-blue-500 shadow-lg shadow-blue-500/30"
                            : "bg-gray-700"
                    )}
                >
                    {isCreator ? (
                        <Zap className={cn("h-5 w-5", selected ? "text-white" : "text-gray-400")} />
                    ) : (
                        <Users className={cn("h-5 w-5", selected ? "text-white" : "text-gray-400")} />
                    )}
                </div>
                <div className="flex-1">
                    <h3 className={cn("font-bold capitalize text-sm mb-0.5", selected ? "text-white" : "text-gray-300")}>
                        {role}
                    </h3>
                    <p className="text-xs text-gray-400 leading-tight">
                        {isCreator ? "Launch campaigns" : "Support projects"}
                    </p>
                </div>
            </div>

            {selected && (
                <div className="absolute top-2 right-2">
                    <div className="bg-blue-500 rounded-full p-0.5">
                        <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                </div>
            )}
        </div>
    )
}

// Inline PasswordStrength component
function PasswordStrength({ password }) {
    const checks = [
        { label: "≥ 8 chars", valid: password.length >= 8 },
        { label: "Uppercase", valid: /[A-Z]/.test(password) },
        { label: "Lowercase", valid: /[a-z]/.test(password) },
        { label: "Number", valid: /\d/.test(password) },
    ]

    const validChecks = checks.filter(check => check.valid).length
    const strength = validChecks / checks.length

    return (
        <div className="mt-2 space-y-1.5 p-2.5 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Strength:</span>
                <div className="flex-1 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                    <div
                        className={cn(
                            "h-full transition-all duration-300",
                            strength < 0.5 ? "bg-red-500" : strength < 0.8 ? "bg-yellow-400" : "bg-green-500"
                        )}
                        style={{ width: `${strength * 100}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
                {checks.map((check, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs">
                        <div className={cn(
                            "flex items-center justify-center h-3 w-3 rounded-full",
                            check.valid ? "bg-green-500/20" : "bg-gray-700"
                        )}>
                            <Check className={cn("h-2 w-2", check.valid ? "text-green-400" : "text-gray-500")} />
                        </div>
                        <span className={cn("font-medium text-[10px]", check.valid ? "text-green-400" : "text-gray-500")}>
                            {check.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function Register() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("creator")
    const [profileImage, setProfileImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})

    
    function validate() {
        const next = {}
        if (!username || username.trim().length < 2) next.username = "Please enter a username (min 2 chars)"
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email"
        if (!password) next.password = "Password is required"
        else if (password.length < 8) next.password = "Password must be at least 8 characters"
        if (!["creator", "donor"].includes(role)) next.role = "Please select a valid role"
        setErrors(next)
        return Object.keys(next).length === 0
    }

    async function uploadToCloudinary(file) {
        const formData = new FormData()
        const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        formData.append("file", file)
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
        const defaultImgURL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1763711531/default_pfp_w2lnen.jpg`
            
        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            )

            if (!response.ok) {
                throw new Error("Failed to upload image")
            }

            const data = await response.json()
            return data.secure_url
        } catch (error) {
            console.error("Cloudinary upload error:", error)
            throw error
        }
    }

    async function handleImageChange(e) {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid File",
                description: "Please select a valid image file",
                variant: "destructive",
            })
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Image size should be less than 5MB",
                variant: "destructive",
            })
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)

        setUploadingImage(true)
        try {
            const imageUrl = await uploadToCloudinary(file)
            setProfileImage(imageUrl)
        } catch (error) {
            toast({
                title: "Upload Failed",
                description: "Failed to upload image. Please try again.",
                variant: "destructive",
            })
            setImagePreview(null)
        } finally {
            setUploadingImage(false)
        }
    }

    function handleRemoveImage() {
        setProfileImage(null)
        setImagePreview(null)
        const fileInput = document.getElementById("profile-image")
        if (fileInput) fileInput.value = ""
    }

    async function onSubmit(e) {
        e.preventDefault()
        setTouched({ username: true, email: true, password: true, role: true })
        if (!validate()) return

        setLoading(true)
        try {
            const payload = {
                username: username.trim(),
                email: email.toLowerCase().trim(),
                password: password,
                role: role,
                profile_image: profileImage || defaultImgURL
            }
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: "Account Created Successfully!",
                    description: `Welcome ${username}! Redirecting to login page...`,
                    variant: "default",
                })

                setTimeout(() => {
                    navigate('/login')
                }, 1500)
            } else {
                const errorMessage = data.Error || "Registration failed"
                toast({
                    title: "Registration Failed",
                    description: errorMessage,
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Registration error:", err)
            toast({
                title: "Network Error",
                description: "Please check your connection and try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }


    const handleReset = () => {
        setUsername("")
        setEmail("")
        setPassword("")
        setRole("creator")
        setProfileImage(null)
        setImagePreview(null)
        setErrors({})
        setTouched({})
        const fileInput = document.getElementById("profile-image")
        if (fileInput) fileInput.value = ""
    }

    const formDisabled = useMemo(() => loading, [loading])

    return (
        <div className="min-h-screen relative overflow-hidden text-white">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2000"
                    alt="Crowdfunding background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gray-950/85" />
            </div>

            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500/30 rounded-full animate-float"></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-400/30 rounded-full animate-float-delayed"></div>
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-600/30 rounded-full animate-float-slow"></div>
            </div>

            <main className="relative flex min-h-screen items-center justify-center p-4 py-6">
                <div className="w-full max-w-2xl animate-fade-in">
                    <div className="bg-gray-900/90 border border-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-xl p-6 lg:p-8">

                        {/* Header */}
                        <header className="text-center mb-6">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                                Create Your Account
                            </h1>
                            <p className="text-sm text-gray-400">
                                Join creators and donors building the future
                            </p>
                        </header>

                        {/* Form */}
                        <form onSubmit={onSubmit} className="space-y-4">

                            {/* Username */}
                            <div className="group">
                                <label htmlFor="username" className="block text-sm font-semibold mb-1.5 text-gray-300">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-400" />
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        required
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); if (touched.username) validate() }}
                                        onBlur={() => setTouched({ ...touched, username: true })}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm",
                                            errors.username && touched.username && "border-red-500 focus:ring-red-500"
                                        )}
                                        placeholder="Choose a unique username"
                                    />
                                    {errors.username && touched.username && (
                                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                                    )}
                                </div>
                                {errors.username && touched.username && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="group">
                                <label htmlFor="email" className="block text-sm font-semibold mb-1.5 text-gray-300">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-400" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (touched.email) validate() }}
                                        onBlur={() => setTouched({ ...touched, email: true })}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm",
                                            errors.email && touched.email && "border-red-500 focus:ring-red-500"
                                        )}
                                        placeholder="you@example.com"
                                    />
                                    {errors.email && touched.email && (
                                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                                    )}
                                </div>
                                {errors.email && touched.email && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="group">
                                <label htmlFor="password" className="block text-sm font-semibold mb-1.5 text-gray-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-400" />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); if (touched.password) validate() }}
                                        onBlur={() => setTouched({ ...touched, password: true })}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm",
                                            errors.password && touched.password && "border-red-500 focus:ring-red-500"
                                        )}
                                        placeholder="Create a strong password"
                                    />
                                    {errors.password && touched.password && (
                                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                                    )}
                                </div>

                                {password && <PasswordStrength password={password} />}

                                {errors.password && touched.password && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Choose Your Role</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <RoleCard
                                        role="creator"
                                        selected={role === "creator"}
                                        onSelect={() => setRole("creator")}
                                    />
                                    <RoleCard
                                        role="donor"
                                        selected={role === "donor"}
                                        onSelect={() => setRole("donor")}
                                    />
                                </div>
                            </div>

                            {/* Profile Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Profile Image (Required)</label>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
                                    {/* Image Preview */}
                                    <div className="flex-shrink-0 self-center sm:self-auto">
                                        {imagePreview ? (
                                            <div className="relative group">
                                                <img
                                                    src={imagePreview}
                                                    alt="Profile preview"
                                                    className="h-20 w-20 rounded-full object-cover border-4 border-blue-500 shadow-lg transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full p-1.5 transition-all shadow-lg hover:scale-110"
                                                    disabled={uploadingImage}
                                                    title="Remove image"
                                                >
                                                    <X className="h-3 w-3 text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="h-20 w-20 rounded-full bg-gray-700/50 flex items-center justify-center border-4 border-gray-600">
                                                <ImageIcon className="h-8 w-8 text-gray-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Controls */}
                                    <div className="flex-1 text-center sm:text-left">
                                        <label
                                            htmlFor="profile-image"
                                            className={cn(
                                                "inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 rounded-xl cursor-pointer transition-all font-semibold text-white text-sm shadow-lg hover:shadow-blue-500/50 hover:scale-105",
                                                uploadingImage && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <Upload className="h-4 w-4" />
                                            <span>
                                                {uploadingImage ? "Uploading..." : imagePreview ? "Change" : "Upload"}
                                            </span>
                                        </label>

                                        <input
                                            id="profile-image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            disabled={uploadingImage || loading}
                                        />

                                        <p className="text-xs text-gray-400 mt-2">
                                            Max <span className="text-gray-300 font-semibold">5MB</span> • JPG, PNG, GIF
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                {/* Create Account button */}
                                <button
                                    type="submit"
                                    disabled={loading || uploadingImage}
                                    className="flex-1 group bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2 text-sm">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Creating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2 text-sm">
                                            Create Account
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    )}
                                </button>

                                {/* Reset button */}
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={loading || uploadingImage}
                                    className="sm:w-28 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                                >
                                    Reset
                                </button>
                            </div>

                        </form>

                        {/* Footer */}
                        <div className="mt-6 pt-4 border-t border-gray-700/50 text-center">
                            <p className="text-xs text-gray-400">
                                Already have an account?{" "}

                                <a href="/login"
                                    className="font-bold text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
                                >

                                    Sign in here
                                </a>
                            </p>
                        </div>

                    </div>
                </div>
            </main>

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
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
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
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
            `}</style>
        </div>
    )
}