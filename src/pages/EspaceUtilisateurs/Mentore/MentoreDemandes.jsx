import { useEffect, useState } from "react";
import api from "../../../api/axiosConfig";

function MentoreDemandes() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [relations, setRelations] = useState([]);

  useEffect(() => {
    loadDemandes();
  }, []);

  const loadDemandes = async () => {
    try {
      const res = await api.get(`/relations/mentore/${user.id}`);
      setRelations(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getBadgeClass = (statut) => {
    if (statut === "EN_ATTENTE") return "badge bg-warning text-dark";
    if (statut === "ACCEPTE" || statut === "ACCEPTEE") return "badge bg-success";
    if (statut === "REFUSEE") return "badge bg-danger";
    return "badge bg-secondary";
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Mes demandes envoyées</h2>
          <p className="text-muted">Suivez le statut de vos demandes.</p>
        </div>

        <a href="/mentore" className="btn btn-outline-secondary">
          Retour
        </a>
      </div>

      {relations.length === 0 ? (
        <div className="alert alert-info">
          Vous n'avez encore envoyé aucune demande.
        </div>
      ) : (
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Mentor</th>
              <th>Email</th>
              <th>Date demande</th>
              <th>Date réponse</th>
              <th>Statut</th>
              <th>Discussion</th>
            </tr>
          </thead>

          <tbody>
            {relations.map((relation) => (
              <tr key={relation.id}>
                <td>
                  {relation.mentor?.prenom} {relation.mentor?.nom}
                </td>
                <td>{relation.mentor?.email || "Non renseigné"}</td>
                <td>{relation.dateDemande || "-"}</td>
                <td>{relation.dateReponse || "Pas encore répondu"}</td>
                <td>
                  <span className={getBadgeClass(relation.statut)}>
                    {relation.statut}
                  </span>
                </td>
                <td>
                  {(relation.statut === "ACCEPTE" ||
                    relation.statut === "ACCEPTEE") && (
                    <a
                      className="btn btn-primary btn-sm"
                      href={`/conversation/${relation.id}`}
                    >
                      Discussion
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MentoreDemandes;