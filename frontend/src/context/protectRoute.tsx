// context/protectRoute
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './authContext';
import React from 'react';

export function TutorRoute() {
  const { userProfile } = useAuth();

  if (userProfile?.role === 'Individual') {
    if (!userProfile.canAccessDashboard) {
      if (userProfile.tutorStatus === 'pending') {
        return <Navigate to="/tutor-pending" replace />;
      } else if (userProfile.tutorStatus === 'suspended') {
        return <Navigate to="/tutor-suspended" replace />;
      } else if (userProfile.tutorStatus === 'rejected') {
        return <Navigate to="/tutor-rejected" replace />;
      } else if (userProfile.tutorStatus === 'not_registered') {
        return <Navigate to="/createtutorprofile" replace />;
      }
    }
    return <Outlet />;
  }
  return <Navigate to="/" replace />;
}

export function MassRoute() {
  const { userProfile } = useAuth();
  
  if (userProfile?.role === 'Mass') {
    if (!userProfile.canAccessDashboard) {
      if (userProfile.tutorStatus === 'pending') {
        return <Navigate to="/tutor-pending" replace />;
      } else if (userProfile.tutorStatus === 'suspended') {
        return <Navigate to="/tutor-suspended" replace />;
      } else if (userProfile.tutorStatus === 'rejected') {
        return <Navigate to="/tutor-rejected" replace />;
      }
      //  else if (userProfile.tutorStatus === 'not_registered') {
      //   return <Navigate to="/createtutorprofile" replace />;
      // }
    }
    return <Outlet />;
  }
  return <Navigate to="/" replace />;
}
  
export function StudentRoute() {
  const { userProfile } = useAuth();
  console.log("User Profile:", userProfile);
  if (userProfile?.role !== 'student') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
