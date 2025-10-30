import React from 'react'
import {Routes, Route} from 'react-router-dom'
import ProtectRoutes from './components/auth/ProtectRoutes'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import ProfilesPage from './pages/ProfilesPage'
import ViewBookPage from './pages/ViewBookPage'
const App = () => {
  return (
    <div >
      <Routes>
      {/* Public Routes */}

        <Route path="/" element={<LandingPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/signup" element={<SignUpPage/>} />
      {/* Private Routes */}
        <Route path="/dashboard/" element={<ProtectRoutes><DashboardPage/></ProtectRoutes>} />
        <Route path="/editor/:bookId" element={<ProtectRoutes><EditorPage/></ProtectRoutes>} />
        <Route path="/view-book/:bookId" element={<ProtectRoutes><ViewBookPage/></ProtectRoutes>} />
        <Route path="/profile" element={<ProtectRoutes><ProfilesPage/></ProtectRoutes>} />
      </Routes>
      
    </div>
  )
}

export default App