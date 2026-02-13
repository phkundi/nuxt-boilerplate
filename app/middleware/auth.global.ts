/**
 * Global Authentication Middleware
 *
 * Ensures that:
 * 1. Auth state is initialized on the first request.
 * 2. Unauthenticated users are redirected to /login for protected routes.
 * 3. Authenticated users are redirected to / when accessing auth routes (login/register).
 */

import { debug } from "~/utils/debug";

export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client-side or if you want to handle SSR auth
  // For this implementation, we'll focus on client-side auth first
  if (import.meta.server) return;

  const authStore = useAuthStore();

  // 1. Initialize auth if not already done
  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const isAuthPage = to.path === "/login" || to.path === "/register";

  // 2. Redirect unauthenticated users away from protected pages
  // We consider a page protected if it's not explicitly public and not an auth page
  const isPublicPage = to.meta.public === true || isAuthPage;

  if (!isAuthenticated && !isPublicPage) {
    debug.log(
      `[auth.global] Redirecting unauthenticated user to /login from ${to.path}`,
    );
    return navigateTo("/login");
  }

  // 3. Redirect authenticated users away from auth pages (login/register)
  if (isAuthenticated && isAuthPage) {
    debug.log(
      `[auth.global] Redirecting authenticated user to / from ${to.path}`,
    );
    return navigateTo("/");
  }
});
