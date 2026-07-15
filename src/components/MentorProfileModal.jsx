import UserAvatar from "./UserAvatar";
import "./MentorProfileModal.css";

function parseCompetences(competences) {
  if (!competences) return [];
  return competences
    .split(/[,;|]/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function MentorProfileModal({
  profil,
  onClose,
  onDemander,
  demanderLabel = "Envoyer demande",
  showDemander = true,
}) {
  if (!profil) return null;

  const utilisateur = profil.utilisateur || {};
  const prenom = utilisateur.prenom || "";
  const nom = utilisateur.nom || "";
  const domaines = (profil.domaines || []).map((d) => d.libelle).filter(Boolean);
  const competences = parseCompetences(profil.competences);

  return (
    <>
      <div
        className="mentor-profile-modal"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className="mentor-profile-modal__dialog"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="mentor-profile-modal__close"
            aria-label="Fermer"
            onClick={onClose}
          >
            ×
          </button>

          <div className="mentor-profile-modal__hero">
            <UserAvatar
              photoUrl={utilisateur.photoProfil}
              prenom={prenom}
              nom={nom}
              size={88}
              rounded="xl"
            />
            <div>
              <h2 className="mentor-profile-modal__name">
                {prenom} {nom}
              </h2>
              <p className="mentor-profile-modal__secteur">
                {profil.secteur || domaines[0] || "Mentor"}
              </p>
            </div>
          </div>

          <div className="mentor-profile-modal__body">
            <section className="mentor-profile-modal__section">
              <h3>À propos</h3>
              <p>
                {profil.biographie?.trim() ||
                  "Aucune biographie renseignée pour le moment."}
              </p>
            </section>

            <section className="mentor-profile-modal__section">
              <h3>Domaines</h3>
              {domaines.length > 0 ? (
                <div className="mentor-profile-modal__chips">
                  {domaines.map((label) => (
                    <span
                      key={label}
                      className="mentor-profile-modal__chip mentor-profile-modal__chip--domaine"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mentor-profile-modal__empty">Non renseignés</p>
              )}
            </section>

            <section className="mentor-profile-modal__section">
              <h3>Compétences</h3>
              {competences.length > 0 ? (
                <div className="mentor-profile-modal__chips">
                  {competences.map((label) => (
                    <span key={label} className="mentor-profile-modal__chip">
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mentor-profile-modal__empty">Non renseignées</p>
              )}
            </section>

            <div className="mentor-profile-modal__grid">
              <div className="mentor-profile-modal__stat">
                <span className="mentor-profile-modal__stat-label">Expérience</span>
                <span className="mentor-profile-modal__stat-value">
                  {profil.anneesExperiences != null
                    ? `${profil.anneesExperiences} an${
                        Number(profil.anneesExperiences) > 1 ? "s" : ""
                      }`
                    : "—"}
                </span>
              </div>
              <div className="mentor-profile-modal__stat">
                <span className="mentor-profile-modal__stat-label">
                  Disponibilités
                </span>
                <span className="mentor-profile-modal__stat-value">
                  {profil.disponibilites?.trim() || "—"}
                </span>
              </div>
            </div>

            {profil.linkedinUrl && (
              <section className="mentor-profile-modal__section">
                <h3>LinkedIn</h3>
                <a
                  href={profil.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mentor-profile-modal__link"
                >
                  Voir le profil LinkedIn
                </a>
              </section>
            )}
          </div>

          <div className="mentor-profile-modal__footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Fermer
            </button>
            {showDemander && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => onDemander?.(profil)}
              >
                {demanderLabel}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mentor-profile-modal__backdrop" />
    </>
  );
}

export default MentorProfileModal;
