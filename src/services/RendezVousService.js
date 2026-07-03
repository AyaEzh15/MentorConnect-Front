import api from "../api/axiosConfig";

const RendezVousService = {
  getRendezVous: () => api.get("/rendez-vous"),

  getRendezVousById: (id) => api.get(`/rendez-vous/${id}`),

  createRendezVous: (relationId, rendezVous) =>
    api.post(`/rendez-vous?relationId=${relationId}`, rendezVous),

  confirmerRendezVous: (id) => api.patch(`/rendez-vous/${id}/confirmer`),

  annulerRendezVous: (id) => api.patch(`/rendez-vous/${id}/annuler`),

  terminerRendezVous: (id) => api.patch(`/rendez-vous/${id}/terminer`),

  getRendezVousByRelation: (relationId) =>
    api.get(`/rendez-vous/relation/${relationId}`),

  getRendezVousByStatut: (statut) => api.get(`/rendez-vous/statut/${statut}`),

  deleteRendezVous: (id) => api.delete(`/rendez-vous/${id}`),
};

export default RendezVousService;