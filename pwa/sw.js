// Uncomment to enable background notifications

// import { initializeApp } from "firebase/app";
// import { onBackgroundMessage, getMessaging } from "firebase/messaging/sw";

// let messaging;
// let firebaseConfig;

// self.addEventListener("message", (event) => {
//   if (event.data && event.data.type === "FIREBASE_CONFIG") {
//     firebaseConfig = event.data.config;
//     initializeFirebase();
//   }
// });

// // Initialize Firebase only after config is received from the client
// function initializeFirebase() {
//   try {
//     if (!messaging && firebaseConfig) {
//       const firebaseApp = initializeApp(firebaseConfig);
//       messaging = getMessaging(firebaseApp);

//       onBackgroundMessage(messaging, (payload) => {
//         console.log("Received background message ", payload);

//         const notificationTitle = payload.notification.title;
//         const notificationOptions = {
//           body: payload.notification.body,
//           icon: "/favicon.ico",
//           badge: "/favicon.ico",
//           tag: "notification-" + Date.now(),
//           data: payload.data || {},
//           vibrate: [100, 50, 100],
//           requireInteraction: true,
//         };

//         self.registration.showNotification(
//           notificationTitle,
//           notificationOptions
//         );
//       });
//     }
//   } catch (error) {
//     console.error("Firebase initialization error in SW:", error);
//   }
// }
