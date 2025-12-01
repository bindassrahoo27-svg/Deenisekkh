import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Initialize Firebase
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDn6V7p5zfY1P4Y7KXGaTvfZkivuYbhhjg",
  authDomain: "raaz-cf574.firebaseapp.com",
  databaseURL: "https://raaz-cf574-default-rtdb.firebaseio.com",
  projectId: "raaz-cf574",
  storageBucket: "raaz-cf574.firebasestorage.app",
  messagingSenderId: "752137866532",
  appId: "1:752137866532:android:bca4edd1ba14605a3a37b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();