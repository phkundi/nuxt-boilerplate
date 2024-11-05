// Initialize firebase for cloud messaging service (push notifications)

// import { initializeApp, getApps } from "firebase/app";
// import getFirebaseConfig from "~/helpers/getFirebaseConfig";
// import { getMessaging, onMessage } from "firebase/messaging";

// export default defineNuxtPlugin((nuxtApp) => {
//   let messaging = null;

//   nuxtApp.hook("app:mounted", async () => {
//     const config = getFirebaseConfig();
//     const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];

//     if ("serviceWorker" in navigator) {
//       const registration = await navigator.serviceWorker.ready;

//       registration.active?.postMessage({
//         // Pass the config to the service worker
//         type: "FIREBASE_CONFIG",
//         config: config,
//       });
//     }

//     messaging = getMessaging(app);

//     onMessage(messaging, (payload) => {
//       // Runs whenever a message is received while the app is open
//       console.log("Message received. ", payload); //Do something with the message
//     });
//   });

//   return {
//     provide: {
//       messaging: () => messaging,
//     },
//   };
// });
