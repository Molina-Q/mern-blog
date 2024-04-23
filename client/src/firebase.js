// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-7f681.firebaseapp.com",
  projectId: "mern-blog-7f681",
  storageBucket: "mern-blog-7f681.appspot.com",
  messagingSenderId: "83978111711",
  appId: "1:83978111711:web:389e1d61ead85869bab76a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);