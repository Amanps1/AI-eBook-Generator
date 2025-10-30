import React, { use } from 'react'
import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
const ProfileDropDown = ({isOpen, onToggle, avatar, companyName, email, onLogout}) => {
  const navigate=useNavigate();

  return (
    <div className=''>
      <button onClick={onToggle} className=''>
        {avatar ? (
          <img src={avatar} alt="avatar" className='w-10 h-10 rounded-full' />
        ) : (
          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center'>
            <span className='text-white font-semibold text-sm'>
              {companyName?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </button>
    </div>
  )
}

export default ProfileDropDown