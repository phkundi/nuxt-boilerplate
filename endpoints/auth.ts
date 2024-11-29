import type { Endpoint } from "./types";

export const authEndpoints: Record<string, Endpoint> = {
  register: {
    url: "users/register/",
    requireAuth: false,
  },
  getUser: {
    url: "users/me/",
    requireAuth: true,
  },
  login: {
    url: "users/token/",
    requireAuth: false,
  },
  refreshToken: {
    url: "users/token/refresh/",
    requireAuth: false,
  },
  forgotPassword: {
    url: "users/forgot-password/",
    requireAuth: false,
  },
  resetPassword: {
    url: "users/reset-password/<user_id>/<token>/",
    requireAuth: false,
  },
};
