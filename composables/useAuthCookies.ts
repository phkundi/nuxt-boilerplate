import { useCookie } from "#app";

// Define cookie options type
interface CookieOptions {
  maxAge: number;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  httpOnly?: boolean;
}

// Cookie durations (in seconds)
const DURATIONS = {
  ACCESS: 60 * 30, // 30 minutes (match backend)
  REFRESH: 60 * 60 * 24 * 14, // 14 days
};

// Base cookie options
const cookieOptions: Omit<CookieOptions, "maxAge"> = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  // httpOnly: true, // Enable if your cookies should not be accessible via JavaScript
};

export const useAuthCookies = () => {
  const getTokenCookie = (name: string, duration: number) => {
    const cookie = useCookie<string | null>(name, {
      ...cookieOptions,
      maxAge: duration,
    });

    return cookie;
  };

  const setToken = (name: string, value: string | null) => {
    const duration =
      name === "access_token" ? DURATIONS.ACCESS : DURATIONS.REFRESH;

    const cookie = getTokenCookie(name, duration);
    cookie.value = value;
  };

  return {
    setAccessToken: (token: string | null) => setToken("access_token", token),
    setRefreshToken: (token: string | null) => setToken("refresh_token", token),
    getAccessToken: () =>
      getTokenCookie("access_token", DURATIONS.ACCESS).value,
    getRefreshToken: () =>
      getTokenCookie("refresh_token", DURATIONS.REFRESH).value,
  };
};
