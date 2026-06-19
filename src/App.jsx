import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import MentoreHome from "./pages/EspaceUtilisateurs/Mentore/MentoreHome";
import MentoreDemandes from "./pages/EspaceUtilisateurs/Mentore/MentoreDemandes";
import MentorHome from "./pages/EspaceUtilisateurs/Mentor/MentorHome";

import Notifications from "./pages/Notifications";
import Conversation from "./pages/Conversation";

import CreateRendezVous from "./pages/EspaceUtilisateurs/CreateRendezVous";
import MesRendezVous from "./pages/EspaceUtilisateurs/MesRendezVous";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const AdminRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    if (user.role !== "ADMIN") return <Navigate to="/login" />;
    return children;
  };

  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <Link className="navbar-brand" to="/">
          MentorConnect
        </Link>

        <div className="navbar-nav me-auto">
          {!user && (
            <>
              <Link className="nav-link" to="/login">
                Connexion
              </Link>
              <Link className="nav-link" to="/register">
                Inscription
              </Link>
            </>
          )}

          {user?.role === "ADMIN" && (
            <Link className="nav-link" to="/dashboard">
              Dashboard
            </Link>
          )}

          {user?.role === "MENTOR" && (
            <>
              <Link className="nav-link" to="/mentor">
                Espace Mentor
              </Link>

              <Link className="nav-link" to="/notifications">
                Notifications
              </Link>

              <Link className="nav-link" to="/rendez-vous">
                Rendez-vous
              </Link>
            </>
          )}

          {user?.role === "MENTORE" && (
            <>
              <Link className="nav-link" to="/mentore">
                Chercher mentors
              </Link>

              <Link className="nav-link" to="/mentore/demandes">
                Mes demandes
              </Link>

              <Link className="nav-link" to="/notifications">
                Notifications
              </Link>

              <Link className="nav-link" to="/rendez-vous">
                Rendez-vous
              </Link>
            </>
          )}
        </div>

        {user && (
          <button className="btn btn-outline-light btn-sm" onClick={logout}>
            Déconnexion
          </button>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />

        <Route path="/mentor" element={<MentorHome />} />
        <Route path="/mentore" element={<MentoreHome />} />
        <Route path="/mentore/demandes" element={<MentoreDemandes />} />

        <Route path="/notifications" element={<Notifications />} />
        <Route path="/conversation/:relationId" element={<Conversation />} />

        <Route path="/rendez-vous" element={<MesRendezVous />} />
        <Route
          path="/rendez-vous/create/:relationId"
          element={<CreateRendezVous />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;