import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RapportService from "../../../services/RapportService";
import DashboardService from "../../../services/DashboardService";
import PageHeader from "../../../components/PageHeader";
import LoadingSpinner from "../../../components/LoadingSpinner";
import handleApiError from "../../../utils/handleApiError";
import "./AdminRapports.css";

const TYPE_LABELS = {
  COMPORTEMENT_INAPPROPRIE: "Comportement inapproprié",
  HARCELEMENT: "Harcèlement",
  SPAM: "Spam / pub",
  FAUSSE_IDENTITE: "Fausse identité",
  PROBLEME_TECHNIQUE: "Problème technique",
  AUTRE: "Autre",
};

const STATUT_LABELS = {
  OUVERT: "Ouvert",
  EN_COURS: "En cours",
  RESOLU: "Résolu",
  REJETE: "Rejeté",
};

function AdminRapports() {
  const [rapports, setRapports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filtre, setFiltre] = useState("all");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [rRes, sRes] = await Promise.all([
        RapportService.getAll(),
        DashboardService.getStats(),
      ]);
      setRapports(rRes.data || []);
      setStats(sRes.data || {});
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (filtre === "all") return rapports;
    if (filtre === "actifs") {
      return rapports.filter(
        (r) => r.statut === "OUVERT" || r.statut === "EN_COURS"
      );
    }
    return rapports.filter((r) => r.statut === filtre);
  }, [rapports, filtre]);

  const ouvrirTraitement = (rapport, statutDefaut) => {
    setModal({
      id: rapport.id,
      titre: rapport.titre,
      statut: statutDefaut,
      commentaireAdmin: rapport.commentaireAdmin || "",
    });
  };

  const confirmerTraitement = async () => {
    if (!modal) return;
    try {
      await RapportService.traiter(modal.id, {
        statut: modal.statut,
        commentaireAdmin: modal.commentaireAdmin,
      });
      setMessage("Signalement mis à jour.");
      setModal(null);
      await loadAll();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer définitivement ce signalement ?")) return;
    try {
      await RapportService.delete(id);
      setMessage("Signalement supprimé.");
      setRapports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const telechargerRapportPlateforme = () => {
    const contenu = {
      genereLe: new Date().toISOString(),
      plateforme: "MentorConnect",
      statistiques: {
        utilisateurs: stats.utilisateurs || 0,
        mentors: stats.mentors || 0,
        mentores: stats.mentores || 0,
        relations: stats.relations || 0,
        relationsAcceptees: stats.relationsAcceptees || 0,
        relationsEnAttente: stats.relationsEnAttente || 0,
        rendezVous: stats.rendezvous || 0,
        messages: stats.messages || 0,
        evaluations: stats.evaluations || 0,
        signalements: stats.rapports || 0,
        signalementsOuverts: stats.rapportsOuverts || 0,
        tauxEngagement: `${stats.tauxEngagement || 0}%`,
      },
    };
    const blob = new Blob([JSON.stringify(contenu, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mentorconnect-rapport-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Rapport plateforme téléchargé.");
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des rapports…" />;
  }

  return (
    <div className="mc-page admin-rapports">
      <PageHeader
        title="Rapports & signalements"
        subtitle="Modérez les signalements et exportez un rapport de la plateforme."
        actions={
          <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
            Retour dashboard
          </Link>
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="rapports-summary">
        <article className="rapports-summary__card">
          <p>Signalements totaux</p>
          <strong>{stats.rapports || rapports.length}</strong>
        </article>
        <article className="rapports-summary__card rapports-summary__card--alert">
          <p>À traiter</p>
          <strong>{stats.rapportsOuverts || 0}</strong>
        </article>
        <article className="rapports-summary__card">
          <p>Rapport plateforme</p>
          <button
            type="button"
            className="btn-rapports-export"
            onClick={telechargerRapportPlateforme}
          >
            Exporter JSON
          </button>
        </article>
      </div>

      <section className="rapports-panel">
        <div className="rapports-panel__head">
          <h3>Signalements récents</h3>
          <div className="rapports-filters">
            {[
              { id: "all", label: "Tous" },
              { id: "actifs", label: "À traiter" },
              { id: "OUVERT", label: "Ouverts" },
              { id: "EN_COURS", label: "En cours" },
              { id: "RESOLU", label: "Résolus" },
              { id: "REJETE", label: "Rejetés" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`rapports-chip${
                  filtre === f.id ? " rapports-chip--active" : ""
                }`}
                onClick={() => setFiltre(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted mb-0">
            Aucun signalement. Les mentors et mentorés peuvent en envoyer depuis
            « Signaler ».
          </p>
        ) : (
          <div className="rapports-table-wrap">
            <table className="rapports-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Auteur</th>
                  <th>Cible</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="rapports-title">{r.titre}</div>
                      <div className="rapports-desc">{r.description}</div>
                    </td>
                    <td>
                      <span className="rapports-type">
                        {TYPE_LABELS[r.type] || r.type}
                      </span>
                    </td>
                    <td>{r.signaleParNom || "—"}</td>
                    <td>{r.utilisateurCibleNom || "—"}</td>
                    <td>
                      <span className={`rapports-status rapports-status--${r.statut}`}>
                        {STATUT_LABELS[r.statut] || r.statut}
                      </span>
                    </td>
                    <td>
                      {r.dateCreation
                        ? new Date(r.dateCreation).toLocaleString("fr-FR")
                        : "—"}
                    </td>
                    <td>
                      <div className="rapports-actions">
                        {(r.statut === "OUVERT" || r.statut === "EN_COURS") && (
                          <>
                            <button
                              type="button"
                              className="btn-rapports btn-rapports--primary"
                              onClick={() => ouvrirTraitement(r, "EN_COURS")}
                            >
                              Traiter
                            </button>
                            <button
                              type="button"
                              className="btn-rapports btn-rapports--ok"
                              onClick={() => ouvrirTraitement(r, "RESOLU")}
                            >
                              Résoudre
                            </button>
                            <button
                              type="button"
                              className="btn-rapports btn-rapports--warn"
                              onClick={() => ouvrirTraitement(r, "REJETE")}
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn-rapports btn-rapports--danger"
                          onClick={() => supprimer(r.id)}
                        >
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal && (
        <div
          className="rapports-modal-overlay"
          role="presentation"
          onClick={() => setModal(null)}
        >
          <div
            className="rapports-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Modérer le signalement</h3>
            <p className="rapports-modal__hint">{modal.titre}</p>
            <label className="form-label">Nouveau statut</label>
            <select
              className="form-select mb-3"
              value={modal.statut}
              onChange={(e) =>
                setModal((prev) =>
                  prev ? { ...prev, statut: e.target.value } : prev
                )
              }
            >
              <option value="EN_COURS">En cours</option>
              <option value="RESOLU">Résolu</option>
              <option value="REJETE">Rejeté</option>
            </select>
            <label className="form-label">Commentaire admin</label>
            <textarea
              className="form-control"
              rows={4}
              value={modal.commentaireAdmin}
              onChange={(e) =>
                setModal((prev) =>
                  prev ? { ...prev, commentaireAdmin: e.target.value } : prev
                )
              }
              placeholder="Décision, suite donnée…"
            />
            <div className="rapports-modal__actions">
              <button
                type="button"
                className="btn-rapports"
                onClick={() => setModal(null)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn-rapports btn-rapports--primary"
                onClick={confirmerTraitement}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRapports;
