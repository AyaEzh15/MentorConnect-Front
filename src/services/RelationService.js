import api from "../api/axiosConfig";

const RelationService = {
  getRelations: () => api.get("/relations"),

  getRelationById: (id) => api.get(`/relations/${id}`),

  envoyerDemande: (mentorId, mentoreId) =>
    api.post(`/relations/demande?mentorId=${mentorId}&mentoreId=${mentoreId}`),

  accepterDemande: (id) => api.put(`/relations/demande/${id}/accepter`),

  refuserDemande: (id) => api.put(`/relations/demande/${id}/refuser`),

  getRelationsByMentor: (mentorId) => api.get(`/relations/mentor/${mentorId}`),

  getRelationsByMentore: (mentoreId) => api.get(`/relations/mentore/${mentoreId}`),

  getRelationsByStatut: (statut) => api.get(`/relations/statut/${statut}`),

  deleteRelation: (id) => api.delete(`/relations/${id}`),
};

export default RelationService;