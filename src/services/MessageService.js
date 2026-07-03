import api from "../api/axiosConfig";

const MessageService = {
  getMessages: () => api.get("/messages"),

  getMessageById: (id) => api.get(`/messages/${id}`),

  envoyerMessage: (relationId, expediteurId, destinataireId, message) =>
    api.post(
      `/messages?relationId=${relationId}&expediteurId=${expediteurId}&destinataireId=${destinataireId}`,
      { message }
    ),

  getMessagesByRelation: (relationId) =>
    api.get(`/messages/relation/${relationId}`),

  getMessagesEnvoyes: (expediteurId) =>
    api.get(`/messages/expediteur/${expediteurId}`),

  getMessagesRecus: (destinataireId) =>
    api.get(`/messages/destinataire/${destinataireId}`),

  marquerMessageCommeLu: (id) => api.put(`/messages/${id}/lu`),

  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

export default MessageService;