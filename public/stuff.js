import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpAHShcvt0z8ZmLXRkBPMiNToFVoXru0o",
  authDomain: "roameo-wad2.firebaseapp.com",
  projectId: "roameo-wad2",
  storageBucket: "roameo-wad2.firebasestorage.app",
  messagingSenderId: "186295026722",
  appId: "1:186295026722:web:ddcb6b60f6988d415f767b"
};

export const firebaseApp = initializeApp(firebaseConfig);
