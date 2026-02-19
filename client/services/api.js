import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@crosspost_token";

const BASE_URL = "http://192.168.1.40:4000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

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

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
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
};

export const postAPI = {
  list: () => api.get("/posts"),

  get: (id) => api.get(`/posts/${id}`),

  create: ({ caption, media, platforms, status }) => {
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
    return api.post("/posts", formData, {
      timeout: 300000,
    });
  },

  update: (id, postData) => api.put(`/posts/${id}`, postData),

  delete: (id) => api.delete(`/posts/${id}`),

  publish: (id) => api.post(`/posts/${id}/publish`),

  schedule: (id, scheduledAt) =>
    api.post(`/posts/${id}/schedule`, { scheduledAt }),
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
