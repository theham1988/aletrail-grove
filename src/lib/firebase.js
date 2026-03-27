import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJHzz7pmKuJJ3GtVXo0tvVthzZiDCuKPU",
  authDomain: "phuket-ale-trail.firebaseapp.com",
  projectId: "phuket-ale-trail",
  storageBucket: "phuket-ale-trail.firebasestorage.app",
  messagingSenderId: "911490259857",
  appId: "1:911490259857:web:683313c0e8a3302caa5830",
  measurementId: "G-ST8FMN6TZ8",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
