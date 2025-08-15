// context/protectRoute
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './authContext';
import React from 'react';

export function TutorRoute() {
  const { userProfile } = useAuth();
  if (userProfile?.role !== 'Individual' && userProfile?.role !== 'Mass') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export function StudentRoute() {
  const { userProfile } = useAuth();
  if (userProfile?.role !== 'student') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
