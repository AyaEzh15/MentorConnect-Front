import { useState } from "react";
import api from "../api/axiosConfig";

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
      const res = await api.post("/auth/register", form);

      if (res.data) {
        setMessage("Compte créé avec succès");
      } else {
        setMessage("Email déjà utilisé");
      }
    } catch (error) {
      setMessage("Erreur lors de l'inscription");
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