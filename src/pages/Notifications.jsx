import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationService from "../services/NotificationService";
import PageHeader from "../components/PageHeader";
import handleApiError from "../utils/handleApiError";
import {
  EVENT_REALTIME,
  notifyNavbarRefresh,
  startNotificationSocket,
} from "../utils/notificationSocket";
import "./Notifications.css";

const TYPE_META = {
  NOUVELLE_DEMANDE: {
    label: "Nouvelle demande",
    icon: "person_add",
    tone: "primary",
    consultLabel: "Consulter les demandes",
  },
  DEMANDE_ACCEPTEE: {
    label: "Demande acceptée",
    icon: "check_circle",
    tone: "success",
    consultLabel: "Voir mes demandes",
  },
  DEMANDE_REFUSEE: {
    label: "Demande refusée",
    icon: "cancel",
    tone: "danger",
    consultLabel: "Voir mes demandes",
  },
  RELATION_SUPPRIMEE: {
    label: "Relation supprimée",
    icon: "link_off",
    tone: "danger",
  },
  NOUVEAU_MESSAGE: {
    label: "Nouveau message",
    icon: "chat_bubble",
    tone: "primary",
    consultLabel: "Ouvrir la conversation",
  },
  RDV_PLANIFIE: {
    label: "Rendez-vous planifié",
    icon: "event",
    tone: "primary",
    consultLabel: "Voir les rendez-vous",
  },
  RDV_CONFIRME: {
    label: "Rendez-vous confirmé",
    icon: "event_available",
    tone: "success",
    consultLabel: "Voir les rendez-vous",
  },
  RDV_ANNULE: {
    label: "Rendez-vous annulé",
    icon: "event_busy",
    tone: "warning",
    consultLabel: "Voir les rendez-vous",
  },
  RDV_TERMINE: {
    label: "Rendez-vous terminé",
    icon: "task_alt",
    tone: "success",
    consultLabel: "Voir les rendez-vous",
  },
  RDV_RAPPEL: {
    label: "Rappel rendez-vous",
    icon: "notifications_active",
    tone: "warning",
    consultLabel: "Voir les rendez-vous",
  },
  NOUVELLE_EVALUATION: {
    label: "Nouvelle évaluation",
    icon: "star",
    tone: "warning",
    consultLabel: "Consulter les évaluations",
  },
};

function getTypeMeta(type) {
  return (
    TYPE_META[type] || {
      label: type || "Notification",
      icon: "notifications",
      tone: "primary",
    }
  );
}

/** Fallback si la notif n'a pas encore de lien (anciennes notifications). */
function resolveConsultPath(notification, role) {
  if (notification.lien) return notification.lien;

  switch (notification.type) {
    case "NOUVELLE_DEMANDE":
      return role === "MENTOR" ? "/mentor" : "/mentore/demandes";
    case "DEMANDE_ACCEPTEE":
    case "DEMANDE_REFUSEE":
      return "/mentore/demandes";
    case "NOUVELLE_EVALUATION":
      return "/evaluations";
    case "NOUVEAU_MESSAGE":
      return role === "MENTOR" ? "/mentor" : "/mentore";
    case "RDV_PLANIFIE":
    case "RDV_CONFIRME":
    case "RDV_ANNULE":
    case "RDV_TERMINE":
    case "RDV_RAPPEL":
      return "/rendez-vous";
    default:
      return null;
  }
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (sameDay) return `Aujourd'hui · ${time}`;

  return (
    date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ` · ${time}`
  );
}

function Notifications() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadNotifications();
    if (user?.id) {
      startNotificationSocket(user.id);
    }

    const onRealtime = (event) => {
      const incoming = event.detail;
      if (!incoming?.id) return;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === incoming.id)) return prev;
        return [incoming, ...prev];
      });
    };

    window.addEventListener(EVENT_REALTIME, onRealtime);
    return () => window.removeEventListener(EVENT_REALTIME, onRealtime);
  }, []);

  const loadNotifications = async () => {
    if (!user?.id) {
      setLoading(false);
      setMessage("Utilisateur non connecté.");
      return;
    }

    setLoading(true);
    try {
      const res = await NotificationService.getNotificationsByUtilisateur(
        user.id
      );
      setNotifications(res.data || []);
      setMessage("");
      notifyNavbarRefresh();
    } catch (error) {
      setMessage(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.statutLecture).length,
    [notifications]
  );

  const visible = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.statutLecture);
    }
    return notifications;
  }, [notifications, filter]);

  const marquerCommeLue = async (id) => {
    try {
      await NotificationService.marquerCommeLue(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, statutLecture: true } : n))
      );
      notifyNavbarRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  const marquerToutesLues = async () => {
    const unread = notifications.filter((n) => !n.statutLecture);
    try {
      await Promise.all(
        unread.map((n) => NotificationService.marquerCommeLue(n.id))
      );
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, statutLecture: true }))
      );
      notifyNavbarRefresh();
    } catch (error) {
      setMessage(handleApiError(error, "Impossible de tout marquer comme lu"));
    }
  };

  const supprimerNotification = async (id) => {
    try {
      await NotificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      notifyNavbarRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  const consulter = async (notification) => {
    const path = resolveConsultPath(notification, user?.role);
    if (!path) return;

    if (!notification.statutLecture) {
      await marquerCommeLue(notification.id);
    }
    navigate(path);
  };

  return (
    <div className="mc-page notifications-page">
      <PageHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
            : "Vous êtes à jour"
        }
        actions={
          unreadCount > 0 ? (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={marquerToutesLues}
            >
              Tout marquer comme lu
            </button>
          ) : null
        }
      />

      {message && <div className="alert alert-danger">{message}</div>}

      <div className="notifications-toolbar">
        <div className="notifications-filters">
          <button
            type="button"
            className={`notifications-filter${
              filter === "all" ? " notifications-filter--active" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            Toutes ({notifications.length})
          </button>
          <button
            type="button"
            className={`notifications-filter${
              filter === "unread" ? " notifications-filter--active" : ""
            }`}
            onClick={() => setFilter("unread")}
          >
            Non lues ({unreadCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="notifications-empty">Chargement des notifications…</div>
      ) : visible.length === 0 ? (
        <div className="notifications-empty">
          <span className="material-symbols-outlined">notifications_off</span>
          <p>
            {filter === "unread"
              ? "Aucune notification non lue."
              : "Aucune notification pour le moment."}
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {visible.map((notification) => {
            const meta = getTypeMeta(notification.type);
            const unread = !notification.statutLecture;
            const consultPath = resolveConsultPath(notification, user?.role);

            return (
              <article
                key={notification.id}
                className={`notification-card notification-card--${meta.tone}${
                  unread ? " notification-card--unread" : ""
                }`}
              >
                <div
                  className={`notification-card__icon notification-card__icon--${meta.tone}`}
                >
                  <span className="material-symbols-outlined">{meta.icon}</span>
                </div>

                <div className="notification-card__body">
                  <div className="notification-card__top">
                    <div className="notification-card__heading">
                      <h3 className="notification-card__title">{meta.label}</h3>
                      {unread && (
                        <span className="notification-card__badge">Non lue</span>
                      )}
                    </div>
                    <time className="notification-card__date">
                      {formatDate(notification.dateCreation)}
                    </time>
                  </div>
                  <p className="notification-card__content">
                    {notification.contenu}
                  </p>
                  <div className="notification-card__actions">
                    {consultPath && (
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() => consulter(notification)}
                      >
                        {meta.consultLabel || "Consulter"}
                      </button>
                    )}
                    {unread && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => marquerCommeLue(notification.id)}
                      >
                        Marquer comme lue
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => supprimerNotification(notification.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
