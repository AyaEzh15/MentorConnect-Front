import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import RelationService from "../services/RelationService";
import MessageService from "../services/MessageService";
import PageHeader from "../components/PageHeader";
import { WS_URL } from "../utils/mediaUrl";

const DAYS_FR = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

function parseMessageDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatMessageTime(date) {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateSeparator(date, now = new Date()) {
  const today = startOfDay(now);
  const messageDay = startOfDay(date);
  const diffDays = Math.round(
    (today.getTime() - messageDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";

  if (diffDays > 1 && diffDays < 7) {
    return DAYS_FR[date.getDay()];
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Conversation() {
  const { relationId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [relation, setRelation] = useState(null);
  const [texte, setTexte] = useState("");
  const [wsStatus, setWsStatus] = useState("connexion…");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadRelation();
    loadMessages();

    const token = localStorage.getItem("token");
    if (!token) {
      setWsStatus("hors ligne");
      return undefined;
    }

    const client = new Client({
      brokerURL: `${WS_URL}?token=${encodeURIComponent(token)}`,
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setWsStatus("en direct");
        client.subscribe(`/topic/relations/${relationId}`, (frame) => {
          try {
            const incoming = JSON.parse(frame.body);
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });
          } catch (error) {
            console.error(error);
          }
        });
      },
      onStompError: () => setWsStatus("erreur"),
      onWebSocketClose: () => setWsStatus("reconnection…"),
      onDisconnect: () => setWsStatus("hors ligne"),
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [relationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadRelation = async () => {
    try {
      const res = await RelationService.getRelationById(relationId);
      setRelation(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await MessageService.getMessagesByRelation(relationId);
      setMessages(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const getExpediteurId = (message) => {
    if (typeof message.expediteur === "number") return message.expediteur;
    return message.expediteur?.id;
  };

  const envoyerMessage = async () => {
    if (!texte.trim() || !relation) return;

    const destinataireId =
      user.id === relation.mentor.id
        ? relation.mentore.id
        : relation.mentor.id;

    const contenu = texte;
    setTexte("");

    try {
      await MessageService.envoyerMessage(
        relationId,
        user.id,
        destinataireId,
        contenu
      );
      // Diffusion via WebSocket : pas de reload polling
    } catch (error) {
      console.error(error);
      setTexte(contenu);
    }
  };

  const items = useMemo(() => {
    const now = new Date();
    const result = [];
    let lastDayKey = null;

    messages.forEach((msg) => {
      const date = parseMessageDate(msg.dateEnvoi);
      const dayKey = date
        ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        : null;

      if (date && dayKey !== lastDayKey) {
        result.push({
          type: "separator",
          key: `day-${dayKey}`,
          label: formatDateSeparator(date, now),
        });
        lastDayKey = dayKey;
      }

      result.push({
        type: "message",
        key: `msg-${msg.id}`,
        message: msg,
        date,
      });
    });

    return result;
  }, [messages]);

  const retourPath = user.role === "MENTOR" ? "/mentor" : "/mentore/demandes";

  const interlocuteur =
    user?.role === "MENTOR"
      ? `${relation?.mentore?.prenom || ""} ${relation?.mentore?.nom || ""}`
      : `${relation?.mentor?.prenom || ""} ${relation?.mentor?.nom || ""}`;

  return (
    <div className="mc-page">
      <PageHeader
        title="Conversation"
        subtitle={
          relation
            ? `Échange avec ${interlocuteur.trim()} · ${wsStatus}`
            : "Chargement…"
        }
        actions={
          <>
            <Link to={retourPath} className="btn btn-outline-secondary">
              Retour
            </Link>
            {relation && (
              <>
                <Link
                  to={`/relation/${relation.id}/suivi`}
                  className="btn btn-outline-success"
                >
                  Objectifs & plan
                </Link>
                <Link
                  to={`/rendez-vous/create/${relation.id}`}
                  className="btn btn-outline-primary"
                >
                  Planifier un RDV
                </Link>
              </>
            )}
          </>
        }
      />

      <div className="mc-chat">
        <div className="mc-chat__window">
          {messages.length === 0 ? (
            <p className="text-muted mb-0">Aucun message pour le moment.</p>
          ) : (
            items.map((item) => {
              if (item.type === "separator") {
                return (
                  <div key={item.key} className="mc-chat__day">
                    <span>{item.label}</span>
                  </div>
                );
              }

              const { message: msg, date } = item;
              const isMe = Number(getExpediteurId(msg)) === Number(user?.id);

              return (
                <div
                  key={item.key}
                  className={`mc-chat__row ${
                    isMe ? "mc-chat__row--mine" : "mc-chat__row--theirs"
                  }`}
                >
                  <div
                    className={`mc-chat__bubble ${
                      isMe ? "mc-chat__bubble--mine" : "mc-chat__bubble--theirs"
                    }`}
                  >
                    <span className="mc-chat__text">{msg.message}</span>
                    {date && (
                      <span className="mc-chat__time">
                        {formatMessageTime(date)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="mc-chat__composer">
          <input
            type="text"
            className="form-control"
            placeholder="Écrire un message…"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") envoyerMessage();
            }}
          />
          <button
            className="btn btn-primary"
            type="button"
            onClick={envoyerMessage}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

export default Conversation;
