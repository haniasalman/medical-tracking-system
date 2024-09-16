import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken } from 'firebase/messaging';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCPu4U-VNOv9MZtHrtsi9LGB4p15dxO3WA",
  authDomain: "medical-tracking-system.firebaseapp.com",
  projectId: "medical-tracking-system",
  storageBucket: "medical-tracking-system.appspot.com",
  messagingSenderId: "511559457928",
  appId: "1:511559457928:web:058ab58c5586e81a02533d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

// Register Service Worker
navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/firebase-messaging-sw.js`)
  .then((registration) => {
    console.log('Service Worker registered:', registration);
    messaging.useServiceWorker(registration);
  })
  .catch((err) => {
    console.error('Service Worker registration failed:', err);
  });

// Request permission for push notifications
const requestPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BNRWb_6kG3YRV4VNTCnlk9BELy9aNL-r18jHGbmpsMwVzr2pv-Bz9OyehnEgpD91OxQjcJ6IhHCsLYJS6IzmKhU"
    });
    if (token) {
      console.log('FCM Token:', token);
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

requestPermission();

export { db, messaging };
