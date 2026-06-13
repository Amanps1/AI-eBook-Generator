import { useState, useEffect } from "react"
import {Album} from "lucide-react"
import {Link} from "react-router-dom" 
import {useAuth} from "../../context/AuthContext"
import ProfileDropdown from "./ProfileDropDown"

const DashboardLayout = ({ children }) => {
  const {user, logout} = useAuth()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [profileDropdownOpen])

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col ">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <Link className="flex items-center space-x-3" to="/dashboard">
              <div className="h-8 w-8 bg-gradient-to-br from-violet-400 to-violet-500 rounded-lg flex items-center justify-center">
                <Album className="" />
              </div>
              <span className="">AI eBook Creator</span>
            </Link>
          </div>

          <div className="">
            <ProfileDropdown isOpen={profileDropdownOpen}
            onToggle={(e)=>{
              e.stopPropagation();
              setProfileDropdownOpen(!profileDropdownOpen)
            }}
            avatar={user?.avatar || ""}
            companyName={user?.name || ""}
            email={user?.email || ""}
            onLogout={logout}
            />

          </div>
        </header>

        <main className="">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout