import api from "../api/axiosConfig";

const ProfilService = {
  getProfils: () => api.get("/profils"),

  getProfilById: (id) => api.get(`/profils/${id}`),

  getProfilByUtilisateur: (utilisateurId) =>
    api.get(`/profils/utilisateur/${utilisateurId}`),

  createProfil: (utilisateurId, domaineId, profil) =>
    api.post(`/profils?utilisateurId=${utilisateurId}&domaineId=${domaineId}`, profil),

  updateProfil: (id, domaineId, profil) =>
    api.put(`/profils/${id}?domaineId=${domaineId}`, profil),

  deleteProfil: (id) => api.delete(`/profils/${id}`),

  getProfilsByDomaine: (domaineId) => api.get(`/profils/domaine/${domaineId}`),

  getMentors: () => api.get("/profils/mentors"),

  getMentorsByDomaine: (domaineId) =>
    api.get(`/profils/mentors/domaine/${domaineId}`),

  rechercheAvancee: ({ domaineId, competence, secteur, role }) => {
    let url = "/profils/recherche?";

    if (role) url += `role=${role}&`;
    if (domaineId) url += `domaineId=${domaineId}&`;
    if (competence) url += `competence=${encodeURIComponent(competence)}&`;
    if (secteur) url += `secteur=${encodeURIComponent(secteur)}&`;

    return api.get(url);
  },
};

export default ProfilService;