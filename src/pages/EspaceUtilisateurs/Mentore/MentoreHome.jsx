import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProfilService from "../../../services/ProfilService";
import DomaineService from "../../../services/DomaineService";
import RelationService from "../../../services/RelationService";
import EvaluationService from "../../../services/EvaluationService";
import PageHeader from "../../../components/PageHeader";
import SearchBar from "../../../components/SearchBar";
import StarRating from "../../../components/StarRating";
import handleApiError from "../../../utils/handleApiError";

function MentoreHome() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [mentors, setMentors] = useState([]);
  const [moyennesMentors, setMoyennesMentors] = useState({});
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
    try {
      const res = await ProfilService.rechercheAvancee({ role: "MENTOR" });
      setMentors(res.data);
      await loadMoyennesMentors(res.data);
    } catch (error) {
      setMessage(handleApiError(error));
    }
  };

  const loadMoyennesMentors = async (mentorsList) => {
    const entries = await Promise.all(
      mentorsList.map(async (profil) => {
        const mentorId = profil.utilisateur?.id;
        if (!mentorId) {
          return [profil.id, 0];
        }

        try {
          const res = await EvaluationService.getMoyenneMentor(mentorId);
          return [mentorId, res.data || 0];
        } catch {
          return [mentorId, 0];
        }
      })
    );

    setMoyennesMentors(Object.fromEntries(entries));
  };

  const loadDomaines = async () => {
    try {
      const res = await DomaineService.getDomaines();
      setDomaines(res.data);
    } catch (error) {
      setMessage(handleApiError(error));
    }
  };

  const rechercher = async () => {
    try {
      const res = await ProfilService.rechercheAvancee({
        role: "MENTOR",
        domaineId,
        competence,
        secteur,
      });
      setMentors(res.data);
      await loadMoyennesMentors(res.data);
    } catch (error) {
      setMessage(handleApiError(error));
    }
  };

  const envoyerDemande = async (mentorId) => {
    try {
      await RelationService.envoyerDemande(mentorId, user.id);
      setMessage("Demande envoyee avec succes");
    } catch (error) {
      setMessage(handleApiError(error, "Erreur lors de l'envoi de la demande"));
    }
  };

  return (
    <div className="container mt-5">
      <PageHeader
        title="Espace Mentore"
        subtitle={`Bienvenue, ${user?.prenom} ${user?.nom}`}
        actions={
          <>
            <Link to="/notifications" className="btn btn-outline-primary">
              Notifications
            </Link>
            <Link to="/mentore/demandes" className="btn btn-outline-primary">
              Mes demandes envoyees
            </Link>
          </>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <SearchBar
        value={competence}
        onChange={setCompetence}
        onSearch={rechercher}
        placeholder="Competence"
      >
        <div className="col-md-3">
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

        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Secteur"
            value={secteur}
            onChange={(e) => setSecteur(e.target.value)}
          />
        </div>
      </SearchBar>

      <h4>Mentors disponibles</h4>

      <div className="row">
        {mentors.map((profil) => {
          const mentorId = profil.utilisateur?.id;
          const moyenne = moyennesMentors[mentorId] || 0;

          return (
          <div className="col-md-4 mb-3" key={profil.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5>
                  {profil.utilisateur?.prenom} {profil.utilisateur?.nom}
                </h5>

                <div className="mb-2">
                  <StarRating
                    value={Math.round(moyenne)}
                    readOnly
                    size="1.1rem"
                  />
                  <small className="text-muted ms-2">
                    {moyenne > 0
                      ? `${Number(moyenne).toFixed(1)} / 5`
                      : "Pas encore evalue"}
                  </small>
                </div>

                <p className="text-muted">{profil.secteur}</p>

                <p>
                  <strong>Domaine :</strong> {profil.domaine?.libelle}
                </p>

                <p>
                  <strong>Competences :</strong> {profil.competences}
                </p>

                <p>
                  <strong>Experience :</strong>{" "}
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
          );
        })}

        {mentors.length === 0 && (
          <p className="text-muted">Aucun mentor trouve.</p>
        )}
      </div>
    </div>
  );
}

export default MentoreHome;
