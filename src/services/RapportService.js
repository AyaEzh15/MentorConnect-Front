import api from "../api/axiosConfig";

const RapportService = {
  getAll: (statut) =>
    statut
      ? api.get(`/rapports?statut=${statut}`)
      : api.get("/rapports"),

  create: (payload) => api.post("/rapports", payload),

  traiter: (id, { statut, commentaireAdmin }) =>
    api.patch(`/rapports/${id}/traiter`, { statut, commentaireAdmin }),

  delete: (id) => api.delete(`/rapports/${id}`),
};

export default RapportService;
