// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7r7EYtWTFIKkGEa5RGKP2OUZPhWOmNhg",
  authDomain: "online-tutoring-platform-23886.firebaseapp.com",
  projectId: "online-tutoring-platform-23886",
  
  messagingSenderId: "450895402189",
  
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;