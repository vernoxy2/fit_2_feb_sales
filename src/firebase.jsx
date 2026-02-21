import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRZXLhxX9Bpa5INYqGG0RSFnKCbyCKfXQ",
  authDomain: "fit2feb.firebaseapp.com",
  projectId: "fit2feb",
  storageBucket: "fit2feb.firebasestorage.app",
  messagingSenderId: "933900684413",
  appId: "1:933900684413:web:6e21645cc9900b2aceb514"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;