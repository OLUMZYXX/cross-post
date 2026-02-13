import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@crosspost_token";

const BASE_URL = "http://192.168.1.40:4000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

  create: (postData) => api.post("/posts", postData),

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

  initiateFacebookAuth: (state) =>
    api.get(
      `/platforms/auth/facebook?state=${encodeURIComponent(state || "")}`,
    ),

  initiateTwitterAuth: () => api.get("/platforms/auth/twitter"),

  initiateInstagramAuth: () => api.get("/platforms/auth/instagram"),

  initiateTikTokAuth: () => api.get("/platforms/auth/tiktok"),
};

export default api;
