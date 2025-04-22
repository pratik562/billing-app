// render/src/config/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAc3lcSAI7SUWbWIyDdYD35uAHZhg-ZJMc",
  authDomain: "billing-app-ce229.firebaseapp.com",
  projectId: "billing-app-ce229",
  storageBucket: "billing-app-ce229.firebasestorage.app",
  messagingSenderId: "594258808332",
  appId: "1:594258808332:web:162dd0aa88694706a9e829",
  measurementId: "G-5GGP8E0LFL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
