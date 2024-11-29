import { useCookie } from "#app";

// Define cookie options type
interface CookieOptions {
  maxAge: number;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
}

// Cookie durations (in seconds)
const DURATIONS = {
  SHORT: {
    ACCESS: 60 * 15, // 15 minutes
    REFRESH: 60 * 60 * 24, // 1 day
  },
  LONG: {
    ACCESS: 60 * 15, // 15 minutes
    REFRESH: 60 * 60 * 24 * 14, // 14 days
  },
};

// Base cookie options
const cookieOptions: Omit<CookieOptions, "maxAge"> = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export const useAuthCookies = () => {
  const getTokenCookie = (name: string, duration: number) =>
    useCookie<string | null>(name, {
      ...cookieOptions,
      maxAge: duration,
    });

  const setToken = (
    name: string,
    value: string | null,
    remember: boolean = false
  ) => {
    const duration = remember
      ? name === "access_token"
        ? DURATIONS.LONG.ACCESS
        : DURATIONS.LONG.REFRESH
      : name === "access_token"
      ? DURATIONS.SHORT.ACCESS
      : DURATIONS.SHORT.REFRESH;

    const cookie = getTokenCookie(name, duration);
    cookie.value = value;
  };

  return {
    setAccessToken: (token: string | null, remember: boolean = false) =>
      setToken("access_token", token, remember),

    setRefreshToken: (token: string | null, remember: boolean = false) =>
      setToken("refresh_token", token, remember),

    getAccessToken: () =>
      getTokenCookie("access_token", DURATIONS.SHORT.ACCESS).value,
    getRefreshToken: () =>
      getTokenCookie("refresh_token", DURATIONS.SHORT.REFRESH).value,
  };
};
