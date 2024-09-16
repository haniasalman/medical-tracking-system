// Import the latest Firebase libraries
importScripts('https://www.gstatic.com/firebasejs/9.19.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.19.1/firebase-messaging-compat.js');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCPu4U-VNOv9MZtHrtsi9LGB4p15dxO3WA",
  authDomain: "medical-tracking-system.firebaseapp.com",
  projectId: "medical-tracking-system",
  storageBucket: "medical-tracking-system.appspot.com",
  messagingSenderId: "511559457928",
  appId: "1:511559457928:web:058ab58c5586e81a02533d"
};

// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// // Retrieve Firebase Messaging instance
// const messaging = firebase.messaging();

// // Handle background messages
// messaging.onBackgroundMessage(function(payload) {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/firebase-logo.png' // Customize this path to your icon if needed
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});