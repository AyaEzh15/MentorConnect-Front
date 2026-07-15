import api from "../api/axiosConfig";

function buildDomaineIdsQuery(domaineIds) {
  if (!domaineIds || domaineIds.length === 0) return "";
  return domaineIds
    .filter((id) => id !== null && id !== undefined && id !== "")
    .map((id) => `domaineIds=${encodeURIComponent(id)}`)
    .join("&");
}

const ProfilService = {
  getProfils: () => api.get("/profils"),

  getProfilById: (id) => api.get(`/profils/${id}`),

  getProfilByUtilisateur: (utilisateurId) =>
    api.get(`/profils/utilisateur/${utilisateurId}`),

  createProfil: (utilisateurId, domaineIds, profil) => {
    const idsQuery = buildDomaineIdsQuery(
      Array.isArray(domaineIds) ? domaineIds : [domaineIds]
    );
    return api.post(
      `/profils?utilisateurId=${utilisateurId}&${idsQuery}`,
      profil
    );
  },

  updateProfil: (id, domaineIds, profil) => {
    const idsQuery = buildDomaineIdsQuery(
      Array.isArray(domaineIds) ? domaineIds : [domaineIds]
    );
    return api.put(`/profils/${id}?${idsQuery}`, profil);
  },

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
