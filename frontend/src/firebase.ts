import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDzdnBZXdL96iXoy127soxwAIdlQNUCsks",
  authDomain: "online-tutoring-platform-30573.firebaseapp.com",
  projectId: "online-tutoring-platform-30573",
  storageBucket: "online-tutoring-platform-30573.firebasestorage.app",
  messagingSenderId: "32236704005",
  appId: "1:32236704005:web:b3abf0be7dfabb16e2676c",
  measurementId: "G-6HQFT5WRF9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
