import api, { fetchJSON } from "./api";

export const postAPI = {
  list: () => api.get("/posts"),

  get: (id) => api.get(`/posts/${id}`),

  create: ({ caption, media, platforms, status }) =>
    fetchJSON("/posts", {
      body: {
        caption,
        status,
        platforms,
        ...(media && media.length > 0 && { mediaUrls: media }),
      },
    }),

  update: (id, postData) => api.put(`/posts/${id}`, postData),

  delete: (id) => api.delete(`/posts/${id}`),

  publish: (id) => fetchJSON(`/posts/${id}/publish`, { timeout: 600000 }),

  retry: (id, platforms) =>
    fetchJSON(`/posts/${id}/retry`, { body: { platforms }, timeout: 600000 }),

  schedule: (id, scheduledAt) =>
    fetchJSON(`/posts/${id}/schedule`, { body: { scheduledAt } }),

  rephrase: (caption, tone, maxLength) =>
    fetchJSON("/posts/rephrase", {
      body: { caption, tone, ...(maxLength && { maxLength }) },
    }),

  copyrightCheck: (caption, imageUrls) =>
    fetchJSON("/posts/copyright-check", {
      body: { caption, imageUrls },
      timeout: 30000,
    }),
};
