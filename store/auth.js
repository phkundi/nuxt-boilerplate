import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { getEndpoint } from "~/endpoints/endpoints";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    authTokens: null,
  }),
  actions: {
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
        }

        this.login(credentials);
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

        const authTokens = response;

        const user = jwtDecode(authTokens.access);
        this.user = user;
        this.isAuthenticated = true;
        this.authTokens = authTokens;

        localStorage.setItem("authTokens", JSON.stringify(authTokens));
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem("authTokens");
    },
    checkAuth() {
      this.authTokens = JSON.parse(localStorage.getItem("authTokens"));
      if (this.authTokens) {
        this.isAuthenticated = true;
        this.user = jwtDecode(this.authTokens.access);
        return this.user;
      }
      return false;
    },
    async fetchUser() {
      try {
        const url = getEndpoint({ path: "auth.getUser" });
        const response = await this.authedGet(url);

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Fetch user error:", error);
        return false;
      }
    },

    async retrieveValidToken() {
      this.authTokens = JSON.parse(localStorage.getItem("authTokens"));
      if (!this.authTokens) {
        return null;
      }

      const user = jwtDecode(this.authTokens.access);
      const isExpired = dayjs.unix(user.exp).diff(dayjs(), "minute") < 1;

      // Check if token is still valid
      if (isExpired) {
        // Token has expired
        try {
          const newTokens = await this.refreshToken();
          if (newTokens) {
            localStorage.setItem("authTokens", JSON.stringify(newTokens));
            this.authTokens = newTokens;
            this.user = jwtDecode(newTokens.access);

            return newTokens.access;
          }
        } catch (err) {
          console.error("Error refreshing token", err);
          return null;
        }
      }

      return this.authTokens.access;
    },
    async refreshToken() {
      const rToken = this.authTokens?.refresh;
      if (!rToken) {
        console.error("No refresh token available");
        return null;
      }

      try {
        const url = getEndpoint({ path: "auth.refreshToken" });
        const response = await $fetch(url, {
          method: "POST",
          body: JSON.stringify({ refresh: rToken }),
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
