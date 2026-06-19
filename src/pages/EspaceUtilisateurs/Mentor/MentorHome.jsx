import { useEffect, useState } from "react";
import api from "../../../api/axiosConfig";

function MentorHome() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [relations, setRelations] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRelations();
  }, []);

  const loadRelations = async () => {
    try {
      const res = await api.get(`/relations/mentor/${user.id}`);
      setRelations(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const accepterDemande = async (id) => {
    try {
      await api.put(`/relations/demande/${id}/accepter`);
      setMessage("Demande acceptée avec succès");
      loadRelations();
    } catch (error) {
      setMessage("Erreur lors de l'acceptation");
    }
  };

  const refuserDemande = async (id) => {
    try {
      await api.put(`/relations/demande/${id}/refuser`);
      setMessage("Demande refusée");
      loadRelations();
    } catch (error) {
      setMessage("Erreur lors du refus");
    }
  };

  const getBadgeClass = (statut) => {
    if (statut === "EN_ATTENTE") return "badge bg-warning text-dark";
    if (statut === "ACCEPTE" || statut === "ACCEPTEE") return "badge bg-success";
    if (statut === "REFUSEE") return "badge bg-danger";
    return "badge bg-secondary";
  };

  const demandesEnAttente = relations.filter((r) => r.statut === "EN_ATTENTE");
  const relationsAcceptees = relations.filter(
    (r) => r.statut === "ACCEPTE" || r.statut === "ACCEPTEE"
  );
  const relationsRefusees = relations.filter((r) => r.statut === "REFUSEE" || r.statut === "REFUSE");

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Espace Mentor</h2>
          <p className="text-muted">
            Bienvenue, {user?.prenom} {user?.nom}
          </p>
        </div>

        <a href="/notifications" className="btn btn-outline-primary">
          Notifications
        </a>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h4>Demandes reçues</h4>

          {demandesEnAttente.length === 0 ? (
            <p className="text-muted">Aucune demande en attente.</p>
          ) : (
            <table className="table table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Mentoré</th>
                  <th>Email</th>
                  <th>Date demande</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {demandesEnAttente.map((relation) => (
                  <tr key={relation.id}>
                    <td>
                      {relation.mentore?.prenom} {relation.mentore?.nom}
                    </td>
                    <td>{relation.mentore?.email || "Non renseigné"}</td>
                    <td>{relation.dateDemande || "-"}</td>
                    <td>
                      <span className={getBadgeClass(relation.statut)}>
                        {relation.statut}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => accepterDemande(relation.id)}
                      >
                        Accepter
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => refuserDemande(relation.id)}
                      >
                        Refuser
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h4>Mentorés acceptés</h4>

          {relationsAcceptees.length === 0 ? (
            <p className="text-muted">Aucune relation acceptée.</p>
          ) : (
            <table className="table table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Mentoré</th>
                  <th>Email</th>
                  <th>Date demande</th>
                  <th>Date réponse</th>
                  <th>Statut</th>
                  <th>Discussion</th>
                </tr>
              </thead>

              <tbody>
                {relationsAcceptees.map((relation) => (
                  <tr key={relation.id}>
                    <td>
                      {relation.mentore?.prenom} {relation.mentore?.nom}
                    </td>
                    <td>{relation.mentore?.email || "Non renseigné"}</td>
                    <td>{relation.dateDemande || "-"}</td>
                    <td>{relation.dateReponse || "-"}</td>
                    <td>
                      <span className={getBadgeClass(relation.statut)}>
                        {relation.statut}
                      </span>
                    </td>
                    <td>
                      <a
                        className="btn btn-primary btn-sm"
                        href={`/conversation/${relation.id}`}
                      >
                        Discussion
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <br/>
      
      <div className="card">
        <div className="card-body">
          <h4>Mentorés refusés</h4>

          {relationsRefusees.length === 0 ? (
            <p className="text-muted">Aucune relation refusée.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Mentoré</th>
                    <th>Email</th>
                    <th>Date demande</th>
                    <th>Date réponse</th>
                    <th>Statut</th>
                  </tr>
                </thead>

                <tbody>
                  {relationsRefusees.map((relation) => (
                    <tr key={relation.id}>
                      <td>
                        {relation.mentore?.prenom} {relation.mentore?.nom}
                      </td>
                      <td>{relation.mentore?.email || "Non renseigné"}</td>
                      <td>{relation.dateDemande || "-"}</td>
                      <td>{relation.dateReponse || "-"}</td>
                      <td>
                        <span className={getBadgeClass(relation.statut)}>
                          {relation.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MentorHome;