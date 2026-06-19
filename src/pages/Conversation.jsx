import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";

function Conversation() {
  const { relationId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [relation, setRelation] = useState(null);
  const [texte, setTexte] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadRelation();
    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [relationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadRelation = async () => {
    try {
      const res = await api.get(`/relations/${relationId}`);
      setRelation(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await api.get(`/messages/relation/${relationId}`);
      setMessages(res.data);
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

    let destinataireId;

    if (user.id === relation.mentor.id) {
      destinataireId = relation.mentore.id;
    } else {
      destinataireId = relation.mentor.id;
    }

    try {
      await api.post(
        `/messages?relationId=${relationId}&expediteurId=${user.id}&destinataireId=${destinataireId}`,
        {
          message: texte,
        }
      );

      setTexte("");
      loadMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const retour = () => {
    if (user.role === "MENTOR") {
      window.location.href = "/mentor";
    } else {
      window.location.href = "/mentore/demandes";
    }
  };

  return (
    <div className="container mt-4">
      <button className="btn btn-outline-secondary mb-3" onClick={retour}>
        Retour
      </button>

      <h2>Conversation</h2>

      {relation && (
        <p className="text-muted">
          Mentor : {relation.mentor?.prenom} {relation.mentor?.nom} | Mentoré :{" "}
          {relation.mentore?.prenom} {relation.mentore?.nom}
        </p>
      )}
      {relation && (
        <a
            href={`/rendez-vous/create/${relation.id}`}
            className="btn btn-outline-success mb-3"
        >
            Planifier un rendez-vous
        </a>
        )}
        
      <div
        className="border rounded p-3 mb-3 bg-white"
        style={{ height: "500px", overflowY: "auto" }}
      >
        {messages.length === 0 ? (
          <p className="text-muted">Aucun message pour le moment.</p>
        ) : (
          messages.map((msg) => {
            const isMe = getExpediteurId(msg) === user.id;

            return (
              <div
                key={msg.id}
                className={`mb-3 ${isMe ? "text-end" : "text-start"}`}
              >
                <div
                  className={`d-inline-block p-2 rounded ${
                    isMe ? "bg-primary text-white" : "bg-light border"
                  }`}
                >
                  {msg.message}
                </div>

                <div>
                  <small className="text-muted">{msg.dateEnvoi}</small>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef}></div>
      </div>

      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Écrire un message..."
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") envoyerMessage();
          }}
        />

        <button className="btn btn-success" onClick={envoyerMessage}>
          Envoyer
        </button>
      </div>
    </div>
  );
}

export default Conversation;