import { useEffect, useState } from "react";
import api from "../../../api/axiosConfig";

function MentoreHome() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [mentors, setMentors] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [domaineId, setDomaineId] = useState("");
  const [competence, setCompetence] = useState("");
  const [secteur, setSecteur] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMentors();
    loadDomaines();
  }, []);

  const loadMentors = async () => {
    const res = await api.get("/profils/recherche?role=MENTOR");
    setMentors(res.data);
  };

  const loadDomaines = async () => {
    const res = await api.get("/domaines");
    setDomaines(res.data);
  };

  const rechercher = async () => {
    let url = "/profils/recherche?role=MENTOR";

    if (domaineId) url += `&domaineId=${domaineId}`;
    if (competence) url += `&competence=${competence}`;
    if (secteur) url += `&secteur=${secteur}`;

    const res = await api.get(url);
    setMentors(res.data);
  };

  const envoyerDemande = async (mentorId) => {
    try {
      await api.post(
        `/relations/demande?mentorId=${mentorId}&mentoreId=${user.id}`
      );
      setMessage("Demande envoyée avec succès");
    } catch (error) {
      setMessage("Erreur lors de l'envoi de la demande");
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2>Espace Mentoré</h2>
        <p className="text-muted">
          Bienvenue, {user?.prenom} {user?.nom}
        </p>
        <a
          href="/notifications"
          className="btn btn-outline-primary mb-3"
        >
          Notifications
        </a>
      </div>

      <a href="/mentore/demandes" className="btn btn-outline-primary">
        Mes demandes envoyées
      </a>
    </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5>Rechercher un mentor</h5>

          <div className="row">
            <div className="col-md-4 mb-2">
              <select
                className="form-control"
                value={domaineId}
                onChange={(e) => setDomaineId(e.target.value)}
              >
                <option value="">Tous les domaines</option>
                {domaines.map((domaine) => (
                  <option key={domaine.id} value={domaine.id}>
                    {domaine.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 mb-2">
              <input
                className="form-control"
                placeholder="Compétence"
                value={competence}
                onChange={(e) => setCompetence(e.target.value)}
              />
            </div>

            <div className="col-md-4 mb-2">
              <input
                className="form-control"
                placeholder="Secteur"
                value={secteur}
                onChange={(e) => setSecteur(e.target.value)}
              />
            </div>
          </div>

          <button className="btn btn-primary mt-2" onClick={rechercher}>
            Rechercher
          </button>
        </div>
      </div>

      <h4>Mentors disponibles</h4>

      <div className="row">
        {mentors.map((profil) => (
          <div className="col-md-4 mb-3" key={profil.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5>
                  {profil.utilisateur?.prenom} {profil.utilisateur?.nom}
                </h5>

                <p className="text-muted">{profil.secteur}</p>

                <p>
                  <strong>Domaine :</strong> {profil.domaine?.libelle}
                </p>

                <p>
                  <strong>Compétences :</strong> {profil.competences}
                </p>

                <p>
                  <strong>Expérience :</strong>{" "}
                  {profil.anneesExperiences || 0} ans
                </p>

                <button
                  className="btn btn-success"
                  onClick={() => envoyerDemande(profil.utilisateur.id)}
                >
                  Envoyer demande
                </button>
              </div>
            </div>
          </div>
        ))}

        {mentors.length === 0 && (
          <p className="text-muted">Aucun mentor trouvé.</p>
        )}
      </div>
    </div>
  );
}

export default MentoreHome;