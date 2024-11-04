import { useCookie, type CookieRef } from "#app";

// Define cookie options type
interface CookieOptions {
  maxAge: number;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
}

// Define cookie options
const cookieOptions: CookieOptions = {
  maxAge: 60 * 60 * 24 * 14, // 2 weeks
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export const useAuthCookies = () => {
  const accessToken: CookieRef<string | null> = useCookie("access_token", {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7, // 1 week for access token
  });

  const refreshToken: CookieRef<string | null> = useCookie(
    "refresh_token",
    cookieOptions
  );

  return {
    accessToken,
    refreshToken,
  };
};
