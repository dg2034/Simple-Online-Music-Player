// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAm6wCYDB8B-2XG4n9n8iwSUzNCPZiQOf4",
    authDomain: "vibeify-ab6a8.firebaseapp.com",
    projectId: "vibeify-ab6a8",
    storageBucket: "vibeify-ab6a8.firebasestorage.app",
    messagingSenderId: "541862008599",
    appId: "1:541862008599:web:a8a65b0ab0a9a3ba43c952",
    measurementId: "G-C6HNH4ZDN2"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
