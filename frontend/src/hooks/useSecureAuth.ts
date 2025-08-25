// hooks/useSecureAuth.ts
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/authContext';

/**
 * Secure authentication hook with smart token management
 * Handles token validation, refresh, and localStorage integration
 */
export const useSecureAuth = () => {
  const { currentUser } = useAuth();
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);

  /**
   * Check if stored token is still valid
   */
  const checkTokenValidity = useCallback(async (): Promise<boolean> => {
    try {
      if (!currentUser) return false;

      // Try to get current token without forcing refresh
      const token = await currentUser.getIdToken(false);
      
      if (!token) return false;

      // Decode JWT payload to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token expires in next 5 minutes (buffer for safety)
      const isValid = payload.exp > (currentTime + 300);
      
      console.log(isValid ? '✅ Token is valid' : '⚠️ Token expiring soon');
      return isValid;

    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return false;
    }
  }, [currentUser]);

  /**
   * Get a fresh Firebase ID token with smart refresh logic
   * @param forceRefresh - Force token refresh even if current token is valid
   * @returns Promise<string | null> - Fresh ID token or null if not authenticated
   */
  const getSecureToken = useCallback(async (forceRefresh: boolean = false): Promise<string | null> => {
    try {
      if (!currentUser) {
        console.warn('🚫 No authenticated user found');
        return null;
      }

      // Check if we need to refresh the token
      const needsRefresh = forceRefresh || !(await checkTokenValidity());

      // Get token (refresh if needed)
      const token = await currentUser.getIdToken(needsRefresh);
      
      if (!token) {
        console.error('❌ Failed to retrieve ID token');
        return null;
      }

      if (needsRefresh) {
        console.log('🔄 Token refreshed successfully');
      } else {
        console.log('✅ Using cached valid token');
      }

      setIsTokenValid(true);
      return token;

    } catch (error) {
      console.error('❌ Error getting secure token:', error);
      setIsTokenValid(false);
      return null;
    }
  }, [currentUser, checkTokenValidity]);

  /**
   * Get authorization headers for API requests with automatic token management
   * @param forceRefresh - Force token refresh
   * @returns Promise<object> - Headers object with Authorization header
   */
  const getAuthHeaders = useCallback(async (forceRefresh: boolean = false) => {
    const token = await getSecureToken(forceRefresh);
    
    if (!token) {
      throw new Error('Authentication required: No valid token available');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, [getSecureToken]);

  /**
   * Check if user is authenticated and token is valid
   * @returns boolean - True if user is authenticated with valid token
   */
  const isAuthenticated = useCallback((): boolean => {
    return !!currentUser && isTokenValid;
  }, [currentUser, isTokenValid]);

  /**
   * Get current user's UID safely
   * @returns string | null - User UID or null if not authenticated
   */
  const getCurrentUserUid = useCallback((): string | null => {
    return currentUser?.uid || null;
  }, [currentUser]);

  /**
   * Check authentication status and token validity on user change
   */
  useEffect(() => {
    if (currentUser) {
      checkTokenValidity().then(setIsTokenValid);
    } else {
      setIsTokenValid(false);
    }
  }, [currentUser, checkTokenValidity]);

  /**
   * Auto-refresh token before expiration (every 50 minutes)
   */
  useEffect(() => {
    if (!currentUser || !isTokenValid) return;

    const refreshInterval = setInterval(async () => {
      console.log('🔄 Auto-refreshing token...');
      await getSecureToken(true);
    }, 50 * 60 * 1000); // Refresh every 50 minutes

    return () => clearInterval(refreshInterval);
  }, [currentUser, isTokenValid, getSecureToken]);

  return {
    getSecureToken,
    getAuthHeaders,
    isAuthenticated,
    getCurrentUserUid,
    isTokenValid,
    currentUser
  };
};
