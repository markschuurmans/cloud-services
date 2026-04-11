import { ref } from "vue";

const TOKEN_KEY = "token";

export const authToken = ref(localStorage.getItem(TOKEN_KEY) || "");

export function getToken() {
  return authToken.value;
}

export function setToken(token: string) {
  authToken.value = token || "";
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  authToken.value = "";
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(authToken.value);
}
