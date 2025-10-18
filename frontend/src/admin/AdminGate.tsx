
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { adminApi } from './api';

export default function AdminGate() {
  // Three possible states:
  // null = still checking, true = admin is logged in, false = not logged in
  const [ok, setOk] = useState<null | boolean>(null);
  
  // ========== TEMPORARY: Remove this later ==========
  // Force loading screen to show for 3 seconds for demo purposes
  const [showLoading, setShowLoading] = useState(true);
  // ==================================================

  useEffect(() => {
    // Important: Using mounted flag to prevent memory leaks
    // Had issues before where setState was called after component unmounted
    let mounted = true;

    // ========== TEMPORARY: 3 second delay - REMOVE THIS LATER ==========
    const timer = setTimeout(() => {
      if (mounted) setShowLoading(false);
    }, 3000);
    // ====================================================================

    // Try to get admin profile - if it works, they're logged in
    // Note to self: This is basically checking if their JWT token is valid
    adminApi.me()
      .then(()=> mounted && setOk(true))  // Success = they're an admin
      .catch(()=> mounted && setOk(false)); // Fail = not admin or token expired
    
    // Cleanup function runs when component unmounts
    // This prevents the "setState on unmounted component" warning
    return () => { 
      mounted = false;
      clearTimeout(timer); // ========== TEMPORARY: Clean up timer ==========
    };
  }, []); // Empty deps array = only runs once when component mounts

  // Three possible states:
  // ========== TEMPORARY: Show loading if either checking auth OR forced delay ==========
  if (ok === null || showLoading) {
  // ========== When removing 3-second delay, change above line back to: if (ok === null) { ==========
    // Enhanced loading screen with dark mode support
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* Animated logo */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-2xl border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
            </div>
          </div>
          
          {/* Loading text */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Tutorly Admin
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            Verifying admin session...
          </p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center gap-1.5 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!ok) return <Navigate to="/admin/auth" replace />; // Not admin -> send to login
  return <Outlet />; // Is admin -> show requested admin page via Outlet
}
