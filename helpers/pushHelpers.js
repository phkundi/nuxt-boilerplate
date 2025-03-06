import { useRuntimeConfig } from "#app";
import { isSupported } from "firebase/messaging";

let getToken;

export const isIOSApp = () => {
  return window.webkit?.messageHandlers?.pushNotifications;
};

export const getIOSPermission = async () => {
  // Verify iOS bridge exists
  if (!isIOSApp()) {
    console.error("iOS push notifications bridge not found");
    return { askPermission: false, granted: false };
  }

  const permissionState = await new Promise((resolve, reject) => {
    // Add timeout to catch hanging promises
    const timeoutId = setTimeout(() => {
      console.error("Permission state request timed out");
      reject(new Error("Permission request timed out"));
    }, 5000);

    const listener = (event) => {
      clearTimeout(timeoutId);
      window.removeEventListener("push-permission-state", listener);
      resolve(event.detail);
    };
    window.addEventListener("push-permission-state", listener);

    try {
      window.webkit.messageHandlers.pushNotifications.postMessage({
        action: "getPermissionState",
      });
    } catch (error) {
      console.error("Error sending message to native:", error);
      clearTimeout(timeoutId);
      reject(error);
    }
  }).catch((error) => {
    console.error("Error getting permission state:", error);
    return "error";
  });

  if (permissionState === "error") {
    return { askPermission: false, granted: false };
  }

  // iOS states from PushNotifications.swift:
  // "notDetermined", "denied", "authorized", "ephemeral", "provisional"

  if (permissionState === "notDetermined") {
    return { askPermission: true, granted: false };
  }

  if (permissionState === "authorized" || permissionState === "provisional") {
    return { askPermission: false, granted: true };
  }

  return { askPermission: false, granted: false };
};

export const initializeNotifications = async () => {
  if (!import.meta.client) return; // Skip on server-side

  try {
    let iosPermissionState = { askPermission: false, granted: false };

    if (isIOSApp()) {
      // Skip Firebase support check for iOS native app
      iosPermissionState = await getIOSPermission();
      if (iosPermissionState.askPermission) {
        return { askPermission: true };
      }
    } else {
      // Only check Firebase support for web/PWA
      const supported = await isSupported();
      if (!supported) {
        console.warn("Firebase Messaging is not supported in this browser.");
        return;
      }

      const { getToken: importedGetToken } = await import("firebase/messaging");
      getToken = importedGetToken;
    }

    // Now we can safely check serviceWorker
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.ready; // Wait for SW to be ready

      if (Notification.permission === "default") {
        return { askPermission: true };
      } else if (
        Notification.permission === "granted" ||
        iosPermissionState.granted
      ) {
        await requestNotificationPermission();
      }
    }
  } catch (error) {
    // Handle errors or user denial
    console.error("Push notification error:", error);
  }
};

// /**
//  * Request permission for notifications and get FCM token
//  */
export const requestNotificationPermission = async () => {
  try {
    const vapidKey = useRuntimeConfig().public.validKey;
    let token;

    if (isIOSApp()) {
      const iosPermissionState = await getIOSPermission();

      if (!iosPermissionState.granted && !iosPermissionState.askPermission) {
        throw new Error("Permission denied");
      }

      // If permission granted, request token
      token = await new Promise((resolve, reject) => {
        window.addEventListener("push-token", (event) => {
          resolve(event.detail);
        });
        window.addEventListener("push-token-error", (event) => {
          console.error("Received push-token-error event:", event.detail);
          reject(new Error(event.detail));
        });

        window.webkit.messageHandlers.pushNotifications.postMessage({
          action: "requestToken",
        });
      });
    } else {
      // Browser flow
      const { $messaging } = useNuxtApp();
      const messaging = $messaging();

      if (!messaging) {
        console.warn("Messaging service not yet initialized");
        return null;
      }

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });
      } else {
        throw new Error("Unable to get permission to notify.");
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Token:", token);
    }

    await savePushSubscription(token);

    return token;
  } catch (error) {
    console.error("An error occurred while retrieving token.", error);
    throw error;
  }
};

// /*
//  * Save push subscription to backend
//  */
export const savePushSubscription = async (token) => {
  const apiBase = useRuntimeConfig().public.apiUrl;
  const authStore = useAuthStore();
  const { authedPost } = authStore;

  try {
    await authedPost(
      `${apiBase}users/push-subscriptions/`,
      {
        fcm_token: token,
      },
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("An error occurred while saving push subscription.", error);
    throw error;
  }
};
