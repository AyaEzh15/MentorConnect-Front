import axios from "axios";

const api = axios.create({
  baseURL: "http://172.17.163.67:8082/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const publicPaths = ["/", "/mentors", "/login", "/register"];
      const path = window.location.pathname;

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!publicPaths.includes(path)) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
