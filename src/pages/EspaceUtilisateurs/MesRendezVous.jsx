import { useEffect, useMemo, useState } from "react";
import RendezVousService from "../../services/RendezVousService";
import EvaluationService from "../../services/EvaluationService";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import StarRating from "../../components/StarRating";
import handleApiError from "../../utils/handleApiError";
import { getEvaluationConfig } from "../../utils/evaluationConfig";
import {
  canJoinMeeting,
  getEffectiveStatut,
  isHttpUrl,
  resolveMeetingUrl,
} from "../../utils/rendezVousJoin";

function formatRdvDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MesRendezVous() {
  const user = JSON.parse(localStorage.getItem("user"));
  const evalConfig = getEvaluationConfig(user.role);
  const isMentor = user?.role === "MENTOR";

  const [rendezVous, setRendezVous] = useState([]);
  const [evaluationsEnvoyees, setEvaluationsEnvoyees] = useState([]);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(() => new Date());

  const [evalRdv, setEvalRdv] = useState(null);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  // Met à jour le statut / les actions sans recharger la page
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Quand la durée est écoulée, resynchronise avec l'API (clôture auto côté serveur)
  useEffect(() => {
    const aCloturer = rendezVous.some(
      (rdv) =>
        (rdv.statut === "PLANIFIE" || rdv.statut === "CONFIRME") &&
        getEffectiveStatut(rdv, now) === "TERMINE"
    );
    if (!aCloturer) return undefined;

    const sync = setTimeout(() => {
      loadData();
    }, 800);
    return () => clearTimeout(sync);
  }, [now, rendezVous]);

  const loadData = async () => {
    try {
      const [rdvRes, evalRes] = await Promise.all([
        RendezVousService.getRendezVous(),
        EvaluationService.getEvaluationsByEvaluateur(user.id),
      ]);

      const filtered = rdvRes.data.filter((rdv) => {
        const mentorId = rdv.miseEnRelation?.mentor?.id;
        const mentoreId =
          typeof rdv.miseEnRelation?.mentore === "number"
            ? rdv.miseEnRelation.mentore
            : rdv.miseEnRelation?.mentore?.id;

        return mentorId === user.id || mentoreId === user.id;
      });

      setRendezVous(filtered);
      setEvaluationsEnvoyees(evalRes.data);
    } catch (error) {
      setMessage(handleApiError(error));
    }
  };

  const confirmer = async (id) => {
    await RendezVousService.confirmerRendezVous(id);
    loadData();
  };

  const annuler = async (id) => {
    await RendezVousService.annulerRendezVous(id);
    loadData();
  };

  const terminer = async (id) => {
    await RendezVousService.terminerRendezVous(id);
    loadData();
  };

  const getEvalueId = (rdv) => {
    const mentorId = rdv.miseEnRelation?.mentor?.id;
    const mentoreId =
      typeof rdv.miseEnRelation?.mentore === "number"
        ? rdv.miseEnRelation.mentore
        : rdv.miseEnRelation?.mentore?.id;

    if (user.role === "MENTORE") {
      return mentorId;
    }

    if (user.role === "MENTOR") {
      return mentoreId;
    }

    return null;
  };

  const getInterlocuteur = (rdv) => {
    const mentor = rdv.miseEnRelation?.mentor;
    const mentore =
      typeof rdv.miseEnRelation?.mentore === "object"
        ? rdv.miseEnRelation.mentore
        : null;

    if (user.role === "MENTORE") {
      const nom = `${mentor?.prenom || ""} ${mentor?.nom || ""}`.trim();
      return nom || "Mentor inconnu";
    }

    if (user.role === "MENTOR") {
      const nom = `${mentore?.prenom || ""} ${mentore?.nom || ""}`.trim();
      return nom || "Mentoré inconnu";
    }

    return "Interlocuteur";
  };

  const interlocuteurHeader = isMentor ? "Mentoré" : "Mentor";

  const dejaEvalue = (rdvId) =>
    evaluationsEnvoyees.some((evaluation) => evaluation.rendezVousId === rdvId);

  const ouvrirEvaluation = (rdv) => {
    setEvalRdv(rdv);
    setNote(5);
    setCommentaire("");
  };

  const fermerEvaluation = () => {
    setEvalRdv(null);
  };

  const soumettreEvaluation = async () => {
    const evalueId = getEvalueId(evalRdv);

    if (!evalueId) {
      setMessage("Impossible de determiner la personne a evaluer.");
      setEvalRdv(null);
      return;
    }

    try {
      await EvaluationService.createEvaluation(evalRdv.id, user.id, evalueId, {
        note: Number(note),
        commentaire,
      });
      setMessage("Evaluation enregistree avec succes");
      loadData();
    } catch (error) {
      setMessage(handleApiError(error, "Erreur lors de l'evaluation"));
    } finally {
      setEvalRdv(null);
    }
  };

  const columns = useMemo(
    () => [
      { header: "Date", render: (rdv) => formatRdvDate(rdv.dateHeure) },
      {
        header: interlocuteurHeader,
        render: (rdv) => getInterlocuteur(rdv),
      },
      {
        header: "Durée",
        render: (rdv) => (rdv.duree ? `${rdv.duree} min` : "-"),
      },
      { header: "Lieu / lien", render: (rdv) => rdv.lieuReunion || "-" },
      { header: "Notes", render: (rdv) => rdv.notes || "-" },
      {
        header: "Statut",
        render: (rdv) => <StatusBadge statut={getEffectiveStatut(rdv, now)} />,
      },
      {
        header: "Actions",
        render: (rdv) => {
          const statut = getEffectiveStatut(rdv, now);
          const canJoin = canJoinMeeting(rdv, now);
          const nom = getInterlocuteur(rdv);

          if (statut === "ANNULE") {
            return <span className="text-muted">-</span>;
          }

          // Après la fin (auto ou manuelle) : uniquement évaluation
          if (statut === "TERMINE") {
            if (dejaEvalue(rdv.id)) {
              return (
                <span className="badge bg-success">
                  {isMentor ? `Mentoré évalué : ${nom}` : `Mentor évalué : ${nom}`}
                </span>
              );
            }
            return (
              <button
                className={`btn btn-sm ${evalConfig.buttonClass}`}
                onClick={() => ouvrirEvaluation(rdv)}
              >
                {isMentor ? `Évaluer ${nom}` : `Évaluer ${nom}`}
              </button>
            );
          }

          return (
            <>
              {isHttpUrl(rdv.lieuReunion) && canJoin && (
                <a
                  className="btn btn-outline-primary btn-sm me-2"
                  href={resolveMeetingUrl(rdv.lieuReunion)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Rejoindre
                </a>
              )}

              {statut === "PLANIFIE" && (
                <button
                  className="btn btn-primary btn-sm me-2"
                  onClick={() => confirmer(rdv.id)}
                >
                  Confirmer
                </button>
              )}

              {/* Annuler + Terminer : mentor uniquement */}
              {isMentor && (statut === "PLANIFIE" || statut === "CONFIRME") && (
                <button
                  className="btn btn-danger btn-sm me-2"
                  onClick={() => annuler(rdv.id)}
                >
                  Annuler
                </button>
              )}

              {isMentor &&
                (statut === "PLANIFIE" || statut === "CONFIRME") && (
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => terminer(rdv.id)}
                  >
                    Terminer
                  </button>
                )}
            </>
          );
        },
      },
    ],
    [now, evaluationsEnvoyees, evalConfig, isMentor, user.role, interlocuteurHeader]
  );

  return (
    <div className="mc-page">
      <PageHeader
        title="Mes rendez-vous"
        subtitle={
          isMentor
            ? "Vous pouvez annuler ou terminer une session. Sinon elle se clôture automatiquement à la fin de la durée."
            : "Seul le mentor peut annuler un rendez-vous. À la fin de la durée, la session se termine automatiquement."
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <DataTable
        columns={columns}
        data={rendezVous}
        emptyMessage="Aucun rendez-vous trouve."
      />

      {evalRdv && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            onClick={fermerEvaluation}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title">
                      {isMentor
                        ? `Évaluer le mentoré : ${getInterlocuteur(evalRdv)}`
                        : `Évaluer le mentor : ${getInterlocuteur(evalRdv)}`}
                    </h5>
                    <small className="text-muted">
                      Session du {formatRdvDate(evalRdv.dateHeure)}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={fermerEvaluation}
                  ></button>
                </div>

                <div className="modal-body">
                  <p className="text-muted">{evalConfig.subtitle}</p>

                  <div className="mb-3">
                    <span className="text-muted me-2">Criteres :</span>
                    {evalConfig.criteria.map((critere) => (
                      <span
                        key={critere}
                        className="badge bg-light text-dark border me-1 mb-1"
                      >
                        {critere}
                      </span>
                    ))}
                  </div>

                  <label className="form-label d-block">Note globale</label>
                  <div className="mb-3">
                    <StarRating value={note} onChange={setNote} />
                    <span className="ms-2 text-muted">{note} / 5</span>
                  </div>

                  <label className="form-label">Commentaire</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder={evalConfig.placeholder}
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={fermerEvaluation}
                  >
                    Annuler
                  </button>
                  <button
                    className={`btn ${evalConfig.buttonClass}`}
                    onClick={soumettreEvaluation}
                  >
                    Envoyer l'evaluation
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}

export default MesRendezVous;
