import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RelationService from "../../../services/RelationService";
import RendezVousService from "../../../services/RendezVousService";
import UserAvatar from "../../../components/UserAvatar";
import handleApiError from "../../../utils/handleApiError";
import {
  getJoinLabel,
  isHttpUrl,
  isRdvUpcomingOrOngoing,
  resolveMeetingUrl,
} from "../../../utils/rendezVousJoin";
import "../Mentore/MentoreHome.css";

const GOAL_SESSIONS = 12;

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date) {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeRange(date, dureeMinutes = 60) {
  const start = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endDate = new Date(date.getTime() + (dureeMinutes || 60) * 60 * 1000);
  const end = endDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const offsetHours = -date.getTimezoneOffset() / 60;
  const gmt =
    offsetHours >= 0 ? `GMT+${offsetHours}` : `GMT${offsetHours}`;
  return `${start} - ${end} (${gmt})`;
}

function MentorHome() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [relations, setRelations] = useState([]);
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (user?.id) {
      loadDashboard();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [relRes, rdvRes] = await Promise.all([
        RelationService.getRelationsByMentor(user.id),
        RendezVousService.getRendezVous(),
      ]);

      setRelations(relRes.data || []);

      const myRdv = (rdvRes.data || []).filter((rdv) => {
        const mentoreId =
          typeof rdv.miseEnRelation?.mentore === "number"
            ? rdv.miseEnRelation.mentore
            : rdv.miseEnRelation?.mentore?.id;
        const mentorId = rdv.miseEnRelation?.mentor?.id;
        return mentoreId === user.id || mentorId === user.id;
      });

      setRendezVous(myRdv);
    } catch (err) {
      setError(handleApiError(err, "Impossible de charger le tableau de bord"));
    } finally {
      setLoading(false);
    }
  };

  const accepterDemande = async (id) => {
    try {
      await RelationService.accepterDemande(id);
      setMessage("Demande acceptée.");
      loadDashboard();
    } catch (err) {
      setMessage(handleApiError(err, "Erreur lors de l'acceptation"));
    }
  };

  const refuserDemande = async (id) => {
    try {
      await RelationService.refuserDemande(id);
      setMessage("Demande refusée.");
      loadDashboard();
    } catch (err) {
      setMessage(handleApiError(err, "Erreur lors du refus"));
    }
  };

  const prochainRdv = useMemo(() => {
    return (rendezVous || [])
      .filter((rdv) => isRdvUpcomingOrOngoing(rdv, now))
      .sort(
        (a, b) =>
          parseDate(a.dateHeure).getTime() - parseDate(b.dateHeure).getTime()
      )[0] || null;
  }, [rendezVous, now]);

  const sessionsCeMois = useMemo(() => {
    const d = now;
    return rendezVous.filter((rdv) => {
      if (rdv.statut !== "TERMINE") return false;
      const date = parseDate(rdv.dateHeure);
      return (
        date &&
        date.getMonth() === d.getMonth() &&
        date.getFullYear() === d.getFullYear()
      );
    }).length;
  }, [rendezVous, now]);

  const sessionsTerminees = useMemo(
    () => rendezVous.filter((rdv) => rdv.statut === "TERMINE").length,
    [rendezVous]
  );

  const demandesEnAttente = useMemo(
    () =>
      relations.filter(
        (r) => r.statut === "EN_ATTENTE" || r.statut === "ENATTENTE"
      ),
    [relations]
  );

  const connexions = useMemo(
    () => relations.filter((r) => r.statut === "ACCEPTEE"),
    [relations]
  );

  const progressSessions = Math.min(
    100,
    Math.round((sessionsTerminees / GOAL_SESSIONS) * 100)
  );

  const mentoreDuRdv =
    typeof prochainRdv?.miseEnRelation?.mentore === "object"
      ? prochainRdv.miseEnRelation.mentore
      : null;
  const rdvDate = prochainRdv ? parseDate(prochainRdv.dateHeure) : null;
  const rdvTitle =
    prochainRdv?.notes?.trim() ||
    `Session avec ${mentoreDuRdv?.prenom || "votre mentoré"}`;
  const joinInfo = prochainRdv ? getJoinLabel(prochainRdv, now) : null;

  if (loading) {
    return (
      <div className="mentore-dash">
        <div className="mentore-dash__container">
          <p className="dash-card__empty">Chargement du tableau de bord…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mentore-dash">
      <div className="mentore-dash__container">
        {error && (
          <p className="dash-card__empty" style={{ color: "#ba1a1a", marginBottom: 24 }}>
            {error}
          </p>
        )}
        {message && (
          <p className="dash-card__empty" style={{ color: "#006c49", marginBottom: 24 }}>
            {message}
          </p>
        )}

        <section className="mentore-dash__welcome">
          <div>
            <h1 className="mentore-dash__title">
              Bon retour, {user?.prenom || "mentor"}
            </h1>
            <p className="mentore-dash__subtitle">
              Vous avez animé{" "}
              <strong>
                {sessionsCeMois} session{sessionsCeMois > 1 ? "s" : ""}
              </strong>{" "}
              ce mois-ci.
              {demandesEnAttente.length > 0 && (
                <>
                  {" "}
                  {demandesEnAttente.length} demande
                  {demandesEnAttente.length > 1 ? "s" : ""} en attente.
                </>
              )}
            </p>
          </div>
          <div className="mentore-dash__badge">
            <span className="material-symbols-outlined">psychology</span>
            <span>Espace mentor</span>
          </div>
        </section>

        <div className="mentore-dash__grid">
          <div className="mentore-dash__main">
            <article className="rdv-card">
              {prochainRdv ? (
                <>
                  <span className="rdv-card__badge">À venir</span>
                  <div className="rdv-card__content">
                    <div className="rdv-card__avatar">
                      <UserAvatar
                        photoUrl={mentoreDuRdv?.photoProfil}
                        prenom={mentoreDuRdv?.prenom}
                        nom={mentoreDuRdv?.nom}
                        size={80}
                        rounded="xl"
                      />
                    </div>

                    <div className="rdv-card__info">
                      <p className="rdv-card__eyebrow">Prochain rendez-vous</p>
                      <h2 className="rdv-card__title">{rdvTitle}</h2>
                      <p className="rdv-card__with">
                        avec {mentoreDuRdv?.prenom} {mentoreDuRdv?.nom}
                      </p>
                      <div className="rdv-card__meta">
                        <div className="rdv-card__meta-item">
                          <span className="material-symbols-outlined">
                            calendar_today
                          </span>
                          <span>{formatDate(rdvDate)}</span>
                        </div>
                        <div className="rdv-card__meta-item">
                          <span className="material-symbols-outlined">
                            schedule
                          </span>
                          <span>
                            {formatTimeRange(rdvDate, prochainRdv.duree)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isHttpUrl(prochainRdv.lieuReunion) && joinInfo?.canJoin ? (
                      <a
                        className="rdv-card__cta"
                        href={resolveMeetingUrl(prochainRdv.lieuReunion)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="material-symbols-outlined">
                          videocam
                        </span>
                        {joinInfo.label}
                      </a>
                    ) : isHttpUrl(prochainRdv.lieuReunion) ? (
                      <span className="rdv-card__cta rdv-card__cta--disabled">
                        <span className="material-symbols-outlined">
                          schedule
                        </span>
                        {joinInfo?.label}
                      </span>
                    ) : (
                      <Link className="rdv-card__cta" to="/rendez-vous">
                        <span className="material-symbols-outlined">
                          event
                        </span>
                        Voir le rendez-vous
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <div className="rdv-card__empty">
                  <p className="rdv-card__eyebrow">Prochain rendez-vous</p>
                  <h2 className="rdv-card__empty-title">
                    Aucun rendez-vous à venir
                  </h2>
                  <p className="rdv-card__empty-text">
                    Planifiez une session depuis une discussion avec un mentoré.
                  </p>
                  <Link className="rdv-card__cta" to="/rendez-vous">
                    <span className="material-symbols-outlined">event</span>
                    Mes rendez-vous
                  </Link>
                </div>
              )}
            </article>

            <div className="mentore-dash__row">
              <div className="dash-card">
                <div className="dash-card__header">
                  <h3 className="dash-card__title">Demandes reçues</h3>
                  {demandesEnAttente.length > 0 && (
                    <span className="dash-card__chip">
                      {demandesEnAttente.length} en cours
                    </span>
                  )}
                </div>

                <div className="dash-card__list">
                  {demandesEnAttente.slice(0, 4).map((relation) => (
                    <div className="dash-card__item" key={relation.id}>
                      <div className="dash-card__person">
                        <div className="dash-card__avatar-sm">
                          <UserAvatar
                            photoUrl={relation.mentore?.photoProfil}
                            prenom={relation.mentore?.prenom}
                            nom={relation.mentore?.nom}
                            size={40}
                          />
                        </div>
                        <div>
                          <p className="dash-card__name">
                            {relation.mentore?.prenom} {relation.mentore?.nom}
                          </p>
                          <p className="dash-card__meta">
                            {relation.dateDemande
                              ? `Demandé le ${relation.dateDemande}`
                              : "En attente de votre réponse"}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => accepterDemande(relation.id)}
                        >
                          Accepter
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => refuserDemande(relation.id)}
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}

                  {demandesEnAttente.length === 0 && (
                    <p className="dash-card__empty">
                      Aucune demande en attente.
                    </p>
                  )}
                </div>
              </div>

              <div className="dash-card">
                <h3 className="dash-card__title" style={{ marginBottom: 16 }}>
                  Activité mentorat
                </h3>

                <div className="progress-block">
                  <div className="progress-block__labels">
                    <span className="progress-block__label">
                      Objectif : {GOAL_SESSIONS} sessions
                    </span>
                    <span className="progress-block__value">
                      {sessionsTerminees}/{GOAL_SESSIONS}
                    </span>
                  </div>
                  <div className="progress-block__bar">
                    <div
                      className="progress-block__fill progress-block__fill--secondary"
                      style={{ width: `${progressSessions}%` }}
                    />
                  </div>
                </div>

                <div className="progress-block">
                  <div className="progress-block__labels">
                    <span className="progress-block__label">
                      Mentorés accompagnés
                    </span>
                    <span className="progress-block__value">
                      {connexions.length}
                    </span>
                  </div>
                  <div className="progress-block__bar">
                    <div
                      className="progress-block__fill progress-block__fill--primary"
                      style={{
                        width: `${Math.min(100, connexions.length * 25)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="progress-stats">
                  <div className="progress-stats__item">
                    <p className="progress-stats__value progress-stats__value--primary">
                      {sessionsTerminees}
                    </p>
                    <p className="progress-stats__label">Sessions</p>
                  </div>
                  <div className="progress-stats__item">
                    <p className="progress-stats__value progress-stats__value--secondary">
                      {connexions.length}
                    </p>
                    <p className="progress-stats__label">Mentorés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="mentore-dash__aside">
            <div className="dash-card">
              <div className="dash-card__header">
                <h3 className="dash-card__title">Mentorés</h3>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#757684" }}
                >
                  more_horiz
                </span>
              </div>

              <div className="dash-card__list">
                {connexions.slice(0, 5).map((relation) => (
                  <div className="connection-item" key={relation.id}>
                    <div className="connection-item__info">
                      <div className="connection-item__avatar-wrap">
                        <div className="dash-card__avatar-md">
                          <UserAvatar
                            photoUrl={relation.mentore?.photoProfil}
                            prenom={relation.mentore?.prenom}
                            nom={relation.mentore?.nom}
                            size={48}
                          />
                        </div>
                        <span className="connection-item__online" />
                      </div>
                      <div>
                        <p className="dash-card__name">
                          {relation.mentore?.prenom} {relation.mentore?.nom}
                        </p>
                        <p className="dash-card__meta">Mentoré</p>
                      </div>
                    </div>
                    <Link
                      className="connection-item__chat"
                      to={`/conversation/${relation.id}`}
                      aria-label="Ouvrir la discussion"
                    >
                      <span className="material-symbols-outlined">
                        chat_bubble
                      </span>
                    </Link>
                  </div>
                ))}

                {connexions.length === 0 && (
                  <p className="dash-card__empty">
                    Aucun mentoré accepté pour le moment.
                  </p>
                )}
              </div>

              <Link className="dash-card__btn" to="/rendez-vous">
                Voir mes rendez-vous
              </Link>
            </div>

            <div className="resources-card">
              <div className="resources-card__icon">
                <span className="material-symbols-outlined">reviews</span>
              </div>
              <h3 className="resources-card__title">Retours & suivi</h3>
              <p className="resources-card__text">
                Consultez les évaluations reçues et suivez la progression de vos
                mentorés.
              </p>
              <Link className="resources-card__link" to="/evaluations">
                Voir mes évaluations
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  arrow_forward
                </span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default MentorHome;
