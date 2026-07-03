import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/EspaceUtilisateurs/Admin/Dashboard";
import AdminUtilisateurs from "./pages/EspaceUtilisateurs/Admin/AdminUtilisateurs";
import AdminDomaines from "./pages/EspaceUtilisateurs/Admin/AdminDomaines";
import AdminEvaluations from "./pages/EspaceUtilisateurs/Admin/AdminEvaluations";

import MentoreHome from "./pages/EspaceUtilisateurs/Mentore/MentoreHome";
import MentoreDemandes from "./pages/EspaceUtilisateurs/Mentore/MentoreDemandes";
import MentorHome from "./pages/EspaceUtilisateurs/Mentor/MentorHome";

import Notifications from "./pages/Notifications";
import Conversation from "./pages/Conversation";

import CreateRendezVous from "./pages/EspaceUtilisateurs/CreateRendezVous";
import MesRendezVous from "./pages/EspaceUtilisateurs/MesRendezVous";
import MesEvaluations from "./pages/EspaceUtilisateurs/MesEvaluations";
import CreateEvaluation from "./pages/EspaceUtilisateurs/CreateEvaluation";
import MonProfil from "./pages/EspaceUtilisateurs/MonProfil";

function getCurrentUser() {
  const storedUser = localStorage.getItem("user");

  if (!storedUser || storedUser === "undefined") {
    localStorage.removeItem("user");
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
}

function App() {
  const [user, setUser] = useState(getCurrentUser());

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  const AdminRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (user.role !== "ADMIN") {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  return (
    <BrowserRouter>
      <Navbar user={user} logout={logout} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/utilisateurs"
          element={
            <AdminRoute>
              <AdminUtilisateurs />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/domaines"
          element={
            <AdminRoute>
              <AdminDomaines />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/evaluations"
          element={
            <AdminRoute>
              <AdminEvaluations />
            </AdminRoute>
          }
        />

        <Route
          path="/mentor"
          element={
            <ProtectedRoute>
              <MentorHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentore"
          element={
            <ProtectedRoute>
              <MentoreHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentore/demandes"
          element={
            <ProtectedRoute>
              <MentoreDemandes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/conversation/:relationId"
          element={
            <ProtectedRoute>
              <Conversation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rendez-vous"
          element={
            <ProtectedRoute>
              <MesRendezVous />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rendez-vous/create/:relationId"
          element={
            <ProtectedRoute>
              <CreateRendezVous />
            </ProtectedRoute>
          }
        />

        <Route
          path="/evaluations"
          element={
            <ProtectedRoute>
              <MesEvaluations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/evaluations/create/:rendezVousId/:evalueId"
          element={
            <ProtectedRoute>
              <CreateEvaluation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mon-profil"
          element={
            <ProtectedRoute>
              <MonProfil />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;