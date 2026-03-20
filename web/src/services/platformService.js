import api from "./api";

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

  connectTelegram: (botToken, channelId) =>
    api.post("/platforms/auth/telegram/connect", { botToken, channelId }),
};
