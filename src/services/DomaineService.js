import api from "../api/axiosConfig";

const DomaineService = {

    getDomaines() {
        return api.get("/domaines");
    },

    getDomaineById(id) {
        return api.get(`/domaines/${id}`);
    },

    createDomaine(domaine) {
        return api.post("/domaines", domaine);
    },

    updateDomaine(id, domaine) {
        return api.put(`/domaines/${id}`, domaine);
    },

    deleteDomaine(id) {
        return api.delete(`/domaines/${id}`);
    }

};

export default DomaineService;