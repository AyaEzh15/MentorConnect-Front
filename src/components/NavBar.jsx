import { Link, NavLink } from "react-router-dom";

function Navbar({ user, logout }) {
  const activeClass = ({ isActive }) =>
    isActive ? "nav-link active fw-bold" : "nav-link";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to={user ? "/dashboard" : "/login"}>
        MentorConnect
      </Link>

      <div className="navbar-nav me-auto">
        {!user && (
          <>
            <NavLink className={activeClass} to="/login">
              Connexion
            </NavLink>

            <NavLink className={activeClass} to="/register">
              Inscription
            </NavLink>
          </>
        )}

        {user?.role === "ADMIN" && (
          <>
            <NavLink className={activeClass} to="/dashboard">
              Dashboard
            </NavLink>

            <NavLink className={activeClass} to="/admin/utilisateurs">
              Utilisateurs
            </NavLink>

            <NavLink className={activeClass} to="/admin/domaines">
              Domaines
            </NavLink>

            <NavLink className={activeClass} to="/admin/evaluations">
              Evaluations
            </NavLink>
          </>
        )}

        {user?.role === "MENTOR" && (
          <>
            <NavLink className={activeClass} to="/mentor">
              Espace Mentor
            </NavLink>

            <NavLink className={activeClass} to="/mon-profil">
              Mon profil
            </NavLink>

            <NavLink className={activeClass} to="/notifications">
              Notifications
            </NavLink>

            <NavLink className={activeClass} to="/rendez-vous">
              Rendez-vous
            </NavLink>

            <NavLink className={activeClass} to="/evaluations">
              Mes evaluations
            </NavLink>
          </>
        )}

        {user?.role === "MENTORE" && (
          <>
            <NavLink className={activeClass} to="/mentore">
              Chercher mentors
            </NavLink>

            <NavLink className={activeClass} to="/mentore/demandes">
              Mes demandes
            </NavLink>

            <NavLink className={activeClass} to="/mon-profil">
              Mon profil
            </NavLink>

            <NavLink className={activeClass} to="/notifications">
              Notifications
            </NavLink>

            <NavLink className={activeClass} to="/rendez-vous">
              Rendez-vous
            </NavLink>

            <NavLink className={activeClass} to="/evaluations">
              Mes evaluations
            </NavLink>
          </>
        )}
      </div>

      {user && (
        <button className="btn btn-outline-light btn-sm" onClick={logout}>
          Déconnexion
        </button>
      )}
    </nav>
  );
}

export default Navbar;