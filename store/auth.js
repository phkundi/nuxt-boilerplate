import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { getEndpoint } from "~/endpoints/endpoints";
import { useAuthCookies } from "~/composables/useAuthCookies";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
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
    async register(credentials, inviterId) {
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
          // Handle validation errors specifically
          if (typeof data === "object" && data !== null) {
            const errors = Object.values(data);
            if (errors.length > 0 && errors[0].length > 0) {
              // Extract the first error message from the first property with an error
              throw new Error(errors[0][0]);
            }
          }

          // Fallback error message if the structure wasn't as expected
          throw new Error("Registration failed due to an unexpected error.");

          // Optionally, auto-login after successful registration
          // await this.login(credentials);
        }
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    async login(credentials) {
      try {
        const url = getEndpoint({ path: "auth.login" });
        const response = await $fetch(url, {
          method: "POST",
          body: JSON.stringify(credentials),
        });

        const { accessToken, refreshToken } = useAuthCookies();

        // Store tokens in cookies
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

      // Clear cookies
      accessToken.value = null;
      refreshToken.value = null;
      this.user = null;
      this.isAuthenticated = false;
    },

    async fetchUser() {
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
    async retrieveValidToken() {
      const { accessToken, refreshToken } = useAuthCookies();

      if (!accessToken.value) {
        console.log("No access token found");
        return null;
      }

      const user = jwtDecode(accessToken.value);
      const isExpired = dayjs.unix(user.exp).diff(dayjs(), "minute") < 1;

      // Check if token is still valid
      if (isExpired) {
        // Token has expired
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
    async refreshToken() {
      const { refreshToken } = useAuthCookies();
      if (!refreshToken.value) return null;

      try {
        const url = getEndpoint({ path: "auth.refreshToken" });
        const response = await $fetch(url, {
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
    async authedRequest(url, originalConfig = {}) {
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
      config.headers["Authorization"] = `Bearer ${accessToken}`;

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
    async makeRequest(method, url, data = {}, config = {}) {
      config.method = method;
      if (data && Object.keys(data).length > 0) {
        config.data = data;
      }
      return await this.authedRequest(url, config);
    },
    async authedPost(url, data, config = {}) {
      return this.makeRequest("POST", url, JSON.stringify(data), config);
    },
    async authedPut(url, data, config = {}) {
      return this.makeRequest("PUT", url, JSON.stringify(data), config);
    },
    async authedGet(url, config = {}) {
      return this.makeRequest("GET", url, null, config);
    },
    async authedDelete(url, config = {}) {
      return this.makeRequest("DELETE", url, null, config);
    },
  },
});
