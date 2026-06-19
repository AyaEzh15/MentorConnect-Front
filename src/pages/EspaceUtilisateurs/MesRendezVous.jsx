import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

function MesRendezVous() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [rendezVous, setRendezVous] = useState([]);

  useEffect(() => {
    loadRendezVous();
  }, []);

  const loadRendezVous = async () => {
    try {
      const res = await api.get("/rendez-vous");

      const filtered = res.data.filter((rdv) => {
        const mentorId = rdv.miseEnRelation?.mentor?.id;
        const mentoreId =
          typeof rdv.miseEnRelation?.mentore === "number"
            ? rdv.miseEnRelation.mentore
            : rdv.miseEnRelation?.mentore?.id;

        return mentorId === user.id || mentoreId === user.id;
      });

      setRendezVous(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  const confirmer = async (id) => {
    await api.put(`/rendez-vous/${id}/confirmer`);
    loadRendezVous();
  };

  const annuler = async (id) => {
    await api.put(`/rendez-vous/${id}/annuler`);
    loadRendezVous();
  };

  const terminer = async (id) => {
    await api.put(`/rendez-vous/${id}/terminer`);
    loadRendezVous();
  };

  const getBadgeClass = (statut) => {
    if (statut === "PLANIFIE") return "badge bg-warning text-dark";
    if (statut === "CONFIRME") return "badge bg-primary";
    if (statut === "ANNULE") return "badge bg-danger";
    if (statut === "TERMINE") return "badge bg-success";
    return "badge bg-secondary";
  };

  return (
    <div className="container mt-5">
      <h2>Mes rendez-vous</h2>

      {rendezVous.length === 0 ? (
        <div className="alert alert-info mt-3">
          Aucun rendez-vous trouvé.
        </div>
      ) : (
        <table className="table table-bordered table-hover mt-4 align-middle">
          <thead className="table-dark">
            <tr>
              <th>Date</th>
              <th>Lieu / lien</th>
              <th>Notes</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rendezVous.map((rdv) => (
              <tr key={rdv.id}>
                <td>{rdv.dateHeure}</td>
                <td>{rdv.lieuReunion || "-"}</td>
                <td>{rdv.notes || "-"}</td>
                <td>
                  <span className={getBadgeClass(rdv.statut)}>
                    {rdv.statut}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => confirmer(rdv.id)}
                  >
                    Confirmer
                  </button>

                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={() => annuler(rdv.id)}
                  >
                    Annuler
                  </button>

                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => terminer(rdv.id)}
                  >
                    Terminer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MesRendezVous;