importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyB2Tk7wEM_XgNY_tqXqtZClpgNr4rk_Fz8",
  authDomain: "zalihe-krvi.firebaseapp.com",
  projectId: "zalihe-krvi",
  storageBucket: "zalihe-krvi.firebasestorage.app",
  messagingSenderId: "1050380975409",
  appId: "1:1050380975409:web:59b2f2089821b94ff54410",
  measurementId: "G-Z3CCKNPS7N"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(firebaseApp);

messaging.onBackgroundMessage((payload) => {
  console.log('Message received in background. ', payload);

  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
