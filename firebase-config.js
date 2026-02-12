import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAjDps0BqGfL_fJemmwVSNW00KJjBEIoXY",
    authDomain: "tactical-stealth-backend.firebaseapp.com",
    projectId: "tactical-stealth-backend",
    storageBucket: "tactical-stealth-backend.firebasestorage.app",
    messagingSenderId: "775150118825",
    appId: "1:775150118825:web:c35d5318b290c20986c6b8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
