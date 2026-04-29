// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyDRZXLhxX9Bpa5INYqGG0RSFnKCbyCKfXQ",
//   authDomain: "fit2feb.firebaseapp.com",
//   projectId: "fit2feb",
//   storageBucket: "fit2feb.firebasestorage.app",
//   messagingSenderId: "933900684413",
//   appId: "1:933900684413:web:6e21645cc9900b2aceb514"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export default app;

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ← Add this

const firebaseConfig = {
  apiKey: "AIzaSyDCRu5eU22MoG1uJi56n5wnfnVZhTaR5WI",
  authDomain: "fib2fab-3d3e0.firebaseapp.com",
  projectId: "fib2fab-3d3e0",
  storageBucket: "fib2fab-3d3e0.firebasestorage.app",
  messagingSenderId: "103833128120",
  appId: "1:103833128120:web:5edfcd10038d0e4b19f84d",
  measurementId: "G-9Z0LREK3N0",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app); // ← Add this
export default app;
