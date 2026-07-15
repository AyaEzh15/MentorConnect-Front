import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EvaluationService from "../../services/EvaluationService";
import PageHeader from "../../components/PageHeader";
import StarRating from "../../components/StarRating";
import handleApiError from "../../utils/handleApiError";
import { getEvaluationConfig } from "../../utils/evaluationConfig";

function CreateEvaluation() {
  const { rendezVousId, evalueId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const evalConfig = getEvaluationConfig(user.role);

  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [message, setMessage] = useState("");

  const envoyerEvaluation = async (e) => {
    e.preventDefault();

    try {
      await EvaluationService.createEvaluation(rendezVousId, user.id, evalueId, {
        note: Number(note),
        commentaire,
      });

      setMessage("Evaluation envoyee avec succes");

      setTimeout(() => {
        navigate("/rendez-vous");
      }, 1000);
    } catch (error) {
      setMessage(handleApiError(error, "Erreur lors de l'envoi de l'evaluation"));
    }
  };

  return (
    <div className="mc-page mc-page--medium">
      <PageHeader title={evalConfig.title} subtitle={evalConfig.subtitle} />

      {message && <div className="alert alert-info">{message}</div>}

      <div className="mc-section">
      <form onSubmit={envoyerEvaluation}>
        <div className="mb-3">
          <span className="text-muted me-2">Critères :</span>
          {evalConfig.criteria.map((critere) => (
            <span
              key={critere}
              className="mc-badge mc-badge--muted me-1 mb-1"
            >
              {critere}
            </span>
          ))}
        </div>

        <label className="form-label d-block">Note globale / 5</label>
        <div className="mb-3">
          <StarRating value={note} onChange={setNote} />
          <span className="ms-2 text-muted">{note} / 5</span>
        </div>

        <label className="form-label">Commentaire</label>
        <textarea
          className="form-control mb-3"
          name="commentaire"
          placeholder={evalConfig.placeholder}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          required
        />

        <button className={`btn w-100 ${evalConfig.buttonClass}`} type="submit">
          Envoyer l&apos;évaluation
        </button>
      </form>
      </div>
    </div>
  );
}

export default CreateEvaluation;
