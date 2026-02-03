// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDTCsoK06xwBfNF9qrrXKmm9AMEaFChvqs",
  authDomain: "lius-541af.firebaseapp.com",
  projectId: "lius-541af",
  storageBucket: "lius-541af.firebasestorage.app",
  messagingSenderId: "454670936803",
  appId: "1:454670936803:web:b874d62d6cd11cedef33d6",
  measurementId: "G-1LZ98G8MH5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
