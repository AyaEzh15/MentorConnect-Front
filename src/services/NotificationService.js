import api from "../api/axiosConfig";

const NotificationService = {
  createNotification: (utilisateurId, notification) =>
    api.post(`/notifications?utilisateurId=${utilisateurId}`, notification),

  getNotificationsByUtilisateur: (utilisateurId) =>
    api.get(`/notifications/utilisateur/${utilisateurId}`),

  getNotificationsNonLues: (utilisateurId) =>
    api.get(`/notifications/utilisateur/${utilisateurId}/non-lues`),

  countNotificationsNonLues: (utilisateurId) =>
    api.get(`/notifications/utilisateur/${utilisateurId}/count-non-lues`),

  marquerCommeLue: (id) => api.patch(`/notifications/${id}/lu`),

  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export default NotificationService;