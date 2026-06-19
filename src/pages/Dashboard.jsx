import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get("/dashboard/stats");
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Accès refusé. Cette page est réservée à l'administrateur.
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="container mt-5">Chargement...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-2">Dashboard Administrateur</h2>
      <p className="text-muted mb-4">
        Bienvenue, {user.prenom} {user.nom}
      </p>

      <div className="row">
        <StatCard title="Utilisateurs" value={stats.utilisateurs} />
        <StatCard title="Mentors" value={stats.mentors} />
        <StatCard title="Mentorés" value={stats.mentores} />
        <StatCard title="Profils" value={stats.profils} />
        <StatCard title="Domaines" value={stats.domaines} />
        <StatCard title="Relations" value={stats.relations} />
        <StatCard title="Messages" value={stats.messages} />
        <StatCard title="Rendez-vous" value={stats.rendezvous} />
        <StatCard title="Évaluations" value={stats.evaluations} />
        <StatCard title="Notifications" value={stats.notifications} />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="col-md-3 mb-3">
      <div className="card shadow-sm">
        <div className="card-body text-center">
          <h6 className="text-muted">{title}</h6>
          <h2>{value ?? 0}</h2>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;