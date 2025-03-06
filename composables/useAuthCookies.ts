// Define cookie options type
interface CookieOptions {
  maxAge: number;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  expires: Date;
}

// Cookie durations (in seconds)
const DURATIONS = {
  ACCESS: 60 * 60 * 24 * 7, // 7 days
  REFRESH: 60 * 60 * 24 * 30, // 30 days
};

// Base cookie options
const cookieOptions: Omit<CookieOptions, "maxAge"> = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  expires: new Date(Date.now() + DURATIONS.ACCESS * 1000),
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
