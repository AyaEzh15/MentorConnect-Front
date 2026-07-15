import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProfilService from "../../../services/ProfilService";
import DomaineService from "../../../services/DomaineService";
import RelationService from "../../../services/RelationService";
import PageHeader from "../../../components/PageHeader";
import SearchBar from "../../../components/SearchBar";
import MentorCard from "../../../components/MentorCard";
import MentorProfileModal from "../../../components/MentorProfileModal";
import handleApiError from "../../../utils/handleApiError";

function MentoreCherche() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [mentors, setMentors] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [domaineId, setDomaineId] = useState("");
  const [competence, setCompetence] = useState("");
  const [secteur, setSecteur] = useState("");
  const [message, setMessage] = useState("");
  const [selectedProfil, setSelectedProfil] = useState(null);

  useEffect(() => {
    loadMentors();
    loadDomaines();
  }, []);

  const loadMentors = async () => {
    try {
      const res = await ProfilService.rechercheAvancee({ role: "MENTOR" });
      setMentors(res.data || []);
    } catch (error) {
      setMessage(handleApiError(error));
    }
  };

  const loadDomaines = async () => {
    try {
      const res = await DomaineService.getDomaines();
      setDomaines(res.data || []);
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
      setMentors(res.data || []);
    } catch (error) {
      setMessage(handleApiError(error));
    }
  };

  const envoyerDemande = async (profil) => {
    try {
      await RelationService.envoyerDemande(profil.utilisateur.id, user.id);
      setMessage("Demande envoyée avec succès");
      setSelectedProfil(null);
    } catch (error) {
      setMessage(handleApiError(error, "Erreur lors de l'envoi de la demande"));
    }
  };

  return (
    <div className="mc-page">
      <PageHeader
        title="Chercher des mentors"
        subtitle={`Bienvenue, ${user?.prenom} ${user?.nom}`}
        actions={
          <>
            <Link to="/mentore" className="btn btn-outline-secondary">
              Tableau de bord
            </Link>
            <Link to="/mentore/demandes" className="btn btn-outline-primary">
              Mes demandes
            </Link>
          </>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <SearchBar
        value={competence}
        onChange={setCompetence}
        onSearch={rechercher}
        placeholder="Compétence"
      >
        <div className="col-md-3">
          <label className="form-label">Domaine</label>
          <select
            className="form-select"
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
          <label className="form-label">Secteur</label>
          <input
            className="form-control"
            placeholder="Secteur"
            value={secteur}
            onChange={(e) => setSecteur(e.target.value)}
          />
        </div>
      </SearchBar>

      {mentors.length === 0 ? (
        <div className="mc-empty">Aucun mentor trouvé.</div>
      ) : (
        <div className="mc-mentor-grid">
          {mentors.map((profil, index) => (
            <MentorCard
              key={profil.id}
              profil={profil}
              index={index}
              topMentor={(Number(profil.anneesExperiences) || 0) >= 10}
              onViewProfil={setSelectedProfil}
              onDemander={envoyerDemande}
              demanderLabel="Envoyer demande"
            />
          ))}
        </div>
      )}

      {selectedProfil && (
        <MentorProfileModal
          profil={selectedProfil}
          onClose={() => setSelectedProfil(null)}
          onDemander={envoyerDemande}
          demanderLabel="Envoyer demande"
        />
      )}
    </div>
  );
}

export default MentoreCherche;
