// context/protectRoute
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './authContext';
import React from 'react';

export function TutorRoute() {
  const { userProfile } = useAuth();

  // Check for Individual tutors with proper status
  if (userProfile?.role === 'Individual') {
    // If user doesn't have dashboard access, redirect to appropriate page
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
    // If active, allow access
    return <Outlet />;
  }
  // If not a tutor, redirect to home
  return <Navigate to="/" replace />;
}

export function MassRoute() {
  const { userProfile } = useAuth();
  
  // For Mass tutors, use similar logic to Individual tutors
  if (userProfile?.role === 'Mass') {
    // If user doesn't have dashboard access, redirect to appropriate page
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
    // If active, allow access
    return <Outlet />;
  }
  // If not a Mass tutor, redirect to home
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
