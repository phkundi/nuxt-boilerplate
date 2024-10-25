// Initialize firebase for cloud messaging service (push notifications)

// import { initializeApp, getApps } from "firebase/app";
// import firebaseConfig from "~/constants/firebase";
// import { getMessaging, onMessage } from "firebase/messaging";

// export default defineNuxtPlugin(() => {
//   const app =
//     getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

//   const messaging = getMessaging(app);

//   console.log("Initialized firebase");

//   // Runs whenever a message is received while the app is open (foreground)
//   onMessage(messaging, (payload) => {
//     alert(JSON.stringify(payload), null, 2);
//     console.log("Message received. ", payload);
//   });

//   return {
//     provide: {
//       messaging,
//     },
//   };
// });
