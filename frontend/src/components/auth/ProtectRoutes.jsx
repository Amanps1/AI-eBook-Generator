import React, { Children } from 'react'
import { Navigate, useLocation } from 'react-router-dom';
import BeatLoader from "react-spinners/BeatLoader";
import { useAuth } from '../../context/AuthContext';
const ProtectRoutes = ({children}) => {
  const { isAuthenticated, loading } = useAuth();
  const location=useLocation();

  if(loading){
   return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#36d7b7" />
      </div>
    );
  }

  if(!isAuthenticated){
    return <Navigate to="/login" state={{from:location}} replace />
  }  
  return children;
}

export default ProtectRoutes 