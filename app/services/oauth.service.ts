/**
 * OAuth Service
 *
 * Handles OAuth flows for Google and Apple Sign-In.
 * Uses popup-based flows to get ID tokens that are sent to the backend.
 */

import type { OAuthProvider } from "~/types/auth";

// Google Identity Services types
interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
  clientId?: string;
}

interface GoogleAccounts {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
    }) => void;
    prompt: (
      momentListener?: (notification: {
        isNotDisplayed: () => boolean;
      }) => void,
    ) => void;
    renderButton: (
      parent: HTMLElement,
      options: {
        theme?: "outline" | "filled_blue" | "filled_black";
        size?: "large" | "medium" | "small";
        type?: "standard" | "icon";
        shape?: "rectangular" | "pill" | "circle" | "square";
        text?: "signin_with" | "signup_with" | "continue_with" | "signin";
        logo_alignment?: "left" | "center";
        width?: number;
        locale?: string;
      },
    ) => void;
    disableAutoSelect: () => void;
    storeCredential: (credential: { id: string; password: string }) => void;
    cancel: () => void;
    revoke: (hint: string, callback: () => void) => void;
  };
}

// Apple Sign In types
interface AppleIDSignInResponse {
  authorization: {
    code: string;
    id_token: string;
    state?: string;
  };
  user?: {
    email?: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

interface AppleIDAuth {
  init: (config: {
    clientId: string;
    scope: string;
    redirectURI: string;
    state?: string;
    nonce?: string;
    usePopup: boolean;
  }) => void;
  signIn: () => Promise<AppleIDSignInResponse>;
}

declare global {
  interface Window {
    google?: GoogleAccounts;
    AppleID?: {
      auth: AppleIDAuth;
    };
  }
}

let googleScriptLoaded = false;
let appleScriptLoaded = false;

/**
 * Load Google Identity Services script
 */
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (googleScriptLoaded && window.google) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });
}

/**
 * Load Apple Sign In script
 */
function loadAppleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (appleScriptLoaded && window.AppleID) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      appleScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Apple Sign-In"));
    document.head.appendChild(script);
  });
}

/**
 * Sign in with Google and get ID token
 */
export async function signInWithGoogle(): Promise<string> {
  const config = useRuntimeConfig();
  const clientId = config.public.googleOAuthClientId as string;

  if (!clientId) {
    throw new Error("Google OAuth client ID not configured");
  }

  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error("Google Sign-In not loaded"));
      return;
    }

    // Create a hidden container for the button
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    window.google.id.initialize({
      client_id: clientId,
      callback: (response: GoogleCredentialResponse) => {
        document.body.removeChild(container);
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error("No credential received from Google"));
        }
      },
      cancel_on_tap_outside: false,
    });

    // Render a hidden button and click it, or use prompt
    window.google.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        document.body.removeChild(container);
        // Fallback: Try rendering button approach
        reject(
          new Error(
            "Google Sign-In popup was blocked. Please allow popups for this site.",
          ),
        );
      }
    });
  });
}

/**
 * Sign in with Apple and get identity token
 */
export async function signInWithApple(): Promise<{
  identityToken: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}> {
  const config = useRuntimeConfig();
  const clientId = config.public.appleClientId as string;

  if (!clientId) {
    throw new Error("Apple client ID not configured");
  }

  await loadAppleScript();

  if (!window.AppleID) {
    throw new Error("Apple Sign-In not loaded");
  }

  // Get the current URL for redirect
  const redirectURI = `${window.location.origin}/login`;

  window.AppleID.auth.init({
    clientId,
    scope: "name email",
    redirectURI,
    usePopup: true,
  });

  const response = await window.AppleID.auth.signIn();

  return {
    identityToken: response.authorization.id_token,
    firstName: response.user?.name?.firstName,
    lastName: response.user?.name?.lastName,
    email: response.user?.email,
  };
}

/**
 * Generic sign in with OAuth provider
 */
export async function signInWithProvider(provider: OAuthProvider): Promise<{
  provider: OAuthProvider;
  token: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}> {
  switch (provider) {
    case "google": {
      const token = await signInWithGoogle();
      return { provider, token };
    }
    case "apple": {
      const result = await signInWithApple();
      return {
        provider,
        token: result.identityToken,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
      };
    }
    default:
      throw new Error(`Unknown OAuth provider: ${provider}`);
  }
}
