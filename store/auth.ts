import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { useAuthCookies } from "~/composables/useAuthCookies";
import {
  type AuthState,
  type LoginCredentials,
  type RegisterCredentials,
  type ResetPasswordCredentials,
  type User,
  type TokenResponse,
} from "~/types/auth";
import {
  registerUser as registerUserApi,
  loginUser as loginUserApi,
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi,
  getAuthenticatedUser as getAuthenticatedUserApi,
  refreshToken as refreshTokenApi,
} from "~/api/auth-api";
import { debug } from "~/helpers/debug";

interface JWTPayload {
  exp: number;
  iat?: number;
  sub?: string;
  // Add other JWT claims you might use
}

interface ExtendedRequestInit extends RequestInit {
  data?: any;
}

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
    async initializeAuth() {
      try {
        // Get the access and refresh tokens from the cookies
        const { getAccessToken, getRefreshToken } = useAuthCookies();
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        const authenticateUser = async () => {
          await this.fetchUser();
          await this.startTokenRefreshInterval();
          this.isAuthenticated = true;
          this.isInitialized = true;
        };

        const tryRefreshToken = async () => {
          if (!refreshToken) return false;
          debug.log("[initializeAuth] Attempting to refresh token");
          const newTokens = await this.refreshToken();
          if (newTokens) {
            await authenticateUser();
            return true;
          }
          return false;
        };

        if (accessToken) {
          const decodedToken = jwtDecode<JWTPayload>(accessToken);
          const isExpired = dayjs
            .unix(decodedToken.exp)
            .subtract(5, "minute")
            .isBefore(dayjs());

          if (isExpired) {
            debug.log("[initializeAuth] Token is expired");
            if (await tryRefreshToken()) return;
          } else {
            debug.log(
              "[initializeAuth] Token appears valid, attempting to use it"
            );
            try {
              await authenticateUser();
              return;
            } catch (error) {
              debug.log(
                "[initializeAuth] Token validation failed, attempting refresh"
              );
              if (await tryRefreshToken()) return;
            }
          }
        } else if (refreshToken) {
          debug.log(
            "[initializeAuth] No access token but refresh token exists"
          );
          if (await tryRefreshToken()) return;
        }

        this.logout();
        this.isAuthenticated = false;
        this.isInitialized = true;
      } catch (error) {
        debug.error("[initializeAuth] Auth initialization error:", error);
        this.logout();
        this.isAuthenticated = false;
        this.isInitialized = true;
      }
    },
    async register(
      credentials: RegisterCredentials,
      inviterId?: string
    ): Promise<User> {
      try {
        // Make the API call to register the user
        await registerUserApi(credentials, inviterId);

        // Login the user automatically after registration
        const userData = await this.login({
          email: credentials.email,
          password: credentials.password,
        });
        // Return the user data
        return userData;
      } catch (error) {
        debug.error("[register] Registration error:", error);
        throw error;
      }
    },
    async login(credentials: LoginCredentials): Promise<User> {
      try {
        // Make the API call to login the user
        const response = await loginUserApi(credentials);

        // Set the access and refresh tokens in the cookies
        const { setAccessToken, setRefreshToken } = useAuthCookies();
        setAccessToken(response.access);
        setRefreshToken(response.refresh);

        // Set the user as authenticated
        this.isAuthenticated = true;

        // Add a small delay to ensure cookies are set - otherwise fetchUser might fail
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Fetch the user data
        const userData = await this.fetchUser();
        return userData;
      } catch (error) {
        debug.error("[login] Login error:", error);
        throw error;
      }
    },
    logout() {
      // Clear the access and refresh tokens from the cookies
      const { setAccessToken, setRefreshToken } = useAuthCookies();
      setAccessToken(null);
      setRefreshToken(null);

      // Set the user as not authenticated
      this.user = null;
      this.isAuthenticated = false;

      // Clear the refresh interval
      if (this._refreshInterval) {
        clearInterval(this._refreshInterval);
        this._refreshInterval = null;
      }
    },
    async forgotPassword(email: string) {
      try {
        await forgotPasswordApi(email);
      } catch (error) {
        debug.error("[forgotPassword] Forgot password error:", error);
        throw error;
      }
    },
    async resetPassword(
      credentials: ResetPasswordCredentials,
      user_id: string,
      token: string
    ) {
      try {
        const response = await resetPasswordApi(credentials, user_id, token);
        return response;
      } catch (error) {
        debug.error("[resetPassword] Reset password error:", error);
        throw error;
      }
    },
    async fetchUser(): Promise<User> {
      try {
        // Make the API call to get the authenticated user
        const data = await getAuthenticatedUserApi();

        // Set the user and authenticated state
        this.user = data;
        this.isAuthenticated = true;

        return data;
      } catch (error) {
        debug.error("[fetchUser] Fetch user error:", error);
        throw error;
      }
    },
    async startTokenRefreshInterval() {
      // Clear any existing interval
      if (this._refreshInterval) {
        clearInterval(this._refreshInterval);
      }

      // Set new interval to automatically refresh the token - check every 5 minutes
      this._refreshInterval = setInterval(async () => {
        if (this.isAuthenticated) {
          try {
            await this.retrieveValidToken();
          } catch (error) {
            debug.error(
              "[startTokenRefreshInterval] Token refresh failed:",
              error
            );
          }
        }
      }, 5 * 60 * 1000); // 5 minutes
    },
    async retrieveValidToken(): Promise<string | null> {
      const {
        getAccessToken,
        getRefreshToken,
        setAccessToken,
        setRefreshToken,
      } = useAuthCookies();

      const token = getAccessToken();

      if (!token) {
        const refreshToken = getRefreshToken();

        if (refreshToken) {
          try {
            const newTokens = await this.refreshToken();
            if (newTokens) {
              setAccessToken(newTokens.access);
              setRefreshToken(newTokens.refresh);
              return newTokens.access;
            }
          } catch (err) {
            debug.error("[retrieveValidToken] Error refreshing token:", err);
          }
        }
        return null;
      }

      const user = jwtDecode<JWTPayload>(token);
      const isExpiringSoon = dayjs.unix(user.exp).diff(dayjs(), "minute") < 5;

      if (isExpiringSoon) {
        try {
          const newTokens = await this.refreshToken();
          if (newTokens) {
            setAccessToken(newTokens.access);
            setRefreshToken(newTokens.refresh);
            return newTokens.access;
          }
        } catch (err) {
          debug.error("[retrieveValidToken] Error refreshing token:", err);
        }
      }

      return token;
    },
    async refreshToken(): Promise<TokenResponse | null> {
      const { getRefreshToken, setRefreshToken } = useAuthCookies();
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        debug.log("[refreshToken] No refresh token found");
        return null;
      }

      try {
        const response = await refreshTokenApi(refreshToken);
        setRefreshToken(response.refresh);
        return response;
      } catch (error) {
        debug.error("[refreshToken] Failed to refresh token:", error);
        this.logout();
        return null;
      }
    },

    async authedRequest(
      url: string,
      originalConfig: ExtendedRequestInit = {}
    ): Promise<Response> {
      const config = { ...originalConfig };
      const accessToken = await this.retrieveValidToken();

      if (!accessToken) {
        debug.log("[authedRequest] No auth token found");
        this.logout();
        return Promise.reject("No auth token found");
      }

      if (!config.headers) {
        config.headers = {};
      }
      (config.headers as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      if (config.data) {
        config.body = config.data;
        delete config.data;
      }

      try {
        return await fetch(url, config);
      } catch (error) {
        debug.error(
          "[authedRequest] Failed to make authenticated request:",
          error
        );
        return Promise.reject(error);
      }
    },

    async makeRequest(
      method: string,
      url: string,
      data: any = {},
      config: ExtendedRequestInit = {}
    ): Promise<Response> {
      config.method = method;
      if (data && Object.keys(data).length > 0) {
        config.data = data;
      }
      return await this.authedRequest(url, config);
    },

    async authedPost(url: string, data: any, config: ExtendedRequestInit = {}) {
      return this.makeRequest("POST", url, data, config);
    },

    async authedPut(url: string, data: any, config: ExtendedRequestInit = {}) {
      return this.makeRequest("PUT", url, data, config);
    },

    async authedPatch(
      url: string,
      data: any,
      config: ExtendedRequestInit = {}
    ) {
      return this.makeRequest("PATCH", url, data, config);
    },

    async authedGet(url: string, config: ExtendedRequestInit = {}) {
      return this.makeRequest("GET", url, null, config);
    },

    async authedDelete(url: string, config: ExtendedRequestInit = {}) {
      return this.makeRequest("DELETE", url, null, config);
    },
  },
});
