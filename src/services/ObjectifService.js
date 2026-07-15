import api from "../api/axiosConfig";

const ObjectifService = {
  getByRelation: (relationId) => api.get(`/objectifs/relation/${relationId}`),

  create: (relationId, payload) =>
    api.post(`/objectifs?relationId=${relationId}`, payload),

  update: (id, payload) => api.put(`/objectifs/${id}`, payload),

  valider: (id) => api.patch(`/objectifs/${id}/valider`),

  refuser: (id, commentaire) =>
    api.patch(`/objectifs/${id}/refuser`, { commentaire }),

  delete: (id) => api.delete(`/objectifs/${id}`),
};

export default ObjectifService;
