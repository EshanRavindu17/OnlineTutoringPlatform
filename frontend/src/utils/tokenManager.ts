// utils/tokenManager.ts

/**
 * Smart token management utility for Firebase authentication
 * Handles token validation, refresh, and localStorage integration
 */

interface TokenInfo {
  token: string;
  expiresAt: number;
  refreshedAt: number;
}

const TOKEN_STORAGE_KEY = 'firebase_token_info';
const TOKEN_BUFFER_TIME = 5 * 60; // 5 minutes buffer before expiration

export class TokenManager {
  /**
   * Store token information in localStorage
   */
  static storeTokenInfo(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tokenInfo: TokenInfo = {
        token,
        expiresAt: payload.exp,
        refreshedAt: Date.now() / 1000
      };
      
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenInfo));
      console.log('💾 Token info stored successfully');
    } catch (error) {
      console.error('❌ Failed to store token info:', error);
    }
  }

  /**
   * Get stored token information
   */
  static getStoredTokenInfo(): TokenInfo | null {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!stored) return null;
      
      return JSON.parse(stored) as TokenInfo;
    } catch (error) {
      console.error('❌ Failed to parse stored token info:', error);
      TokenManager.clearStoredToken();
      return null;
    }
  }

  /**
   * Check if stored token is still valid
   */
  static isStoredTokenValid(): boolean {
    const tokenInfo = TokenManager.getStoredTokenInfo();
    if (!tokenInfo) return false;
    
    const currentTime = Date.now() / 1000;
    const isValid = tokenInfo.expiresAt > (currentTime + TOKEN_BUFFER_TIME);
    
    if (!isValid) {
      console.log('⚠️ Stored token is expired or expiring soon');
      TokenManager.clearStoredToken();
    }
    
    return isValid;
  }

  /**
   * Get stored token if valid
   */
  static getValidStoredToken(): string | null {
    if (!TokenManager.isStoredTokenValid()) return null;
    
    const tokenInfo = TokenManager.getStoredTokenInfo();
    return tokenInfo?.token || null;
  }

  /**
   * Clear stored token information
   */
  static clearStoredToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    console.log('🗑️ Stored token cleared');
  }

  /**
   * Get token expiration info for debugging
   */
  static getTokenExpirationInfo(): string {
    const tokenInfo = TokenManager.getStoredTokenInfo();
    if (!tokenInfo) return 'No token stored';
    
    const expirationDate = new Date(tokenInfo.expiresAt * 1000);
    const refreshedDate = new Date(tokenInfo.refreshedAt * 1000);
    const currentTime = new Date();
    
    const timeUntilExpiration = expirationDate.getTime() - currentTime.getTime();
    const minutesUntilExpiration = Math.floor(timeUntilExpiration / (1000 * 60));
    
    return `Token expires: ${expirationDate.toLocaleString()} (in ${minutesUntilExpiration} minutes)\nLast refreshed: ${refreshedDate.toLocaleString()}`;
  }
}

/**
 * Enhanced authentication state management
 */
export class AuthStateManager {
  private static readonly AUTH_STATE_KEY = 'auth_state';
  
  /**
   * Store authentication state with userType
   */
  static storeAuthState(uid: string, email: string, role: string): void {
    const authState = {
      uid,
      email,
      role,
      lastLogin: Date.now(),
      isAuthenticated: true
    };
    
    localStorage.setItem(AuthStateManager.AUTH_STATE_KEY, JSON.stringify(authState));
    // Also store userType separately for backward compatibility
    localStorage.setItem('userType', role);
    console.log('💾 Auth state and userType stored successfully');
  }

  /**
   * Get stored authentication state
   */
  static getStoredAuthState(): any {
    try {
      const stored = localStorage.getItem(AuthStateManager.AUTH_STATE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('❌ Failed to parse auth state:', error);
      AuthStateManager.clearAuthState();
      return null;
    }
  }

  /**
   * Clear authentication state and userType
   */
  static clearAuthState(): void {
    localStorage.removeItem(AuthStateManager.AUTH_STATE_KEY);
    localStorage.removeItem('userType');
    TokenManager.clearStoredToken();
    console.log('🗑️ Auth state and userType cleared');
  }

  /**
   * Check if user was previously authenticated
   */
  static wasPreviouslyAuthenticated(): boolean {
    const authState = AuthStateManager.getStoredAuthState();
    return authState?.isAuthenticated === true;
  }
}

export default TokenManager;
