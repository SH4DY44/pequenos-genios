import { initializeApp } from "firebase/app";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDFSd0b-jHqf9CGTPFvGUG22bMxZ57JM-o",
  authDomain: "pequenos-genios-94b29.firebaseapp.com",
  projectId: "pequenos-genios-94b29",
  storageBucket: "pequenos-genios-94b29.firebasestorage.app",
  messagingSenderId: "215729071431",
  appId: "1:215729071431:web:12a7bd8c07bbb10c7f5862",
  measurementId: "G-V5B7T21Z70"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    return true;
  } catch (error) {
    console.error("Error enviando email de verificación:", error);
    return false;
  }
};

export default app;