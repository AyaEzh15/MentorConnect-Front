import { useState } from "react";
import AuthService from "../services/AuthService";


function Register() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    role: "MENTORE",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await AuthService.register(form);

      const { token, utilisateur } = res.data || {};

      if (token && utilisateur) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(utilisateur));

        setMessage("Compte créé avec succès");

        const target = utilisateur.role === "MENTOR" ? "/mentor" : "/mentore";
        window.location.href = target;
      } else {
        setMessage("Erreur lors de l'inscription");
      }
    } catch (error) {
      if (error?.response?.status === 409) {
        setMessage("Email déjà utilisé");
      } else {
        setMessage("Erreur lors de l'inscription");
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Inscription</h2>

      <form onSubmit={handleRegister} className="mt-4">
        <input
          className="form-control mb-3"
          name="nom"
          placeholder="Nom"
          onChange={handleChange}
        />

        <input
          className="form-control mb-3"
          name="prenom"
          placeholder="Prénom"
          onChange={handleChange}
        />

        <input
          className="form-control mb-3"
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          className="form-control mb-3"
          name="motDePasse"
          type="password"
          placeholder="Mot de passe"
          onChange={handleChange}
        />

        <select
          className="form-control mb-3"
          name="role"
          onChange={handleChange}
        >
          <option value="MENTORE">Mentoré</option>
          <option value="MENTOR">Mentor</option>
        </select>

        <button className="btn btn-success">Créer le compte</button>
      </form>

      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}

export default Register;