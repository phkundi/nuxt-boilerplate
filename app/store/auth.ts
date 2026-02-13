/**
 * Auth Store (Pinia)
 *
 * Manages authentication state. Delegates auth workflows to the auth service.
 * Does NOT implement HTTP primitives - those are in the transport layer.
 */

import { defineStore } from "pinia";
import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordCredentials,
  User,
  OAuthProvider,
} from "~/types/auth";
import * as authService from "~/services/auth.service";
import { debug } from "~/utils/debug";

interface AuthStoreState extends AuthState {
  _refreshInterval: NodeJS.Timeout | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthStoreState => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    _refreshInterval: null,
  }),

  actions: {
    /**
     * Initialize authentication on app startup.
     * Tries to restore a session from existing tokens.
     */
    async initializeAuth(): Promise<void> {
      try {
        // Initialize the auth service (sets up token refresh for HTTP client)
        authService.initializeAuthService();

        // Try to restore session from existing tokens
        const user = await authService.tryRestoreSession();

        if (user) {
          this.user = user;
          this.isAuthenticated = true;
          this.startTokenRefreshInterval();
          debug.log("[authStore.initializeAuth] Session restored");
        } else {
          this.user = null;
          this.isAuthenticated = false;
          debug.log("[authStore.initializeAuth] No session to restore");
        }
      } catch (error) {
        debug.error("[authStore.initializeAuth] Error:", error);
        this.user = null;
        this.isAuthenticated = false;
      } finally {
        this.isInitialized = true;
      }
    },

    /**
     * Register a new user and automatically log them in
     */
    async register(
      credentials: RegisterCredentials,
      inviterId?: string,
    ): Promise<User> {
      try {
        const user = await authService.registerAndLogin(credentials, inviterId);

        this.user = user;
        this.isAuthenticated = true;
        this.startTokenRefreshInterval();

        return user;
      } catch (error) {
        debug.error("[authStore.register] Error:", error);
        throw error;
      }
    },

    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<User> {
      try {
        const user = await authService.login(credentials);

        this.user = user;
        this.isAuthenticated = true;
        this.startTokenRefreshInterval();

        return user;
      } catch (error) {
        debug.error("[authStore.login] Error:", error);
        throw error;
      }
    },

    /**
     * Login with OAuth provider (Google or Apple)
     */
    async loginWithOAuth(provider: OAuthProvider): Promise<User> {
      try {
        const user = await authService.loginWithOAuth(provider);

        this.user = user;
        this.isAuthenticated = true;
        this.startTokenRefreshInterval();

        return user;
      } catch (error) {
        debug.error("[authStore.loginWithOAuth] Error:", error);
        throw error;
      }
    },

    /**
     * Logout the current user
     */
    logout(): void {
      authService.logout();

      this.user = null;
      this.isAuthenticated = false;

      // Clear the refresh interval
      if (this._refreshInterval) {
        clearInterval(this._refreshInterval);
        this._refreshInterval = null;
      }
    },

    /**
     * Request password reset email
     */
    async forgotPassword(email: string): Promise<void> {
      try {
        await authService.forgotPassword(email);
      } catch (error) {
        debug.error("[authStore.forgotPassword] Error:", error);
        throw error;
      }
    },

    /**
     * Reset password with token
     */
    async resetPassword(
      credentials: ResetPasswordCredentials,
      userId: string,
      token: string,
    ): Promise<void> {
      try {
        await authService.resetPassword(credentials, userId, token);
      } catch (error) {
        debug.error("[authStore.resetPassword] Error:", error);
        throw error;
      }
    },

    /**
     * Fetch the current user's data
     */
    async fetchUser(): Promise<User> {
      try {
        const user = await authService.fetchCurrentUser();

        this.user = user;
        this.isAuthenticated = true;

        return user;
      } catch (error) {
        debug.error("[authStore.fetchUser] Error:", error);
        throw error;
      }
    },

    /**
     * Start the token refresh interval
     * Checks every 5 minutes and refreshes if token is expiring soon
     */
    startTokenRefreshInterval(): void {
      // Clear any existing interval
      if (this._refreshInterval) {
        clearInterval(this._refreshInterval);
      }

      // Set new interval
      this._refreshInterval = setInterval(
        async () => {
          if (this.isAuthenticated) {
            try {
              await authService.ensureValidToken();
            } catch (error) {
              debug.error(
                "[authStore.startTokenRefreshInterval] Refresh failed:",
                error,
              );
            }
          }
        },
        5 * 60 * 1000, // 5 minutes
      );
    },
  },
});
