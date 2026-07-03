import api from "../api/axiosConfig";

const DashboardService = {
  getStats: () => api.get("/dashboard/stats"),
};

export default DashboardService;
