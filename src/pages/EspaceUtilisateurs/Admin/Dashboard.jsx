import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import DashboardService from "../../../services/DashboardService";
import PageHeader from "../../../components/PageHeader";
import LoadingSpinner from "../../../components/LoadingSpinner";
import handleApiError from "../../../utils/handleApiError";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await DashboardService.getStats();
      setStats(res.data);
    } catch (err) {
      setError(handleApiError(err, "Impossible de charger les statistiques."));
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Acces refuse. Cette page est reservee a l'administrateur.
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Chargement des statistiques..." />;
  }

  const cards = [
    { title: "Utilisateurs", value: stats.utilisateurs, color: "primary" },
    { title: "Mentors", value: stats.mentors, color: "info" },
    { title: "Mentores", value: stats.mentores, color: "success" },
    { title: "Profils", value: stats.profils, color: "secondary" },
    { title: "Domaines", value: stats.domaines, color: "dark" },
    { title: "Relations", value: stats.relations, color: "warning" },
    { title: "Messages", value: stats.messages, color: "primary" },
    { title: "Rendez-vous", value: stats.rendezvous, color: "info" },
    { title: "Evaluations", value: stats.evaluations, color: "success" },
    { title: "Notifications", value: stats.notifications, color: "secondary" },
  ];

  const activiteData = {
    labels: [
      "Relations",
      "Messages",
      "Rendez-vous",
      "Evaluations",
      "Notifications",
    ],
    datasets: [
      {
        label: "Activite de la plateforme",
        data: [
          stats.relations || 0,
          stats.messages || 0,
          stats.rendezvous || 0,
          stats.evaluations || 0,
          stats.notifications || 0,
        ],
        backgroundColor: [
          "#ffc107",
          "#0d6efd",
          "#0dcaf0",
          "#198754",
          "#6c757d",
        ],
        borderRadius: 6,
      },
    ],
  };

  const utilisateursData = {
    labels: ["Mentors", "Mentores", "Autres"],
    datasets: [
      {
        label: "Repartition des utilisateurs",
        data: [
          stats.mentors || 0,
          stats.mentores || 0,
          Math.max(
            (stats.utilisateurs || 0) -
              (stats.mentors || 0) -
              (stats.mentores || 0),
            0
          ),
        ],
        backgroundColor: ["#0dcaf0", "#198754", "#212529"],
      },
    ],
  };

  return (
    <div className="container mt-5">
      <PageHeader
        title="Dashboard Administrateur"
        subtitle={`Bienvenue, ${user.prenom} ${user.nom}`}
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {cards.map((card) => (
          <div className="col-md-3 col-sm-6 mb-3" key={card.title}>
            <div className={`card shadow-sm border-${card.color}`}>
              <div className="card-body text-center">
                <h6 className="text-muted">{card.title}</h6>
                <h2 className={`text-${card.color}`}>{card.value ?? 0}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-4">
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="mb-3">Activite de la plateforme</h5>
              <Bar
                data={activiteData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="mb-3">Repartition des utilisateurs</h5>
              <Doughnut data={utilisateursData} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
