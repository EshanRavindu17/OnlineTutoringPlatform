
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { adminApi } from './api';

export default function AdminGate() {
  // Three possible states:
  // null = still checking, true = admin is logged in, false = not logged in
  const [ok, setOk] = useState<null | boolean>(null);

  useEffect(() => {
    // Important: Using mounted flag to prevent memory leaks
    // Had issues before where setState was called after component unmounted
    let mounted = true;

    // Try to get admin profile - if it works, they're logged in
    // Note to self: This is basically checking if their JWT token is valid
    adminApi.me()
      .then(()=> mounted && setOk(true))  // Success = they're an admin
      .catch(()=> mounted && setOk(false)); // Fail = not admin or token expired
    
    // Cleanup function runs when component unmounts
    // This prevents the "setState on unmounted component" warning
    return () => { mounted = false; };
  }, []); // Empty deps array = only runs once when component mounts

  // Three possible states:
  if (ok === null) return <div className="p-6">Checking admin session…</div>; // Still loading
  if (!ok) return <Navigate to="/admin/auth" replace />; // Not admin -> send to login
  return <Outlet />; // Is admin -> show requested admin page via Outlet
}
