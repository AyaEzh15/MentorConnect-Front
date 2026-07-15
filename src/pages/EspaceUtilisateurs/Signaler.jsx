import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RapportService from "../../services/RapportService";
import PageHeader from "../../components/PageHeader";
import handleApiError from "../../utils/handleApiError";

const TYPES = [
  { value: "COMPORTEMENT_INAPPROPRIE", label: "Comportement inapproprié" },
  { value: "HARCELEMENT", label: "Harcèlement" },
  { value: "SPAM", label: "Spam / publicité" },
  { value: "FAUSSE_IDENTITE", label: "Fausse identité" },
  { value: "PROBLEME_TECHNIQUE", label: "Problème technique" },
  { value: "AUTRE", label: "Autre" },
];

function Signaler() {
  const navigate = useNavigate();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("AUTRE");
  const [utilisateurCibleId, setUtilisateurCibleId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSending(true);
    try {
      await RapportService.create({
        titre: titre.trim(),
        description: description.trim(),
        type,
        utilisateurCibleId: utilisateurCibleId
          ? Number(utilisateurCibleId)
          : null,
      });
      setMessage("Signalement envoyé. Un administrateur le traitera.");
      setTitre("");
      setDescription("");
      setType("AUTRE");
      setUtilisateurCibleId("");
    } catch (err) {
      setError(handleApiError(err, "Impossible d'envoyer le signalement."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mc-page mc-page--medium">
      <PageHeader
        title="Signaler un problème"
        subtitle="Décrivez la situation. Seuls les administrateurs verront ce rapport."
        actions={
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            Retour
          </button>
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="mc-section">
        <form onSubmit={soumettre}>
          <label className="form-label">Type</label>
          <select
            className="form-select mb-3"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <label className="form-label">Titre</label>
          <input
            className="form-control mb-3"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Résumé court"
            required
            maxLength={120}
          />

          <label className="form-label">Description</label>
          <textarea
            className="form-control mb-3"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contexte, faits, preuves éventuelles…"
            required
          />

          <label className="form-label">
            ID utilisateur concerné{" "}
            <span className="text-muted">(optionnel)</span>
          </label>
          <input
            className="form-control mb-3"
            type="number"
            min="1"
            value={utilisateurCibleId}
            onChange={(e) => setUtilisateurCibleId(e.target.value)}
            placeholder="Ex. 12"
          />

          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={sending}
            style={{ background: "#00288e", borderColor: "#00288e" }}
          >
            {sending ? "Envoi…" : "Envoyer le signalement"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signaler;
