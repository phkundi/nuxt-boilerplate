import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { getEndpoint } from "~/endpoints/endpoints";
import { useAuthCookies } from "~/composables/useAuthCookies";
import {
  type AuthState,
  type LoginCredentials,
  type RegisterCredentials,
  type User,
} from "~/types/auth";

interface TokenResponse {
  access: string;
  refresh: string;
}

interface JWTPayload {
  exp: number;
  // Add other JWT claims you might use
  iat?: number;
  sub?: string;
  user_id: number | string;
}

interface ExtendedRequestInit extends RequestInit {
  data?: any;
}

interface ApiErrorResponse {
  [key: string]: string[]; // Each field can have multiple error messages
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
  }),

  actions: {
    async initializeAuth() {
      try {
        const token = await this.retrieveValidToken();
        if (token) {
          await this.fetchUser();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        this.logout();
      } finally {
        this.isInitialized = true;
      }
    },

    async register(credentials: RegisterCredentials, inviterId?: string) {
      try {
        const url = getEndpoint({ path: "auth.register" });

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credentials, inviterId }),
        });
        const data = await response.json();

        if (response.status !== 201) {
          if (typeof data === "object" && data !== null) {
            const errors = Object.values(data as ApiErrorResponse);
            if (errors.length > 0 && errors[0].length > 0) {
              throw new Error(errors[0][0]);
            }
          }
          throw new Error("Registration failed due to an unexpected error.");
        }
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },

    async login(credentials: LoginCredentials) {
      try {
        const url = getEndpoint({ path: "auth.login" });
        const response = await $fetch<TokenResponse>(url, {
          method: "POST",
          body: JSON.stringify(credentials),
        });

        const { accessToken, refreshToken } = useAuthCookies();

        accessToken.value = response.access;
        refreshToken.value = response.refresh;

        this.isAuthenticated = true;

        await this.fetchUser();
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },

    logout() {
      const { accessToken, refreshToken } = useAuthCookies();
      accessToken.value = null;
      refreshToken.value = null;
      this.user = null;
      this.isAuthenticated = false;
    },

    async fetchUser(): Promise<User | false> {
      try {
        const url = getEndpoint({ path: "auth.getUser" });
        const response = await this.authedGet(url);
        const data = await response.json();

        this.user = data;
        this.isAuthenticated = true;
        return data;
      } catch (error) {
        console.error("Fetch user error:", error);
        return false;
      }
    },

    async retrieveValidToken(): Promise<string | null> {
      const { accessToken, refreshToken } = useAuthCookies();

      if (!accessToken.value) {
        console.log("No access token found");
        return null;
      }

      const user = jwtDecode<JWTPayload>(accessToken.value);
      const isExpired = dayjs.unix(user.exp).diff(dayjs(), "minute") < 1;

      if (isExpired) {
        try {
          const newTokens = await this.refreshToken();
          if (newTokens) {
            accessToken.value = newTokens.access;
            refreshToken.value = newTokens.refresh;
            return newTokens.access;
          }
        } catch (err) {
          console.error("Error refreshing token", err);
          return null;
        }
      }

      return accessToken.value;
    },

    async refreshToken(): Promise<TokenResponse | null> {
      const { refreshToken } = useAuthCookies();
      if (!refreshToken.value) return null;

      try {
        const url = getEndpoint({ path: "auth.refreshToken" });
        const response = await $fetch<TokenResponse>(url, {
          method: "POST",
          body: JSON.stringify({ refresh: refreshToken.value }),
        });
        return response;
      } catch (error) {
        console.error("Failed to refresh token:", error);
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
        console.log("No auth token found");
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
        console.error("Failed to make authenticated request:", error);
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
      return this.makeRequest("POST", url, JSON.stringify(data), config);
    },

    async authedPut(url: string, data: any, config: ExtendedRequestInit = {}) {
      return this.makeRequest("PUT", url, JSON.stringify(data), config);
    },

    async authedGet(url: string, config: ExtendedRequestInit = {}) {
      return this.makeRequest("GET", url, null, config);
    },

    async authedDelete(url: string, config: ExtendedRequestInit = {}) {
      return this.makeRequest("DELETE", url, null, config);
    },
  },
});
