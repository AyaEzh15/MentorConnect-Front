import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await AuthService.login(email, motDePasse);

      const { token, utilisateur } = res.data || {};

      if (token && utilisateur) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(utilisateur));

        setUser(utilisateur);

        if (utilisateur.role === "ADMIN") {
          navigate("/dashboard", { replace: true });
        } else if (utilisateur.role === "MENTOR") {
          navigate("/mentor", { replace: true });
        } else if (utilisateur.role === "MENTORE") {
          navigate("/mentore", { replace: true });
        }
      } else {
        setMessage("Email ou mot de passe incorrect");
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        setMessage("Email ou mot de passe incorrect");
      } else {
        setMessage("Erreur lors de la connexion");
      }
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4 text-center">Connexion</h2>

      <form onSubmit={handleLogin}>
        <input
          className="form-control mb-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="form-control mb-3"
          type="password"
          placeholder="Mot de passe"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary w-100">
          Se connecter
        </button>
      </form>

      {message && <p className="mt-3 text-danger text-center">{message}</p>}
    </div>
  );
}

export default Login;