import api from "../api/axiosConfig";

const UtilisateurService = {
  getUtilisateurs: () => {
    return api.get("/utilisateurs");
  },

  getUtilisateurById: (id) => {
    return api.get(`/utilisateurs/${id}`);
  },

  updateUtilisateur: (id, utilisateur) => {
    return api.put(`/utilisateurs/${id}`, utilisateur);
  },

  desactiverUtilisateur: (id) => {
    return api.patch(`/utilisateurs/${id}`);
  },

  deleteUtilisateur: (id) => {
    return api.delete(`/utilisateurs/${id}`);
  },
};

export default UtilisateurService;