import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQfE9EBQA6XtNAs8hjMW_NneKqlT9y54g",
  authDomain: "tijara-39522.firebaseapp.com",
  projectId: "tijara-39522",
  storageBucket: "tijara-39522.firebasestorage.app",
  messagingSenderId: "656943003673",
  appId: "1:656943003673:web:f49b5bb5b89d0513491288"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();