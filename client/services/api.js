import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/apiConfig";

const TOKEN_KEY = "@crosspost_token";

const BASE_URL = API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

// Direct fetch helper for routes that have multer middleware (avoids axios XHR issues on Android)
async function fetchJSON(path, { method = "POST", body, timeout = 120000 } = {}) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
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
    if (err.code) throw err; // Re-throw server errors
    return Promise.reject({
      message: "Unable to reach the server. Check your connection.",
      code: "NETWORK_ERROR",
      status: null,
    });
  }
}

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Only set Content-Type for non-FormData requests (axios sets it automatically for FormData)
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Retry logic for network errors (handles Render cold starts)
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config;

    // Retry up to 3 times on network errors (no response received)
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

// Wake up Render server (free tier sleeps after inactivity)
export function wakeUpServer() {
  fetch(API_BASE_URL.replace(/\/api$/, "/health")).catch(() => {});
}

// Wait for the server to be awake before making critical requests
export async function ensureServerAwake() {
  const healthUrl = API_BASE_URL.replace(/\/api$/, "/health");
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(healthUrl, { method: "GET" });
      if (res.ok) return true;
    } catch {}
    // Wait longer between attempts to give Render time to cold-start
    await new Promise((r) => setTimeout(r, attempt * 3000));
  }
  return false;
}

export async function saveToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export const authAPI = {
  signup: (name, email, password) =>
    api.post("/auth/signup", { name, email, password }),

  signin: (email, password) => api.post("/auth/signin", { email, password }),

  getMe: () => api.get("/auth/me"),

  updateProfile: (name, email) => api.put("/auth/profile", { name, email }),

  googleAuth: (accessToken) => api.post("/auth/google", { accessToken }),

  appleAuth: (identityToken, fullName, email) =>
    api.post("/auth/apple", { identityToken, fullName, email }),

  setup2FA: () => api.post("/auth/2fa/setup"),

  verify2FA: (code) => api.post("/auth/2fa/verify", { code }),

  disable2FA: (code) => api.post("/auth/2fa/disable", { code }),

  login2FA: (tempToken, code) =>
    api.post("/auth/2fa/login", { tempToken, code }),
};

export const postAPI = {
  list: () => api.get("/posts"),

  get: (id) => api.get(`/posts/${id}`),

  create: async ({ caption, media, platforms, status }) => {
    // Use direct fetch (bypasses axios XHR which fails on Android for multer routes)
    const hasRawFiles =
      media && media.length > 0 && !media.every((m) => m.cloudinaryUrl);

    if (!hasRawFiles) {
      return fetchJSON("/posts", {
        body: {
          caption,
          status,
          platforms,
          ...(media && media.length > 0 && {
            mediaUrls: media.map((m) => m.cloudinaryUrl),
          }),
        },
      });
    }

    // Fallback: upload raw files via FormData using fetch (axios XHR fails on Android)
    const formData = new FormData();
    if (caption) formData.append("caption", caption);
    if (status) formData.append("status", status);
    if (platforms) {
      platforms.forEach((p) => formData.append("platforms", p));
    }
    if (media && media.length > 0) {
      media.forEach((item) => {
        const uri = typeof item === "string" ? item : item.uri;
        const name =
          (typeof item === "object" && item.name) ||
          `media_${Date.now()}.${uri.split(".").pop() || "jpg"}`;
        const type =
          typeof item === "object" && item.type === "video"
            ? "video/mp4"
            : "image/jpeg";
        formData.append("media", { uri, name, type });
      });
    }

    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 300000);
    try {
      const response = await fetch(`${BASE_URL}/posts`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
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
  },

  update: (id, postData) => api.put(`/posts/${id}`, postData),

  delete: (id) => api.delete(`/posts/${id}`),

  publish: (id) => fetchJSON(`/posts/${id}/publish`, { timeout: 180000 }),

  retry: (id, platforms) =>
    fetchJSON(`/posts/${id}/retry`, { body: { platforms }, timeout: 180000 }),

  schedule: (id, scheduledAt) =>
    fetchJSON(`/posts/${id}/schedule`, { body: { scheduledAt } }),

  rephrase: (caption, tone) => fetchJSON("/posts/rephrase", { body: { caption, tone } }),
};

export const notificationAPI = {
  list: () => api.get("/notifications"),

  markAsRead: (id) => fetchJSON(`/notifications/${id}/read`),

  markAllAsRead: () => fetchJSON("/notifications/read-all"),

  delete: (id) => fetchJSON(`/notifications/${id}`, { method: "DELETE" }),

  clearAll: () => fetchJSON("/notifications/clear"),

  registerPushToken: (pushToken) =>
    fetchJSON("/notifications/push-token", { body: { pushToken } }),

  getPreferences: () => api.get("/notifications/preferences"),

  updatePreferences: (prefs) =>
    fetchJSON("/notifications/preferences", { method: "PUT", body: prefs }),
};

export const platformAPI = {
  list: () => api.get("/platforms"),

  connect: (name, oauthData = {}) =>
    api.post("/platforms/connect", { name, ...oauthData }),

  disconnect: (id) => api.delete(`/platforms/${id}`),

  initiateFacebookAuth: () => api.get("/platforms/auth/facebook"),

  listFacebookPages: () => api.get("/platforms/auth/facebook/pages"),

  toggleFacebookPage: (pageId, selected) =>
    api.post("/platforms/auth/facebook/select-page", { pageId, selected }),

  initiateTwitterAuth: () => api.get("/platforms/auth/twitter"),

  initiateInstagramAuth: () => api.get("/platforms/auth/instagram"),

  getInstagramPendingInfo: (stateId) =>
    api.get(`/platforms/auth/instagram/pending?stateId=${stateId}`),

  confirmInstagramConnection: (stateId) =>
    api.post("/platforms/auth/instagram/confirm", { stateId }),

  initiateTikTokAuth: () => api.get("/platforms/auth/tiktok"),

  initiateLinkedInAuth: () => api.get("/platforms/auth/linkedin"),

  initiateYouTubeAuth: () => api.get("/platforms/auth/youtube"),

  initiateRedditAuth: () => api.get("/platforms/auth/reddit"),
};

export default api;
