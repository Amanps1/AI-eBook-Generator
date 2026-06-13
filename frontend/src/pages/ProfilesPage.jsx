import { useState } from "react"
import { toast } from "react-hot-toast"
import DashboardLayout from "../components/layout/DashboardLayout"
import InputField from "../components/ui/InputField"
import Button from "../components/ui/Button"
import axiosInstance from "../utils/axosinstance"
import { API_PATH } from "../utils/apiPaths"
import { useAuth } from "../context/AuthContext"

const ProfilesPage = () => {
  const { user, updateUser, logout } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await axiosInstance.put(API_PATH.AUTH.UPDATE_PROFILE, {
        name: formData.name,
      })
      updateUser(response.data)
      toast.success("Profile updated successfully.")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="max-w-2xl rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
            <InputField
              label="Email"
              name="email"
              value={formData.email}
              readOnly
              className="cursor-not-allowed"
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" isLoading={isSaving}>
                Save profile
              </Button>
              <Button variant="secondary" onClick={logout}>
                Sign out
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProfilesPage