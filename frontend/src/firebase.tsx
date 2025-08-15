// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDzdnBZXdL96iXoy127soxwAIdlQNUCsks",
  authDomain: "online-tutoring-platform-30573.firebaseapp.com",
  projectId: "online-tutoring-platform-30573",
  storageBucket: "online-tutoring-platform-30573.firebasestorage.app",
  messagingSenderId: "32236704005",
  appId: "1:32236704005:web:b3abf0be7dfabb16e2676c",
  measurementId: "G-6HQFT5WRF9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set persistence - change to browserSessionPersistence for session-only auth
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set auth persistence:', error);
});

export default app;
