import { useEffect, useState } from "react";
import EvaluationService from "../../services/EvaluationService";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import StarRating from "../../components/StarRating";
import EvaluationTypeBadge from "../../components/EvaluationTypeBadge";
import handleApiError from "../../utils/handleApiError";

function MesEvaluations() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [evaluations, setEvaluations] = useState([]);
  const [moyenne, setMoyenne] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const isMentor = user.role === "MENTOR";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [evalRes, moyRes] = await Promise.all([
        EvaluationService.getEvaluationsByEvalue(user.id),
        isMentor
          ? EvaluationService.getMoyenneMentor(user.id)
          : EvaluationService.getMoyenne(user.id),
      ]);

      setEvaluations(evalRes.data);
      setMoyenne(moyRes.data || 0);
    } catch (error) {
      setMessage(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Type",
      render: (e) => <EvaluationTypeBadge type={e.type} />,
    },
    {
      header: "Evaluateur",
      render: (e) =>
        `${e.evaluateur?.prenom || ""} ${e.evaluateur?.nom || "Anonyme"}`,
    },
    {
      header: "Note",
      render: (e) => <StarRating value={e.note} readOnly size="1.2rem" />,
    },
    { header: "Commentaire", render: (e) => e.commentaire || "-" },
    { header: "Date", render: (e) => e.dateEvaluation || "-" },
  ];

  if (loading) {
    return <LoadingSpinner message="Chargement des evaluations..." />;
  }

  return (
    <div className="mc-page">
      <PageHeader
        title="Mes evaluations"
        subtitle={
          isMentor
            ? "Retours de vos mentores sur la qualite de votre mentorat."
            : "Retours de vos mentors sur votre implication."
        }
      />

      {message && <div className="alert alert-danger">{message}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body text-center">
          <h6 className="text-muted">
            {isMentor ? "Reputation mentor" : "Note moyenne recue"}
          </h6>
          <h2 className="text-warning mb-1">
            {Number(moyenne).toFixed(1)} / 5
          </h2>
          <div>
            <StarRating value={Math.round(moyenne)} readOnly size="1.5rem" />
          </div>
          <small className="text-muted">
            {evaluations.length} evaluation(s) recue(s)
          </small>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={evaluations}
        emptyMessage="Vous n'avez recu aucune evaluation pour le moment."
      />
    </div>
  );
}

export default MesEvaluations;
