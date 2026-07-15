import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RelationService from "../../../services/RelationService";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import ConfirmDialog from "../../../components/ConfirmDialog";
import handleApiError from "../../../utils/handleApiError";

function MentoreDemandes() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [relations, setRelations] = useState([]);
  const [message, setMessage] = useState("");
  const [confirmRelation, setConfirmRelation] = useState(null);

  useEffect(() => {
    loadDemandes();
  }, []);

  const loadDemandes = async () => {
    try {
      const res = await RelationService.getRelationsByMentore(user.id);
      setRelations(res.data);
    } catch (error) {
      setMessage(handleApiError(error));
    }
  };

  const confirmDelete = async () => {
    try {
      await RelationService.deleteRelation(confirmRelation.id);
      loadDemandes();
    } catch (error) {
      setMessage(handleApiError(error));
    } finally {
      setConfirmRelation(null);
    }
  };

  const isAcceptee = (statut) => statut === "ACCEPTEE";

  const columns = [
    {
      header: "Mentor",
      render: (r) => `${r.mentor?.prenom || ""} ${r.mentor?.nom || ""}`,
    },
    { header: "Email", render: (r) => r.mentor?.email || "Non renseigne" },
    { header: "Date demande", render: (r) => r.dateDemande || "-" },
    {
      header: "Date reponse",
      render: (r) => r.dateReponse || "Pas encore repondu",
    },
    { header: "Statut", render: (r) => <StatusBadge statut={r.statut} /> },
    {
      header: "Actions",
      render: (r) =>
        isAcceptee(r.statut) ? (
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary btn-sm" to={`/conversation/${r.id}`}>
              Discussion
            </Link>
            <Link
              className="btn btn-success btn-sm"
              to={`/relation/${r.id}/suivi`}
            >
              Objectifs & plan
            </Link>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setConfirmRelation(r)}
            >
              Supprimer
            </button>
          </div>
        ) : (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setConfirmRelation(r)}
          >
            Supprimer
          </button>
        ),
    },
  ];

  const messageConfirmation = isAcceptee(confirmRelation?.statut)
    ? "Cette demande est acceptee. La supprimer effacera aussi les rendez-vous et evaluations associes. Continuer ?"
    : "Voulez-vous vraiment supprimer cette demande ?";

  return (
    <div className="mc-page">
      <PageHeader
        title="Mes demandes envoyees"
        subtitle="Suivez le statut de vos demandes."
        actions={
          <Link to="/mentore" className="btn btn-outline-secondary">
            Retour
          </Link>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <DataTable
        columns={columns}
        data={relations}
        emptyMessage="Vous n'avez encore envoye aucune demande."
      />

      <ConfirmDialog
        show={confirmRelation !== null}
        title="Supprimer la demande"
        message={messageConfirmation}
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmRelation(null)}
      />
    </div>
  );
}

export default MentoreDemandes;
