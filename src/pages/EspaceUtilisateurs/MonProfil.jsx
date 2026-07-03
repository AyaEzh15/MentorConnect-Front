import { useEffect, useState } from "react";
import ProfilService from "../../services/ProfilService";
import DomaineService from "../../services/DomaineService";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import handleApiError from "../../utils/handleApiError";

const EMPTY_FORM = {
  biographie: "",
  secteur: "",
  competences: "",
  anneesExperiences: "",
  linkedinUrl: "",
  disponibilites: "",
};

function MonProfil() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [profilId, setProfilId] = useState(null);
  const [domaineId, setDomaineId] = useState("");
  const [domaines, setDomaines] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const domainesRes = await DomaineService.getDomaines();
      setDomaines(domainesRes.data);

      try {
        const profilRes = await ProfilService.getProfilByUtilisateur(user.id);
        const profil = profilRes.data;

        if (profil && profil.id) {
          setProfilId(profil.id);
          setDomaineId(profil.domaine?.id ? String(profil.domaine.id) : "");
          setForm({
            biographie: profil.biographie || "",
            secteur: profil.secteur || "",
            competences: profil.competences || "",
            anneesExperiences:
              profil.anneesExperiences != null ? profil.anneesExperiences : "",
            linkedinUrl: profil.linkedinUrl || "",
            disponibilites: profil.disponibilites || "",
          });
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          setErreur(handleApiError(error));
        }
      }
    } catch (error) {
      setErreur(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");

    if (!domaineId) {
      setErreur("Veuillez choisir un domaine.");
      return;
    }

    const payload = {
      ...form,
      anneesExperiences:
        form.anneesExperiences === "" ? null : Number(form.anneesExperiences),
    };

    try {
      if (profilId) {
        const res = await ProfilService.updateProfil(
          profilId,
          domaineId,
          payload
        );
        setMessage("Profil mis a jour avec succes.");
        if (res.data?.id) {
          setProfilId(res.data.id);
        }
      } else {
        const res = await ProfilService.createProfil(
          user.id,
          domaineId,
          payload
        );
        setProfilId(res.data?.id || null);
        setMessage("Profil cree avec succes.");
      }
    } catch (error) {
      setErreur(handleApiError(error, "Erreur lors de l'enregistrement du profil"));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement du profil..." />;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "720px" }}>
      <PageHeader
        title="Mon profil"
        subtitle="Renseignez votre domaine et vos competences pour etre visible."
      />

      {message && <div className="alert alert-success">{message}</div>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {!profilId && (
        <div className="alert alert-info">
          Vous n'avez pas encore de profil. Completez ce formulaire pour
          apparaitre dans les recherches.
        </div>
      )}

      <form onSubmit={handleSubmit} className="card shadow-sm">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Domaine *</label>
            <select
              className="form-select"
              value={domaineId}
              onChange={(e) => setDomaineId(e.target.value)}
              required
            >
              <option value="">-- Choisir un domaine --</option>
              {domaines.map((domaine) => (
                <option key={domaine.id} value={domaine.id}>
                  {domaine.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Competences</label>
            <textarea
              className="form-control"
              name="competences"
              rows="2"
              placeholder="Ex : Java, Spring Boot, React, gestion de projet..."
              value={form.competences}
              onChange={handleChange}
            />
            <small className="text-muted">
              Separez les competences par des virgules.
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Secteur</label>
            <input
              className="form-control"
              name="secteur"
              placeholder="Ex : Informatique, Finance, Sante..."
              value={form.secteur}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Annees d'experience</label>
            <input
              type="number"
              min="0"
              className="form-control"
              name="anneesExperiences"
              value={form.anneesExperiences}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Biographie</label>
            <textarea
              className="form-control"
              name="biographie"
              rows="3"
              placeholder="Presentez-vous en quelques lignes..."
              value={form.biographie}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Lien LinkedIn</label>
            <input
              className="form-control"
              name="linkedinUrl"
              placeholder="https://www.linkedin.com/in/..."
              value={form.linkedinUrl}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Disponibilites</label>
            <input
              className="form-control"
              name="disponibilites"
              placeholder="Ex : Lundi et mercredi apres-midi"
              value={form.disponibilites}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            {profilId ? "Mettre a jour mon profil" : "Creer mon profil"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MonProfil;
