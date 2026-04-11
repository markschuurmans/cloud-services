import { defineStore } from "pinia";
import { apiRequest } from "@/services/api";
import { setToken } from "@/services/auth";

type LoginResponse = {
  message: string;
  token: string;
};

type RegisterResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    loading: false,
    error: "",
    success: "",
  }),
  actions: {
    clearMessages() {
      this.error = "";
      this.success = "";
    },
    async login(email: string, password: string) {
      this.loading = true;
      this.error = "";

      try {
        const data = await apiRequest<LoginResponse>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        setToken(data.token || "");
      } catch (err) {
        this.error = err instanceof Error ? err.message : "Login mislukt";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async register(displayName: string, email: string, password: string) {
      this.loading = true;
      this.error = "";
      this.success = "";

      try {
        const data = await apiRequest<RegisterResponse>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ displayName, email, password }),
        });

        this.success = data.message || "Registratie gelukt. Je kunt nu inloggen.";
      } catch (err) {
        this.error = err instanceof Error ? err.message : "Registratie mislukt";
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});

