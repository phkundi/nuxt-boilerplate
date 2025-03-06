export const authEndpoints: Record<string, string> = {
  register: "users/register/",
  getUser: "users/me/",
  login: "users/token/",
  refreshToken: "users/token/refresh/",
  forgotPassword: "users/forgot-password/",
  resetPassword: "users/reset-password/<user_id>/<token>/",
};
