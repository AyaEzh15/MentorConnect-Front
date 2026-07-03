import api from "../api/axiosConfig";

const EvaluationService = {
  getEvaluations: () => api.get("/evaluations"),

  getEvaluationById: (id) => api.get(`/evaluations/${id}`),

  createEvaluation: (rendezVousId, evaluateurId, evalueId, evaluation) =>
    api.post(
      `/evaluations?rendezVousId=${rendezVousId}&evaluateurId=${evaluateurId}&evalueId=${evalueId}`,
      evaluation
    ),

  getEvaluationsByEvalue: (userId) => api.get(`/evaluations/evalue/${userId}`),

  getEvaluationsByEvaluateur: (userId) =>
    api.get(`/evaluations/evaluateur/${userId}`),

  getMoyenne: (userId) => api.get(`/evaluations/evalue/${userId}/moyenne`),

  getMoyenneMentor: (mentorId) =>
    api.get(`/evaluations/mentor/${mentorId}/moyenne`),

  deleteEvaluation: (id) => api.delete(`/evaluations/${id}`),
};

export default EvaluationService;