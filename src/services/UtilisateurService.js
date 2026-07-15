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

  uploadPhoto: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/utilisateurs/${id}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  desactiverUtilisateur: (id) => {
    return api.patch(`/utilisateurs/${id}`);
  },

  deleteUtilisateur: (id) => {
    return api.delete(`/utilisateurs/${id}`);
  },
};

export default UtilisateurService;
