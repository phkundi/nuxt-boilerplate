// Uncomment to enable background notifications

// import { initializeApp } from "firebase/app";
// import { onBackgroundMessage, getMessaging } from "firebase/messaging/sw";
// import firebaseConfig from "~/constants/firebase";

// let messaging;

// self.addEventListener("activate", async () => {
//   try {
//     if (!messaging) {
//       const firebaseApp = initializeApp(firebaseConfig);
//       messaging = getMessaging(firebaseApp);

//       console.log("Firebase messaging initialized in SW");

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
// });
