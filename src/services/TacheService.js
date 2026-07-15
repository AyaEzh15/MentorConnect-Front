import api from "../api/axiosConfig";

const TacheService = {
  getByRelation: (relationId) => api.get(`/taches/relation/${relationId}`),

  create: (relationId, payload) =>
    api.post(`/taches?relationId=${relationId}`, payload),

  update: (id, payload) => api.put(`/taches/${id}`, payload),

  setStatutMentore: (id, statut) =>
    api.patch(`/taches/${id}/statut-mentore`, { statut }),

  demarrer: (id) => api.patch(`/taches/${id}/demarrer`),

  soumettre: (id, { commentaire, lienTravail, fichierUrl } = {}) =>
    api.patch(`/taches/${id}/soumettre`, { commentaire, lienTravail, fichierUrl }),

  soumettreAvecFichier: (id, { commentaire, lienTravail, fichier } = {}) => {
    const form = new FormData();
    if (commentaire) form.append("commentaire", commentaire);
    if (lienTravail) form.append("lienTravail", lienTravail);
    if (fichier) form.append("fichier", fichier);
    return api.post(`/taches/${id}/soumettre-fichier`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  valider: (id, commentaire) =>
    api.patch(`/taches/${id}/valider`, { commentaire }),

  demanderCorrection: (id, commentaire) =>
    api.patch(`/taches/${id}/demander-correction`, { commentaire }),

  delete: (id) => api.delete(`/taches/${id}`),
};

export default TacheService;
