export const authEndpoints = {
  register: "users/register/",
  getUser: "users/me/",
  login: "users/token/",
  refreshToken: "users/token/refresh/",
} as const;

export type AuthEndpoints = typeof authEndpoints;
