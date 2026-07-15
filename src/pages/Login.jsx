import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="mc-auth">
      <div className="mc-auth__card">
        <h1 className="mc-auth__title">Connexion</h1>
        <p className="mc-auth__subtitle">
          Accédez à votre espace MentorConnect
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mot de passe</label>
            <input
              className="form-control"
              type="password"
              placeholder="••••••••"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Se connecter
          </button>
        </form>

        {message && (
          <div className="alert alert-danger mt-3 mb-0">{message}</div>
        )}

        <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 14 }}>
          Pas encore de compte ?{" "}
          <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
