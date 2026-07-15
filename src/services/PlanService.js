import api from "../api/axiosConfig";

const PlanService = {
  getByRelation: (relationId) => api.get(`/plans/relation/${relationId}`),

  initialiser: (relationId) =>
    api.post(`/plans/relation/${relationId}/initialiser`),

  create: (relationId, payload) =>
    api.post(`/plans?relationId=${relationId}`, payload),

  update: (id, payload) => api.put(`/plans/${id}`, payload),

  delete: (id) => api.delete(`/plans/${id}`),
};

export default PlanService;
