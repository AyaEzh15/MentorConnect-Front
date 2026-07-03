import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RelationService from "../../../services/RelationService";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import handleApiError from "../../../utils/handleApiError";

function MentorHome() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [relations, setRelations] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRelations();
  }, []);

  const loadRelations = async () => {
    try {
      const res = await RelationService.getRelationsByMentor(user.id);
      setRelations(res.data);
    } catch (error) {
      setMessage(handleApiError(error));
    }
  };

  const accepterDemande = async (id) => {
    try {
      await RelationService.accepterDemande(id);
      setMessage("Demande acceptee avec succes");
      loadRelations();
    } catch (error) {
      setMessage(handleApiError(error, "Erreur lors de l'acceptation"));
    }
  };

  const refuserDemande = async (id) => {
    try {
      await RelationService.refuserDemande(id);
      setMessage("Demande refusee");
      loadRelations();
    } catch (error) {
      setMessage(handleApiError(error, "Erreur lors du refus"));
    }
  };

  const demandesEnAttente = relations.filter((r) => r.statut === "EN_ATTENTE");
  const relationsAcceptees = relations.filter((r) => r.statut === "ACCEPTEE");
  const relationsRefusees = relations.filter(
    (r) => r.statut === "REFUSEE" || r.statut === "REFUSE"
  );

  const mentoreNom = (r) => `${r.mentore?.prenom || ""} ${r.mentore?.nom || ""}`;
  const mentoreEmail = (r) => r.mentore?.email || "Non renseigne";

  const attenteColumns = [
    { header: "Mentore", render: mentoreNom },
    { header: "Email", render: mentoreEmail },
    { header: "Date demande", render: (r) => r.dateDemande || "-" },
    { header: "Statut", render: (r) => <StatusBadge statut={r.statut} /> },
    {
      header: "Actions",
      render: (r) => (
        <>
          <button
            className="btn btn-success btn-sm me-2"
            onClick={() => accepterDemande(r.id)}
          >
            Accepter
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => refuserDemande(r.id)}
          >
            Refuser
          </button>
        </>
      ),
    },
  ];

  const accepteesColumns = [
    { header: "Mentore", render: mentoreNom },
    { header: "Email", render: mentoreEmail },
    { header: "Date demande", render: (r) => r.dateDemande || "-" },
    { header: "Date reponse", render: (r) => r.dateReponse || "-" },
    { header: "Statut", render: (r) => <StatusBadge statut={r.statut} /> },
    {
      header: "Discussion",
      render: (r) => (
        <Link className="btn btn-primary btn-sm" to={`/conversation/${r.id}`}>
          Discussion
        </Link>
      ),
    },
  ];

  const refuseesColumns = [
    { header: "Mentore", render: mentoreNom },
    { header: "Email", render: mentoreEmail },
    { header: "Date demande", render: (r) => r.dateDemande || "-" },
    { header: "Date reponse", render: (r) => r.dateReponse || "-" },
    { header: "Statut", render: (r) => <StatusBadge statut={r.statut} /> },
  ];

  return (
    <div className="container mt-5">
      <PageHeader
        title="Espace Mentor"
        subtitle={`Bienvenue, ${user?.prenom} ${user?.nom}`}
        actions={
          <Link to="/notifications" className="btn btn-outline-primary">
            Notifications
          </Link>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h4 className="mb-3">Demandes recues</h4>
          <DataTable
            columns={attenteColumns}
            data={demandesEnAttente}
            emptyMessage="Aucune demande en attente."
          />
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h4 className="mb-3">Mentores acceptes</h4>
          <DataTable
            columns={accepteesColumns}
            data={relationsAcceptees}
            emptyMessage="Aucune relation acceptee."
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h4 className="mb-3">Mentores refuses</h4>
          <DataTable
            columns={refuseesColumns}
            data={relationsRefusees}
            emptyMessage="Aucune relation refusee."
          />
        </div>
      </div>
    </div>
  );
}

export default MentorHome;
