importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

import firebaseConfig from './js/config.js';

const firebaseApp = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(firebaseApp);
