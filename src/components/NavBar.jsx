import { useCallback, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import NotificationService from "../services/NotificationService";
import UserAvatar from "./UserAvatar";
import {
  EVENT_CHANGED,
  EVENT_REALTIME,
  startNotificationSocket,
  stopNotificationSocket,
} from "../utils/notificationSocket";
import "./Navbar.css";

function formatNotifCount(count) {
  if (count > 99) return "99+";
  return String(count);
}

function Navbar({ user, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const homePath = user
    ? user.role === "ADMIN"
      ? "/dashboard"
      : user.role === "MENTOR"
        ? "/mentor"
        : "/mentore"
    : "/";

  const activeClass = ({ isActive }) =>
    isActive ? "mc-nav-link mc-nav-link--active" : "mc-nav-link";

  const closeMenu = () => setMenuOpen(false);

  const loadUnread = useCallback(async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await NotificationService.countNotificationsNonLues(user.id);
      setUnreadCount(Number(res.data) || 0);
    } catch {
      setUnreadCount(0);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      stopNotificationSocket();
      return undefined;
    }

    startNotificationSocket(user.id);
    loadUnread();

    const onRealtime = () => {
      setUnreadCount((prev) => prev + 1);
    };
    const onChanged = () => loadUnread();
    const onFocus = () => loadUnread();

    window.addEventListener(EVENT_REALTIME, onRealtime);
    window.addEventListener(EVENT_CHANGED, onChanged);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    const interval = setInterval(loadUnread, 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener(EVENT_REALTIME, onRealtime);
      window.removeEventListener(EVENT_CHANGED, onChanged);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [user?.id, loadUnread]);

  const renderNotifButton = () => (
    <Link
      to="/notifications"
      className="mc-navbar__icon-btn"
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} non lues`
          : "Notifications"
      }
      onClick={closeMenu}
    >
      <span
        className="material-symbols-outlined"
        style={
          unreadCount > 0
            ? { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }
            : undefined
        }
      >
        notifications
      </span>
      {unreadCount > 0 && (
        <span className="mc-navbar__notif-badge">{formatNotifCount(unreadCount)}</span>
      )}
    </Link>
  );

  return (
    <header className="mc-navbar">
      <nav className="mc-navbar__inner">
        <Link className="mc-navbar__brand" to={homePath} onClick={closeMenu}>
          MentorConnect
        </Link>

        {user && (
          <div className="mc-navbar__user-tools mc-navbar__user-tools--mobile">
            {renderNotifButton()}
            <Link
              to="/mon-profil"
              className="mc-navbar__avatar-link"
              aria-label="Mon profil"
              onClick={closeMenu}
              title={`${user.prenom || ""} ${user.nom || ""}`.trim()}
            >
              <UserAvatar
                photoUrl={user.photoProfil}
                prenom={user.prenom}
                nom={user.nom}
                size={40}
                className="mc-navbar__avatar-img"
              />
            </Link>
          </div>
        )}

        <button
          className="mc-navbar__toggler"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="Ouvrir le menu"
        >
          <span className="material-symbols-outlined">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>

        <div
          className={`mc-navbar__collapse${menuOpen ? " mc-navbar__collapse--open" : ""}`}
        >
          <div className="mc-navbar__links">
            {!user && (
              <>
                <NavLink className={activeClass} to="/" end onClick={closeMenu}>
                  Accueil
                </NavLink>
                <NavLink className={activeClass} to="/mentors" onClick={closeMenu}>
                  Mentors
                </NavLink>
              </>
            )}

            {user?.role === "ADMIN" && (
              <>
                <NavLink className={activeClass} to="/dashboard" onClick={closeMenu}>
                  Dashboard
                </NavLink>
                <NavLink
                  className={activeClass}
                  to="/admin/utilisateurs"
                  onClick={closeMenu}
                >
                  Utilisateurs
                </NavLink>
                <NavLink
                  className={activeClass}
                  to="/admin/domaines"
                  onClick={closeMenu}
                >
                  Domaines
                </NavLink>
                <NavLink
                  className={activeClass}
                  to="/admin/evaluations"
                  onClick={closeMenu}
                >
                  Evaluations
                </NavLink>
                <NavLink
                  className={activeClass}
                  to="/admin/rapports"
                  onClick={closeMenu}
                >
                  Rapports
                </NavLink>
              </>
            )}

            {user?.role === "MENTOR" && (
              <>
                <NavLink className={activeClass} to="/mentor" onClick={closeMenu}>
                  Espace Mentor
                </NavLink>
                <NavLink className={activeClass} to="/rendez-vous" onClick={closeMenu}>
                  Rendez-vous
                </NavLink>
                <NavLink className={activeClass} to="/calendrier" onClick={closeMenu}>
                  Calendrier
                </NavLink>
                <NavLink className={activeClass} to="/evaluations" onClick={closeMenu}>
                  Mes evaluations
                </NavLink>
                <NavLink className={activeClass} to="/signaler" onClick={closeMenu}>
                  Signaler
                </NavLink>
              </>
            )}

            {user?.role === "MENTORE" && (
              <>
                <NavLink className={activeClass} to="/mentore" end onClick={closeMenu}>
                  Tableau de bord
                </NavLink>
                <NavLink
                  className={activeClass}
                  to="/mentore/cherche"
                  onClick={closeMenu}
                >
                  Chercher mentors
                </NavLink>
                <NavLink
                  className={activeClass}
                  to="/mentore/demandes"
                  onClick={closeMenu}
                >
                  Mes demandes
                </NavLink>
                <NavLink className={activeClass} to="/rendez-vous" onClick={closeMenu}>
                  Rendez-vous
                </NavLink>
                <NavLink className={activeClass} to="/calendrier" onClick={closeMenu}>
                  Calendrier
                </NavLink>
                <NavLink className={activeClass} to="/evaluations" onClick={closeMenu}>
                  Mes evaluations
                </NavLink>
                <NavLink className={activeClass} to="/signaler" onClick={closeMenu}>
                  Signaler
                </NavLink>
              </>
            )}
          </div>

          <div className="mc-navbar__actions">
            {!user && (
              <>
                <Link
                  className="mc-navbar__btn mc-navbar__btn--ghost"
                  to="/login"
                  onClick={closeMenu}
                >
                  Connexion
                </Link>
                <Link
                  className="mc-navbar__btn mc-navbar__btn--primary"
                  to="/register"
                  onClick={closeMenu}
                >
                  Inscription
                </Link>
              </>
            )}

            {user && (
              <>
                <div className="mc-navbar__user-tools mc-navbar__user-tools--desktop">
                  {renderNotifButton()}
                  <Link
                    to="/mon-profil"
                    className="mc-navbar__avatar-link"
                    aria-label="Mon profil"
                    onClick={closeMenu}
                    title={`${user.prenom || ""} ${user.nom || ""}`.trim()}
                  >
                    <UserAvatar
                      photoUrl={user.photoProfil}
                      prenom={user.prenom}
                      nom={user.nom}
                      size={40}
                      className="mc-navbar__avatar-img"
                    />
                  </Link>
                </div>

                <button
                  className="mc-navbar__btn mc-navbar__btn--outline"
                  type="button"
                  onClick={() => {
                    closeMenu();
                    stopNotificationSocket();
                    logout();
                  }}
                >
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
