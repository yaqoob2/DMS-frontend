import api from './axios';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
};

export const fileService = {
  getAll: (params) => api.get('/files', { params }),
  getById: (id) => api.get(`/files/${id}`),

  upload: (formData, onProgress) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (!e.total) return;
        onProgress?.(Math.round((e.loaded * 100) / e.total));
      },
    }),

  newVersion: (id, formData, onProgress) =>
    api.post(`/files/${id}/new-version`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (!e.total) return;
        onProgress?.(Math.round((e.loaded * 100) / e.total));
      },
    }),

  getVersions: (id) => api.get(`/files/${id}/versions`),
  download: (id) => api.get(`/files/${id}/download`),
  downloadVersion: (fileId, versionId) =>
    api.get(`/files/${fileId}/versions/${versionId}/download`),
  preview: (id) => api.get(`/files/${id}/preview`),
  restoreVersion: (fileId, versionId) =>
    api.post(`/files/${fileId}/restore/${versionId}`),
  restoreDeleted: (id) => api.post(`/files/${id}/restore-deleted`),
  delete: (id, data) => api.delete(`/files/${id}`, { data }),
};

export const folderService = {
  getAll: () => api.get('/folders'),
  getById: (id) => api.get(`/folders/${id}`),
  create: (data) => api.post('/folders', data),
  update: (id, data) => api.patch(`/folders/${id}`, data),
  restoreDeleted: (id) => api.post(`/folders/${id}/restore-deleted`),
  delete: (id, data) => api.delete(`/folders/${id}`, { data }),
};

export const permissionService = {
  getByFolder: (folderId) => api.get(`/folders/${folderId}/permissions`),
  create: (data) => api.post('/permissions', data),
  update: (id, data) => api.patch(`/permissions/${id}`, data),
  delete: (id) => api.delete(`/permissions/${id}`),
};

export const commentService = {
  getByFile: (fileId) => api.get(`/files/${fileId}/comments`),

  create: (fileId, comment) =>
    api.post(`/files/${fileId}/comments`, { comment }),

  delete: (fileId, commentId) =>
    api.delete(`/files/${fileId}/comments/${commentId}`),
};

export const activityService = {
  getAll: () => api.get('/activity'),

  getFileActivity: (id) =>
    api.get(`/files/${id}/activity`),

  getFolderActivity: (id) =>
    api.get(`/folders/${id}/activity`),
};

export const storageService = {
  getSummary: () => api.get('/storage/summary'),
  getLargest: () => api.get('/storage/largest-files'),
  getMonthlyActivity: () => api.get('/storage/monthly-activity'),
};

export const searchService = {
  search: (params) => api.get('/search', { params }),
};

export const safetyService = {
  getDeletedFiles: () => api.get('/safety/deleted-files'),
  getDeletedFolders: () => api.get('/safety/deleted-folders'),
  getBackupGuidance: () => api.get('/safety/backup-guidance'),
  permanentDeleteFile: (id) => api.delete(`/safety/deleted-files/${id}`),
  permanentDeleteFolder: (id) => api.delete(`/safety/deleted-folders/${id}`),
  permanentDeleteAllFiles: () =>
    api.post('/safety/deleted-files/permanent-delete-all', { confirm: true }),
  permanentDeleteAllFolders: () =>
    api.post('/safety/deleted-folders/permanent-delete-all', { confirm: true }),
};

export const userService = {
  create: (data) => api.post('/users', data),
  getAll: () => api.get('/users'),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  delete: (id) => api.delete(`/users/${id}`),
};