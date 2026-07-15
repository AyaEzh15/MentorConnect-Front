import { useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import "./MentorCard.css";

const GRADIENTS = [
  "mentor-card__banner--primary",
  "mentor-card__banner--secondary",
  "mentor-card__banner--tertiary",
  "mentor-card__banner--primary-soft",
  "mentor-card__banner--teal",
  "mentor-card__banner--amber",
];

function MentorCard({
  profil,
  index = 0,
  topMentor = false,
  onViewProfil,
  onDemander,
  demanderLabel = "Demander",
}) {
  const navigate = useNavigate();
  const utilisateur = profil.utilisateur || {};
  const prenom = utilisateur.prenom || "";
  const nom = utilisateur.nom || "";
  const domaineLabels = (profil.domaines || [])
    .map((d) => d.libelle)
    .filter(Boolean);

  const secteurOuDomaine =
    profil.secteur?.trim() ||
    (domaineLabels.length ? domaineLabels.slice(0, 2).join(" · ") : "Mentor");

  const description =
    profil.biographie?.trim() ||
    (domaineLabels.length
      ? `Accompagnement en ${domaineLabels[0]}${
          profil.anneesExperiences
            ? ` · ${profil.anneesExperiences} ans d'expérience`
            : ""
        }.`
      : "Profil mentor disponible pour vous accompagner.");

  const handleDemander = () => {
    if (onDemander) {
      onDemander(profil);
      return;
    }
    navigate("/login");
  };

  return (
    <article className="mentor-card">
      <div className={`mentor-card__banner ${GRADIENTS[index % GRADIENTS.length]}`}>
        <div className="mentor-card__avatar">
          <UserAvatar
            photoUrl={utilisateur.photoProfil}
            prenom={prenom}
            nom={nom}
            size={72}
            rounded="xl"
          />
        </div>
      </div>

      <div className="mentor-card__body">
        <div className="mentor-card__header">
          <div>
            <h3 className="mentor-card__name">
              {prenom} {nom}
            </h3>
            <p className="mentor-card__title">{secteurOuDomaine}</p>
          </div>
          {topMentor && (
            <span className="mentor-card__badge">Top Mentor</span>
          )}
        </div>

        <p className="mentor-card__bio">{description}</p>

        <div className="mentor-card__tags">
          {domaineLabels.length > 0 ? (
            domaineLabels.slice(0, 4).map((label) => (
              <span key={label} className="mentor-card__tag">
                {label}
              </span>
            ))
          ) : (
            <span className="mentor-card__tag mentor-card__tag--muted">
              Domaine non renseigné
            </span>
          )}
        </div>

        <div className="mentor-card__actions">
          <button
            type="button"
            className="mentor-card__btn mentor-card__btn--outline"
            onClick={() => onViewProfil?.(profil)}
          >
            Voir le profil
          </button>
          <button
            type="button"
            className="mentor-card__btn mentor-card__btn--primary"
            onClick={handleDemander}
          >
            {demanderLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

export default MentorCard;
