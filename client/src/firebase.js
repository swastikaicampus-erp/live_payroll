import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2LYyKFrQc53BCssYOvLB8uXkVmXcLx24",
  authDomain: "digital-screen-b6fd3.firebaseapp.com",
  projectId: "digital-screen-b6fd3",
  storageBucket: "digital-screen-b6fd3.firebasestorage.app",
  messagingSenderId: "996077896536",
  appId: "1:996077896536:web:593b34c56d292852e99b2d",
  measurementId: "G-8HY657D4BD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);