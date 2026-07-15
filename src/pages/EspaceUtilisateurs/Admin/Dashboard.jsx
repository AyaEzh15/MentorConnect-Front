import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import DashboardService from "../../../services/DashboardService";
import RelationService from "../../../services/RelationService";
import PageHeader from "../../../components/PageHeader";
import LoadingSpinner from "../../../components/LoadingSpinner";
import handleApiError from "../../../utils/handleApiError";
import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const STATUT_LABEL = {
  EN_ATTENTE: "En attente",
  ACCEPTEE: "Acceptée",
  REFUSEE: "Refusée",
};

function initials(prenom, nom) {
  return `${(prenom || "?")[0] || "?"}${(nom || "?")[0] || "?"}`.toUpperCase();
}

function Dashboard() {
  const [stats, setStats] = useState({});
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statutFilter, setStatutFilter] = useState("all");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, relRes] = await Promise.all([
        DashboardService.getStats(),
        RelationService.getRelations(),
      ]);
      setStats(statsRes.data || {});
      setRelations(relRes.data || []);
    } catch (err) {
      setError(handleApiError(err, "Impossible de charger le tableau de bord."));
    } finally {
      setLoading(false);
    }
  };

  const filteredRelations = useMemo(() => {
    const list = [...relations].sort((a, b) => (b.id || 0) - (a.id || 0));
    if (statutFilter === "all") return list.slice(0, 12);
    return list.filter((r) => r.statut === statutFilter).slice(0, 12);
  }, [relations, statutFilter]);

  const chartData = useMemo(() => {
    const labels = [
      "Relations",
      "Messages",
      "Rendez-vous",
      "Évaluations",
      "Notifications",
    ];
    return {
      labels,
      datasets: [
        {
          label: "Volumes",
          data: [
            stats.relations || 0,
            stats.messages || 0,
            stats.rendezvous || 0,
            stats.evaluations || 0,
            stats.notifications || 0,
          ],
          borderColor: "#00288e",
          backgroundColor: "rgba(0, 40, 142, 0.12)",
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#00288e",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Relations actives",
          data: Array(5).fill(stats.relationsAcceptees || 0),
          borderColor: "#006c49",
          backgroundColor: "transparent",
          fill: false,
          tension: 0.2,
          borderDash: [6, 4],
          pointBackgroundColor: "#006c49",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [stats]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mc-page">
        <div className="alert alert-danger">
          Accès refusé. Cette page est réservée à l&apos;administrateur.
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Chargement du tableau de bord…" />;
  }

  const mentors = stats.mentors || 0;
  const mentores = stats.mentores || 0;
  const utilisateurs = stats.utilisateurs || 0;
  const enAttente = stats.relationsEnAttente || 0;
  const taux = stats.tauxEngagement || 0;

  return (
    <div className="mc-page admin-dashboard">
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bienvenue ${user.prenom || ""}, aperçu global de la plateforme de mentorat.`}
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-kpi-grid">
        <article className="admin-kpi-card">
          <div className="admin-kpi-card__top">
            <span className="admin-kpi-icon admin-kpi-icon--blue" aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </span>
            <span className="admin-kpi-trend admin-kpi-trend--ok">Actifs</span>
          </div>
          <p className="admin-kpi-label">Utilisateurs totaux</p>
          <h3 className="admin-kpi-value">{utilisateurs}</h3>
          <p className="admin-kpi-sub">
            {mentors} mentors · {mentores} mentorés
          </p>
        </article>

        <article className="admin-kpi-card">
          <div className="admin-kpi-card__top">
            <span className="admin-kpi-icon admin-kpi-icon--green" aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
            </span>
            <span className="admin-kpi-trend admin-kpi-trend--ok">Sessions</span>
          </div>
          <p className="admin-kpi-label">Rendez-vous</p>
          <h3 className="admin-kpi-value">{stats.rendezvous || 0}</h3>
          <p className="admin-kpi-sub">
            {stats.relationsAcceptees || 0} relations actives
          </p>
        </article>

        <article className="admin-kpi-card">
          <div className="admin-kpi-card__top">
            <span className="admin-kpi-icon admin-kpi-icon--warn" aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
            </span>
            <span className="admin-kpi-trend admin-kpi-trend--alert">
              {enAttente > 0 ? "À traiter" : "OK"}
            </span>
          </div>
          <p className="admin-kpi-label">Demandes en attente</p>
          <h3 className="admin-kpi-value">{enAttente}</h3>
          <p className="admin-kpi-sub">Relations mentor / mentoré à valider</p>
        </article>

        <article className="admin-kpi-card">
          <div className="admin-kpi-card__top">
            <span className="admin-kpi-icon admin-kpi-icon--chart" aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
              </svg>
            </span>
            <span className="admin-kpi-trend admin-kpi-trend--ok">Engagement</span>
          </div>
          <p className="admin-kpi-label">Taux d&apos;engagement</p>
          <h3 className="admin-kpi-value">{taux}%</h3>
          <div className="admin-kpi-progress">
            <div style={{ width: `${Math.min(taux, 100)}%` }} />
          </div>
          <p className="admin-kpi-sub">Relations acceptées / utilisateurs</p>
        </article>
      </div>

      <div className="admin-mid-grid">
        <section className="admin-panel admin-panel--chart">
          <div className="admin-panel__head">
            <h3>Volumes d&apos;activité</h3>
            <div className="admin-chart-legend">
              <span>
                <i className="admin-dot admin-dot--blue" /> Volumes
              </span>
              <span>
                <i className="admin-dot admin-dot--green" /> Relations actives
              </span>
            </div>
          </div>
          <div className="admin-chart-wrap">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: "#757684" },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: "#eef1f8" },
                    ticks: { color: "#757684", precision: 0 },
                  },
                },
              }}
            />
          </div>
        </section>

        <aside className="admin-panel admin-panel--actions">
          <h3>Actions rapides</h3>
          <div className="admin-actions">
            <Link to="/admin/utilisateurs" className="admin-action">
              <span className="admin-action__icon admin-action__icon--blue">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </span>
              <span className="admin-action__label">Gérer les utilisateurs</span>
              <span className="admin-action__chev" aria-hidden>
                ›
              </span>
            </Link>
            <Link to="/admin/domaines" className="admin-action">
              <span className="admin-action__icon admin-action__icon--green">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.25 6 2.25v4.78z" />
                </svg>
              </span>
              <span className="admin-action__label">Gérer les domaines</span>
              <span className="admin-action__chev" aria-hidden>
                ›
              </span>
            </Link>
            <Link to="/admin/evaluations" className="admin-action">
              <span className="admin-action__icon admin-action__icon--neutral">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </span>
              <span className="admin-action__label">Voir les évaluations</span>
              <span className="admin-action__chev" aria-hidden>
                ›
              </span>
            </Link>
            <Link to="/admin/rapports" className="admin-action">
              <span className="admin-action__icon admin-action__icon--warn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3s.58-1.3 1.3-1.3 1.3.58 1.3 1.3-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z" />
                </svg>
              </span>
              <span className="admin-action__label">
                Rapports
                {(stats.rapportsOuverts || 0) > 0
                  ? ` (${stats.rapportsOuverts} à traiter)`
                  : ""}
              </span>
              <span className="admin-action__chev" aria-hidden>
                ›
              </span>
            </Link>
          </div>
          <div className="admin-hint">
            <strong>{stats.evaluations || 0}</strong> évaluation(s) ·{" "}
            <strong>{stats.rapportsOuverts || 0}</strong> signalement(s) ouvert(s) ·{" "}
            <strong>{stats.messages || 0}</strong> message(s)
          </div>
        </aside>
      </div>

      <section className="admin-panel admin-panel--table">
        <div className="admin-panel__head">
          <h3>Relations de mentorat</h3>
          <div className="admin-table-filters">
            {[
              { id: "all", label: "Toutes" },
              { id: "EN_ATTENTE", label: "En attente" },
              { id: "ACCEPTEE", label: "Acceptées" },
              { id: "REFUSEE", label: "Refusées" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`admin-chip${
                  statutFilter === f.id ? " admin-chip--active" : ""
                }`}
                onClick={() => setStatutFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredRelations.length === 0 ? (
          <p className="text-muted mb-0 px-1">Aucune relation à afficher.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Mentoré</th>
                  <th>Statut</th>
                  <th>Date demande</th>
                </tr>
              </thead>
              <tbody>
                {filteredRelations.map((rel) => (
                  <tr key={rel.id}>
                    <td>
                      <div className="admin-person">
                        <span className="admin-avatar">
                          {initials(rel.mentor?.prenom, rel.mentor?.nom)}
                        </span>
                        <span>
                          {rel.mentor?.prenom || ""} {rel.mentor?.nom || ""}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-person">
                        <span className="admin-avatar admin-avatar--alt">
                          {initials(rel.mentore?.prenom, rel.mentore?.nom)}
                        </span>
                        <span>
                          {rel.mentore?.prenom || ""} {rel.mentore?.nom || ""}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-status admin-status--${rel.statut}`}
                      >
                        {STATUT_LABEL[rel.statut] || rel.statut}
                      </span>
                    </td>
                    <td className="admin-date">
                      {rel.dateDemande
                        ? new Date(rel.dateDemande).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
