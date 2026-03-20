import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const TOKEN_KEY = "crosspost_token";
const BASE_URL = API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function fetchJSON(path, { method = "POST", body, timeout = 120000 } = {}) {
  const token = getStoredToken();
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const data = await response.json();
    if (!response.ok) {
      return Promise.reject({
        message: data?.error?.message || "Something went wrong. Please try again.",
        code: data?.error?.code || "SERVER_ERROR",
        status: response.status,
      });
    }
    return data;
  } catch (err) {
    clearTimeout(timer);
    if (err.code) throw err;
    return Promise.reject({
      message: "Unable to reach the server. Check your connection.",
      code: "NETWORK_ERROR",
      status: null,
    });
  }
}

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config;

    if (!error.response && config) {
      if (!config._retryCount) config._retryCount = 0;
      if (config._retryCount < 3) {
        config._retryCount += 1;
        const delays = [5000, 10000, 15000];
        await new Promise((r) => setTimeout(r, delays[config._retryCount - 1]));
        return api(config);
      }
    }

    const apiError = {
      message: "Something went wrong. Please try again.",
      code: "NETWORK_ERROR",
      status: null,
    };

    if (error.response) {
      const { data, status } = error.response;
      apiError.status = status;
      apiError.code = data?.error?.code || "SERVER_ERROR";
      apiError.message = data?.error?.message || apiError.message;
    } else if (error.request) {
      apiError.message = "Unable to reach the server. Check your connection.";
      apiError.code = "NETWORK_ERROR";
    }

    return Promise.reject(apiError);
  },
);

export function wakeUpServer() {
  fetch(API_BASE_URL.replace(/\/api$/, "/health")).catch(() => {});
}

export async function ensureServerAwake() {
  const healthUrl = API_BASE_URL.replace(/\/api$/, "/health");
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(healthUrl, { method: "GET" });
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, attempt * 3000));
  }
  return false;
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return getStoredToken();
}

export { fetchJSON, api as default };
