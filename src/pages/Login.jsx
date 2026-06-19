import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post(
        `/auth/login?email=${encodeURIComponent(email)}&motDePasse=${encodeURIComponent(motDePasse)}`
      );

      console.log("LOGIN RESPONSE:", res.data);

      if (res.data && res.data.id) {
        localStorage.setItem("user", JSON.stringify(res.data));

        if (res.data.role === "ADMIN") {
          navigate("/dashboard", { replace: true });
        } else if (res.data.role === "MENTOR") {
          navigate("/mentor", { replace: true });
        } else if (res.data.role === "MENTORE") {
          navigate("/mentore", { replace: true });
        }
      } else {
        setMessage("Email ou mot de passe incorrect");
      }
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de la connexion");
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