import { useCookie } from "#app";

// Define cookie options
const cookieOptions = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export const useAuthCookies = () => {
  const accessToken = useCookie("access_token", {
    ...cookieOptions,
    maxAge: 60 * 60, // 1 hour for access token
  });

  const refreshToken = useCookie("refresh_token", cookieOptions);

  return {
    accessToken,
    refreshToken,
  };
};
