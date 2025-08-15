// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';

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

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //     if (user) {
  //       setCurrentUser(user);
        
  //       // Fetch user profile from Node.js backend
  //       try {
  //         const response = await fetch(`http://localhost:5000/api/user/${user.uid}`, {
  //           method: 'GET',
  //           headers: { 'Content-Type': 'application/json' }
  //         });

  //         if (response.ok) {
  //           const profileData = await response.json();
  //           setUserProfile(profileData);
  //         } else {
  //           console.error('Failed to fetch user profile:', await response.text());
  //           setUserProfile(null);
  //         }
  //       } catch (error) {
  //         console.error('Error fetching user profile:', error);
  //         setUserProfile(null);
  //       }
  //     } else {
  //       setCurrentUser(null);
  //       setUserProfile(null);
  //     }
  //     setLoading(false);
  //   });

  //   return unsubscribe;
  // }, []);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setCurrentUser(user);

      let retries = 5;
      let profileData = null;

      while (retries > 0) {
        try {
          // Get the ID token from Firebase for backend verification
          const idToken = await user.getIdToken();
          console.log('🔑 Got Firebase ID token, length:', idToken.length);
          console.log('🔑 Token preview:', idToken.substring(0, 100) + '...');
          
          const response = await fetch(`http://localhost:5000/api/user/${user.uid}`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            }
          });

          if (response.ok) {
            profileData = await response.json();
            break;
          }
        } catch (err) {
          console.error('Retrying fetch user profile failed:', err);
        }

        retries--;
        await new Promise(res => setTimeout(res, 1000)); // wait 1 second before retry
      }

      if (profileData) {
        setUserProfile(profileData);
      } else {
        console.error('Failed to fetch user profile after retries');
        setUserProfile(null);
      }

  

    } else {
      setCurrentUser(null);
      setUserProfile(null);
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
