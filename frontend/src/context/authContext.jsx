// contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, getIdToken, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const token = await getIdToken(user, true);
          const response = await fetch(`http://localhost:5000/api/user/${user.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.status === 404) {
            // User exists in Firebase but not in database - this is normal for new users
            console.log('User not found in database - needs to complete registration');
            setCurrentUser(user);
            setUserProfile(null);
            navigate('/auth'); // Redirect to auth page to complete registration
            setLoading(false);
            return;
          }

          if (response.ok) {
            const profileData = await response.json();
            setCurrentUser(user);
            setUserProfile(profileData);
            
            // Navigate based on role
            if (profileData.role === 'Student') {
              navigate('/studentprofile');
            } else if (['Individual', 'Mass'].includes(profileData.role)) {
              navigate('/tutorprofile');
            }
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Auth error:', error);
          setCurrentUser(null);
          setUserProfile(null);
          navigate('/auth');
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        navigate('/auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Add logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}