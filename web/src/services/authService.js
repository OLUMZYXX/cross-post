import api from "./api";

export const authAPI = {
  signup: (name, email, password) =>
    api.post("/auth/signup", { name, email, password }),

  signin: (email, password) => api.post("/auth/signin", { email, password }),

  getMe: () => api.get("/auth/me"),

  updateProfile: (name, email) => api.put("/auth/profile", { name, email }),

  googleAuth: (accessToken) => api.post("/auth/google", { accessToken }),

  setup2FA: () => api.post("/auth/2fa/setup"),

  verify2FA: (code) => api.post("/auth/2fa/verify", { code }),

  disable2FA: (code) => api.post("/auth/2fa/disable", { code }),

  login2FA: (tempToken, code) =>
    api.post("/auth/2fa/login", { tempToken, code }),
};
