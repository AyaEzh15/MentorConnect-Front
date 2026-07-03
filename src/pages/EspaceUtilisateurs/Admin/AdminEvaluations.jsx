import { useEffect, useState } from "react";
import EvaluationService from "../../../services/EvaluationService";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ConfirmDialog from "../../../components/ConfirmDialog";
import StarRating from "../../../components/StarRating";
import EvaluationTypeBadge from "../../../components/EvaluationTypeBadge";
import handleApiError from "../../../utils/handleApiError";

function AdminEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      const res = await EvaluationService.getEvaluations();
      setEvaluations(res.data);
    } catch (error) {
      setMessage(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await EvaluationService.deleteEvaluation(confirmId);
      loadEvaluations();
    } catch (error) {
      setMessage(handleApiError(error));
    } finally {
      setConfirmId(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    {
      header: "Type",
      render: (e) => <EvaluationTypeBadge type={e.type} />,
    },
    {
      header: "Evaluateur",
      render: (e) => `${e.evaluateur?.prenom || ""} ${e.evaluateur?.nom || "-"}`,
    },
    {
      header: "Evalue",
      render: (e) => `${e.evalue?.prenom || ""} ${e.evalue?.nom || "-"}`,
    },
    {
      header: "Note",
      render: (e) => <StarRating value={e.note} readOnly size="1.2rem" />,
    },
    { header: "Commentaire", render: (e) => e.commentaire || "-" },
    { header: "Date", render: (e) => e.dateEvaluation || "-" },
    {
      header: "Actions",
      render: (e) => (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => setConfirmId(e.id)}
        >
          Supprimer
        </button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Chargement des evaluations..." />;
  }

  return (
    <div className="container mt-5">
      <PageHeader
        title="Gestion des evaluations"
        subtitle="Toutes les evaluations de la plateforme."
      />

      {message && <div className="alert alert-info">{message}</div>}

      <DataTable
        columns={columns}
        data={evaluations}
        emptyMessage="Aucune evaluation enregistree."
      />

      <ConfirmDialog
        show={confirmId !== null}
        title="Supprimer l'evaluation"
        message="Voulez-vous vraiment supprimer cette evaluation ?"
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

export default AdminEvaluations;
