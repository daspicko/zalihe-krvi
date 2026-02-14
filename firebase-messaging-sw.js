importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB2Tk7wEM_XgNY_tqXqtZClpgNr4rk_Fz8",
  authDomain: "zalihe-krvi.firebaseapp.com",
  projectId: "zalihe-krvi",
  storageBucket: "zalihe-krvi.firebasestorage.app",
  messagingSenderId: "1050380975409",
  appId: "1:1050380975409:web:59b2f2089821b94ff54410",
  measurementId: "G-Z3CCKNPS7N"
};

const firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
const messaging = firebase.messaging(firebaseApp);
