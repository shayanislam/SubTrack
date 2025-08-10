import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDSr14UX522Sam1_C1Pvc28qJwlsEfC1qA",
  authDomain: "tracksub-48845.firebaseapp.com",
  projectId: "tracksub-48845",
  storageBucket: "tracksub-48845.firebasestorage.app",
  messagingSenderId: "599493472638",
  appId: "1:599493472638:web:068b95ba7a521df388832f",
  measurementId: "G-37F4W7XXBQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);