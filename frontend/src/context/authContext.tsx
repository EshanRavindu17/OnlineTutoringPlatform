// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase.tsx';

interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
  role: 'student' | 'Individual' | 'Mass' | 'Admin';
  photo_url?: string;
  bio?: string;
  dob?: string;
  created_at: string;
  updated_at: string;
  
  tutorStatus?: 'active' | 'pending' | 'suspended' | 'rejected' | 'not_registered';
  canAccessDashboard?: boolean;
  message?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if email is verified first
        if (!user.emailVerified) {
          console.log('User email not verified, not setting user profile');
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setCurrentUser(user);

        let retries = 3;
        let profileData = null;

        while (retries > 0) {
          try {
            // Check if we need fresh token or can use cached one
            let idToken;
            try {
              // First try with cached token
              idToken = await user.getIdToken(false);
              
              const payload = JSON.parse(atob(idToken.split('.')[1]));
              const currentTime = Date.now() / 1000;
              
              // If token expires in next 5 minutes, get fresh one
              if (payload.exp <= (currentTime + 300)) {
                console.log('🔄 Token expiring soon, refreshing...');
                idToken = await user.getIdToken(true);
              }
            } catch {
              // If validation fails, get fresh token
              idToken = await user.getIdToken(true);
            }

            // console.log('🔑 Using Firebase ID token, expires at:', 
            //   new Date(JSON.parse(atob(idToken.split('.')[1])).exp * 1000).toLocaleString());
            
            
            const response = await fetch(`http://localhost:5000/api/user/${user.uid}`, {
              method: 'GET',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              }
            });
            profileData = await response.json();

            console.log('👤 Fetched user profile:', profileData);

            if (response.ok) {
              break;
            } else if (response.status === 401) {
              await user.getIdToken(true);
            } else {
              console.error('Profile fetch failed:', response.status, response.statusText);
            }
          } catch (err) {
            console.error('Retry fetch user profile failed:', err);
          }

          retries--;
          if (retries > 0) {
            await new Promise(res => setTimeout(res, 1000)); // wait 1 second before retry
          }
        }

        if (profileData) {
          setUserProfile(profileData);
          // Store userType in localStorage for persistence
          localStorage.setItem('userType', profileData.role);
        } else {
          console.error('Failed to fetch user profile after retries');
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        // Clear userType from localStorage when user signs out
        localStorage.removeItem('userType');
        console.log('User signed out, userType cleared');
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);


  const value = {
    currentUser,
    userProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
