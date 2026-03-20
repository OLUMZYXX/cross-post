import api, { fetchJSON } from "./api";

export const notificationAPI = {
  list: () => api.get("/notifications"),

  markAsRead: (id) => fetchJSON(`/notifications/${id}/read`),

  markAllAsRead: () => fetchJSON("/notifications/read-all"),

  delete: (id) => fetchJSON(`/notifications/${id}`, { method: "DELETE" }),

  clearAll: () => fetchJSON("/notifications/clear"),

  getPreferences: () => api.get("/notifications/preferences"),

  updatePreferences: (prefs) =>
    fetchJSON("/notifications/preferences", { method: "PUT", body: prefs }),
};
