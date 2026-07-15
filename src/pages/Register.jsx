import { useState } from "react";
import { Link } from "react-router-dom";
import AuthService from "../services/AuthService";

function Register() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    role: "MENTORE",
    photoProfil: "",
  });

  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");

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
        setErreur("Erreur lors de l'inscription");
      }
    } catch (error) {
      if (error?.response?.status === 409) {
        setErreur("Email déjà utilisé");
      } else {
        setErreur("Erreur lors de l'inscription");
      }
    }
  };

  return (
    <div className="mc-auth">
      <div className="mc-auth__card" style={{ maxWidth: 480 }}>
        <h1 className="mc-auth__title">Inscription</h1>
        <p className="mc-auth__subtitle">
          Rejoignez la communauté MentorConnect
        </p>

        <form onSubmit={handleRegister}>
          <div className="row g-2">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nom</label>
              <input
                className="form-control"
                name="nom"
                placeholder="Nom"
                value={form.nom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Prénom</label>
              <input
                className="form-control"
                name="prenom"
                placeholder="Prénom"
                value={form.prenom}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mot de passe</label>
            <input
              className="form-control"
              name="motDePasse"
              type="password"
              placeholder="••••••••"
              value={form.motDePasse}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Je suis</label>
            <select
              className="form-select"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="MENTORE">Mentoré</option>
              <option value="MENTOR">Mentor</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Photo de profil (lien URL)</label>
            <input
              className="form-control"
              name="photoProfil"
              type="text"
              placeholder="https://… (optionnel)"
              value={form.photoProfil}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Créer mon compte
          </button>
        </form>

        {message && <div className="alert alert-success mt-3 mb-0">{message}</div>}
        {erreur && <div className="alert alert-danger mt-3 mb-0">{erreur}</div>}

        <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 14 }}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
