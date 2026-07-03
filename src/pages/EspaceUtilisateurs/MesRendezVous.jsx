import { useEffect, useState } from "react";
import RendezVousService from "../../services/RendezVousService";
import EvaluationService from "../../services/EvaluationService";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import StarRating from "../../components/StarRating";
import handleApiError from "../../utils/handleApiError";
import { getEvaluationConfig } from "../../utils/evaluationConfig";

function MesRendezVous() {
  const user = JSON.parse(localStorage.getItem("user"));
  const evalConfig = getEvaluationConfig(user.role);

  const [rendezVous, setRendezVous] = useState([]);
  const [evaluationsEnvoyees, setEvaluationsEnvoyees] = useState([]);
  const [message, setMessage] = useState("");

  const [evalRdv, setEvalRdv] = useState(null);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    loadData();
  }, []);

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
      return mentor ? `${mentor.prenom} ${mentor.nom}` : "votre mentor";
    }

    if (user.role === "MENTOR") {
      return mentore ? `${mentore.prenom} ${mentore.nom}` : "votre mentore";
    }

    return "l'interlocuteur";
  };

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

  const columns = [
    { header: "Date", render: (rdv) => rdv.dateHeure },
    { header: "Lieu / lien", render: (rdv) => rdv.lieuReunion || "-" },
    { header: "Notes", render: (rdv) => rdv.notes || "-" },
    { header: "Statut", render: (rdv) => <StatusBadge statut={rdv.statut} /> },
    {
      header: "Actions",
      render: (rdv) => (
        <>
          {rdv.statut === "PLANIFIE" && (
            <button
              className="btn btn-primary btn-sm me-2"
              onClick={() => confirmer(rdv.id)}
            >
              Confirmer
            </button>
          )}

          {(rdv.statut === "PLANIFIE" || rdv.statut === "CONFIRME") && (
            <button
              className="btn btn-danger btn-sm me-2"
              onClick={() => annuler(rdv.id)}
            >
              Annuler
            </button>
          )}

          {rdv.statut === "CONFIRME" && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => terminer(rdv.id)}
            >
              Terminer
            </button>
          )}

          {rdv.statut === "TERMINE" && !dejaEvalue(rdv.id) && (
            <button
              className={`btn btn-sm ${evalConfig.buttonClass}`}
              onClick={() => ouvrirEvaluation(rdv)}
            >
              {user.role === "MENTORE" ? "Evaluer le mentor" : "Evaluer le mentore"}
            </button>
          )}

          {rdv.statut === "TERMINE" && dejaEvalue(rdv.id) && (
            <span className="badge bg-success">Evalue</span>
          )}

          {rdv.statut === "ANNULE" && <span className="text-muted">-</span>}
        </>
      ),
    },
  ];

  return (
    <div className="container mt-5">
      <PageHeader title="Mes rendez-vous" />

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
                    <h5 className="modal-title">{evalConfig.title}</h5>
                    <small className="text-muted">
                      {getInterlocuteur(evalRdv)} — {evalRdv.dateHeure}
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
