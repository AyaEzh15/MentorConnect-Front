import api from "../api/axiosConfig";

const AuthService = {
  login: (email, motDePasse) => {
    return api.post("/auth/login", {
      email,
      motDePasse,
    });
  },

  register: (user) => {
    return api.post("/auth/register", user);
  },
};

export default AuthService;