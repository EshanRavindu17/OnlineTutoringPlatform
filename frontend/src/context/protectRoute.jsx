// context/protectRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './authContext';
import React, { useEffect, useState } from 'react';

export function TutorRoute() {
  const { userProfile, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && (!userProfile || (userProfile.role !== 'Individual' && userProfile.role !== 'Mass'))) {
      setShouldRedirect(true);
    }
  }, [userProfile, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (shouldRedirect) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

export function StudentRoute() {
  const { userProfile, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'Student')) {
      setShouldRedirect(true);
    }
  }, [userProfile, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (shouldRedirect) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
