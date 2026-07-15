import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import RelationService from "../../services/RelationService";
import ObjectifService from "../../services/ObjectifService";
import PlanService from "../../services/PlanService";
import TacheService from "../../services/TacheService";
import api from "../../api/axiosConfig";
import PageHeader from "../../components/PageHeader";
import handleApiError from "../../utils/handleApiError";
import "./RelationSuivi.css";

const TYPE_OBJECTIFS = [
  { value: "APPRENDRE_TECHNOLOGIE", label: "Apprendre une technologie" },
  { value: "PREPARER_ENTRETIEN", label: "Préparer un entretien" },
  { value: "AMELIORER_CV", label: "Améliorer son CV" },
  { value: "REALISER_PROJET", label: "Réaliser un projet" },
  { value: "ORIENTATION_PRO", label: "S'orienter professionnellement" },
  { value: "AUTRE", label: "Autre" },
];

const STATUT_OBJECTIF = [
  { value: "PROPOSE", label: "Proposé" },
  { value: "VALIDE", label: "Validé" },
  { value: "EN_COURS", label: "En cours" },
  { value: "ATTEINT", label: "Atteint" },
  { value: "ABANDONNE", label: "Abandonné" },
  { value: "EN_RETARD", label: "En retard" },
];

const STATUT_ETAPE = [
  { value: "A_VENIR", label: "À venir" },
  { value: "EN_COURS", label: "En cours" },
  { value: "TERMINEE", label: "Terminée" },
  { value: "BLOQUEE", label: "Bloquée" },
  { value: "ANNULEE", label: "Annulée" },
];

const PRIORITES = [
  { value: "BASSE", label: "Basse" },
  { value: "MOYENNE", label: "Moyenne" },
  { value: "HAUTE", label: "Haute" },
  { value: "URGENTE", label: "Urgente" },
];

const STATUT_TACHE_LABEL = {
  A_FAIRE: "Pas encore",
  EN_COURS: "En cours",
  SOUMISE: "Terminée — en attente mentor",
  A_CORRIGER: "À corriger",
  TERMINEE: "Validée par le mentor",
  EN_RETARD: "En retard",
  ANNULEE: "Annulée",
};

const EMPTY_OBJECTIF = {
  type: "APPRENDRE_TECHNOLOGIE",
  titre: "",
  description: "",
  dateLimite: "",
};

const EMPTY_TACHE = {
  titre: "",
  description: "",
  dateLimite: "",
  priorite: "MOYENNE",
  objectifId: "",
  etapeId: "",
};

function labelType(type) {
  return TYPE_OBJECTIFS.find((t) => t.value === type)?.label || type;
}

function labelStatutObjectif(statut) {
  return STATUT_OBJECTIF.find((s) => s.value === statut)?.label || statut;
}

function RelationSuivi() {
  const { relationId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isMentor = user?.role === "MENTOR";
  const isMentore = user?.role === "MENTORE";

  const [relation, setRelation] = useState(null);
  const [objectifs, setObjectifs] = useState([]);
  const [etapes, setEtapes] = useState([]);
  const [taches, setTaches] = useState([]);
  const [tab, setTab] = useState("objectifs");
  const [form, setForm] = useState(EMPTY_OBJECTIF);
  const [tacheForm, setTacheForm] = useState(EMPTY_TACHE);
  const [soumissionDraft, setSoumissionDraft] = useState({});
  /** id tâche → true lorsque le mentoré choisit « Terminée » (formulaire dépôt). */
  const [terminerOuvert, setTerminerOuvert] = useState({});
  const [commentModal, setCommentModal] = useState(null);
  /** { type: 'correction'|'refus', id, titre, commentaire } */
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(true);

  const uploadOrigin = useMemo(() => {
    const base = api?.defaults?.baseURL || "";
    return base.replace(/\/api\/?$/, "");
  }, []);

  const objectifsActifs = useMemo(
    () =>
      objectifs.filter(
        (o) =>
          o.statut !== "PROPOSE" &&
          o.statut !== "ABANDONNE" &&
          o.statut !== "A_FAIRE"
      ),
    [objectifs]
  );

  useEffect(() => {
    loadAll();
  }, [relationId]);

  const loadAll = async () => {
    setLoading(true);
    setErreur("");
    try {
      const relRes = await RelationService.getRelationById(relationId);
      setRelation(relRes.data);

      const results = await Promise.allSettled([
        ObjectifService.getByRelation(relationId),
        PlanService.getByRelation(relationId),
        TacheService.getByRelation(relationId),
      ]);

      const errors = [];
      if (results[0].status === "fulfilled") {
        setObjectifs(results[0].value.data || []);
      } else {
        setObjectifs([]);
        errors.push("objectifs");
      }
      if (results[1].status === "fulfilled") {
        setEtapes(results[1].value.data || []);
      } else {
        setEtapes([]);
        errors.push("plan");
      }
      if (results[2].status === "fulfilled") {
        setTaches(results[2].value.data || []);
      } else {
        setTaches([]);
        errors.push("tâches");
      }

      if (errors.length > 0) {
        setErreur(
          `Impossible de charger : ${errors.join(", ")}. Réessayez après redémarrage du serveur.`
        );
      }
    } catch (error) {
      setErreur(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const interlocuteur = useMemo(() => {
    if (!relation) return "";
    if (isMentor) {
      return `${relation.mentore?.prenom || ""} ${relation.mentore?.nom || ""}`.trim();
    }
    return `${relation.mentor?.prenom || ""} ${relation.mentor?.nom || ""}`.trim();
  }, [relation, isMentor]);

  const creerObjectif = async (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");
    if (!form.titre.trim() || !form.description.trim()) {
      setErreur("Le titre et la description sont obligatoires.");
      return;
    }
    try {
      await ObjectifService.create(relationId, {
        ...form,
        dateLimite: form.dateLimite || null,
      });
      setForm(EMPTY_OBJECTIF);
      setMessage(
        isMentore
          ? "Objectif proposé. En attente de validation du mentor."
          : "Objectif créé et validé."
      );
      const res = await ObjectifService.getByRelation(relationId);
      setObjectifs(res.data || []);
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  const updateObjectifMentor = async (objectif, patch) => {
    try {
      await ObjectifService.update(objectif.id, {
        type: objectif.type,
        titre: objectif.titre,
        description: objectif.description,
        dateDebut: objectif.dateDebut,
        dateLimite: objectif.dateLimite,
        statut: patch.statut ?? objectif.statut,
        progression:
          patch.progression != null
            ? Number(patch.progression)
            : objectif.progression,
        commentaireMentor:
          patch.commentaireMentor ?? objectif.commentaireMentor,
      });
      const res = await ObjectifService.getByRelation(relationId);
      setObjectifs(res.data || []);
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  const validerObjectif = async (id) => {
    try {
      await ObjectifService.valider(id);
      setMessage("Objectif validé.");
      const res = await ObjectifService.getByRelation(relationId);
      setObjectifs(res.data || []);
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  const refuserObjectif = (id) => {
    setCommentModal({
      type: "refus",
      id,
      titre: "Refuser l'objectif",
      hint: "Indiquez un motif (optionnel) pour guider le mentoré.",
      commentaire: "",
      required: false,
    });
  };

  const confirmerCommentModal = async () => {
    if (!commentModal) return;
    const { type, id, commentaire, required } = commentModal;
    if (required && !commentaire.trim()) {
      setErreur("Le commentaire est obligatoire.");
      return;
    }
    setErreur("");
    try {
      if (type === "refus") {
        await ObjectifService.refuser(id, commentaire.trim());
        setMessage("Objectif refusé.");
        const res = await ObjectifService.getByRelation(relationId);
        setObjectifs(res.data || []);
      } else if (type === "correction") {
        await TacheService.demanderCorrection(id, commentaire.trim());
        setMessage("Correction demandée.");
        const res = await TacheService.getByRelation(relationId);
        setTaches(res.data || []);
      }
      setCommentModal(null);
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  const corrigerTache = (id) => {
    setCommentModal({
      type: "correction",
      id,
      titre: "Demander une correction",
      hint: "Expliquez au mentoré ce qu'il doit améliorer.",
      commentaire: "",
      required: true,
    });
  };

  const supprimerObjectif = async (id, statut) => {
    if (isMentore && statut !== "PROPOSE") {
      setErreur("Vous ne pouvez supprimer que vos propositions non validées.");
      return;
    }
    try {
      await ObjectifService.delete(id);
      setObjectifs((prev) => prev.filter((o) => o.id !== id));
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  const initialiserPlan = async () => {
    try {
      const res = await PlanService.initialiser(relationId);
      setEtapes(res.data || []);
      setMessage("Plan d'accompagnement créé.");
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  const updateEtape = async (etape, patch) => {
    try {
      await PlanService.update(etape.id, {
        ordre: etape.ordre,
        titre: etape.titre,
        description: etape.description,
        statut: patch.statut ?? etape.statut,
      });
      const res = await PlanService.getByRelation(relationId);
      setEtapes(res.data || []);
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  const creerTache = async (e) => {
    e.preventDefault();
    setErreur("");
    if (!tacheForm.titre.trim() || !tacheForm.description.trim() || !tacheForm.dateLimite) {
      setErreur("Titre, description et date limite sont obligatoires.");
      return;
    }
    try {
      await TacheService.create(relationId, {
        titre: tacheForm.titre,
        description: tacheForm.description,
        dateLimite: tacheForm.dateLimite,
        priorite: tacheForm.priorite,
        objectifId: tacheForm.objectifId ? Number(tacheForm.objectifId) : null,
        etapeId: tacheForm.etapeId ? Number(tacheForm.etapeId) : null,
      });
      setTacheForm(EMPTY_TACHE);
      setMessage("Tâche créée.");
      await loadAll();
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  const mentoreChangeStatut = async (tache, value) => {
    setErreur("");
    if (value === "TERMINEE_DEMANDE") {
      setTerminerOuvert((prev) => ({ ...prev, [tache.id]: true }));
      return;
    }
    setTerminerOuvert((prev) => ({ ...prev, [tache.id]: false }));
    try {
      await TacheService.setStatutMentore(tache.id, value);
      const res = await TacheService.getByRelation(relationId);
      setTaches(res.data || []);
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  const mentoreSelectValue = (tache) => {
    if (terminerOuvert[tache.id]) return "TERMINEE_DEMANDE";
    if (tache.statut === "SOUMISE" || tache.statut === "TERMINEE") return "TERMINEE_DEMANDE";
    if (tache.statut === "EN_COURS" || tache.statut === "A_CORRIGER" || tache.statut === "EN_RETARD") {
      return "EN_COURS";
    }
    return "A_FAIRE";
  };

  const resolveUploadUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${uploadOrigin}${path}`;
  };

  const soumettreTache = async (id) => {
    const draft = soumissionDraft[id] || {};
    if (!draft.lienTravail?.trim() && !draft.fichier) {
      setErreur("Ajoutez un lien ou un fichier pour marquer la tâche comme terminée.");
      return;
    }
    try {
      if (draft.fichier) {
        await TacheService.soumettreAvecFichier(id, {
          commentaire: draft.commentaire || "",
          lienTravail: draft.lienTravail || "",
          fichier: draft.fichier,
        });
      } else {
        await TacheService.soumettre(id, {
          commentaire: draft.commentaire || "",
          lienTravail: draft.lienTravail || "",
        });
      }
      setMessage("Travail envoyé. Le mentor va le consulter et le valider.");
      setTerminerOuvert((prev) => ({ ...prev, [id]: false }));
      setSoumissionDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await loadAll();
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  const validerTache = async (id) => {
    try {
      await TacheService.valider(id);
      setMessage("Tâche validée.");
      await loadAll();
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  const supprimerTache = async (id) => {
    try {
      await TacheService.delete(id);
      await loadAll();
    } catch (error) {
      setErreur(handleApiError(error));
    }
  };

  if (loading) {
    return (
      <div className="mc-page">
        <p className="text-muted">Chargement du suivi…</p>
      </div>
    );
  }

  return (
    <div className="mc-page relation-suivi">
      <PageHeader
        title="Espace d'accompagnement"
        subtitle={
          interlocuteur
            ? `Avec ${interlocuteur}`
            : "Objectifs, plan et tâches"
        }
        actions={
          <>
            <Link to="/calendrier" className="btn btn-outline-secondary btn-sm">
              Calendrier
            </Link>
            <Link
              to={`/conversation/${relationId}`}
              className="btn btn-outline-primary btn-sm"
            >
              Discussion
            </Link>
          </>
        }
      />

      {message && <div className="alert alert-success">{message}</div>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {relation?.statut !== "ACCEPTEE" && (
        <div className="alert alert-info">
          Le suivi complet est disponible lorsque la relation est acceptée.
        </div>
      )}

      <div className="suivi-tabs">
        <button
          type="button"
          className={`suivi-tab${tab === "objectifs" ? " suivi-tab--active" : ""}`}
          onClick={() => setTab("objectifs")}
        >
          Objectifs
        </button>
        <button
          type="button"
          className={`suivi-tab${tab === "plan" ? " suivi-tab--active" : ""}`}
          onClick={() => setTab("plan")}
        >
          Plan d&apos;accompagnement
        </button>
        <button
          type="button"
          className={`suivi-tab${tab === "taches" ? " suivi-tab--active" : ""}`}
          onClick={() => setTab("taches")}
        >
          Tâches
        </button>
      </div>

      {tab === "objectifs" && (
        <div className="suivi-panel">
          <p className="suivi-hint">
            {isMentore
              ? "Proposez un objectif (ex. apprendre Spring Boot). Le mentor le validera puis créera les tâches."
              : "Consultez les propositions du mentoré, validez ou refusez, puis créez le plan et les tâches."}
          </p>

          {(isMentore || isMentor) && relation?.statut === "ACCEPTEE" && (
            <form className="suivi-form" onSubmit={creerObjectif}>
              <h3>{isMentore ? "Proposer un objectif" : "Ajouter un objectif"}</h3>
              <div className="row g-2">
                <div className="col-md-4">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {TYPE_OBJECTIFS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label">Titre *</label>
                  <input
                    className="form-control"
                    value={form.titre}
                    onChange={(e) => setForm({ ...form, titre: e.target.value })}
                    placeholder="Ex : Maîtriser Spring Boot"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Date limite</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.dateLimite}
                    onChange={(e) =>
                      setForm({ ...form, dateLimite: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary w-100">
                    {isMentore ? "Proposer" : "Créer"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {objectifs.length === 0 ? (
            <p className="text-muted">Aucun objectif pour le moment.</p>
          ) : (
            <div className="objectif-list">
              {objectifs.map((objectif) => (
                <article key={objectif.id} className="objectif-card">
                  <div className="objectif-card__top">
                    <div>
                      <span className="objectif-card__type">
                        {labelType(objectif.type)}
                      </span>
                      <h4>{objectif.titre}</h4>
                      <span className={`badge-statut badge-statut--${objectif.statut}`}>
                        {labelStatutObjectif(objectif.statut)}
                      </span>
                    </div>
                    {((isMentore && objectif.statut === "PROPOSE") || isMentor) && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          supprimerObjectif(objectif.id, objectif.statut)
                        }
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  {objectif.description && (
                    <p className="objectif-card__desc">{objectif.description}</p>
                  )}
                  <div className="objectif-card__meta">
                    <span>
                      Échéance :{" "}
                      {objectif.dateLimite
                        ? new Date(objectif.dateLimite).toLocaleDateString("fr-FR")
                        : "—"}
                    </span>
                  </div>
                  <div className="objectif-card__progress">
                    <div className="objectif-card__bar">
                      <div style={{ width: `${objectif.progression || 0}%` }} />
                    </div>
                    <span>{objectif.progression || 0}%</span>
                  </div>
                  {objectif.commentaireMentor && (
                    <p className="objectif-card__comment">
                      Commentaire mentor : {objectif.commentaireMentor}
                    </p>
                  )}
                  {isMentor && objectif.statut === "PROPOSE" && (
                    <div className="objectif-card__actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() => validerObjectif(objectif.id)}
                      >
                        Valider
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => refuserObjectif(objectif.id)}
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                  {isMentor &&
                    objectif.statut !== "PROPOSE" &&
                    objectif.statut !== "ABANDONNE" && (
                      <div className="objectif-card__controls">
                        <select
                          className="form-select form-select-sm"
                          value={objectif.statut}
                          onChange={(e) =>
                            updateObjectifMentor(objectif, {
                              statut: e.target.value,
                            })
                          }
                        >
                          {STATUT_OBJECTIF.filter((s) => s.value !== "PROPOSE").map(
                            (s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "plan" && (
        <div className="suivi-panel">
          <p className="suivi-hint">
            {isMentor
              ? "Vous créez et mettez à jour le plan d'accompagnement."
              : "Consultez les étapes définies par votre mentor."}
          </p>
          {isMentor && etapes.length === 0 && relation?.statut === "ACCEPTEE" && (
            <button
              type="button"
              className="btn btn-primary mb-3"
              onClick={initialiserPlan}
            >
              Créer le plan type (5 étapes)
            </button>
          )}
          <ol className="plan-list">
            {etapes.map((etape) => (
              <li
                key={etape.id}
                className={`plan-step plan-step--${etape.statut}`}
              >
                <div className="plan-step__ordre">{etape.ordre}</div>
                <div className="plan-step__body">
                  <h4>{etape.titre}</h4>
                  {etape.description && <p>{etape.description}</p>}
                  {isMentor ? (
                    <select
                      className="form-select form-select-sm"
                      style={{ maxWidth: 200 }}
                      value={etape.statut}
                      onChange={(e) =>
                        updateEtape(etape, { statut: e.target.value })
                      }
                    >
                      {STATUT_ETAPE.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`badge-statut badge-statut--${etape.statut}`}>
                      {STATUT_ETAPE.find((s) => s.value === etape.statut)?.label ||
                        etape.statut}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {etapes.length === 0 && (
            <p className="text-muted">
              {isMentor
                ? "Aucun plan pour l'instant. Créez le plan type ci-dessus."
                : "Votre mentor n'a pas encore créé le plan d'accompagnement."}
            </p>
          )}
        </div>
      )}

      {tab === "taches" && (
        <div className="suivi-panel">
          <p className="suivi-hint">
            {isMentor
              ? "Après validation d'un objectif, créez les tâches. Consultez les livrables (lien / fichier) puis validez."
              : "Choisissez le statut : Pas encore, En cours ou Terminée. Si Terminée, déposez un lien ou un fichier pour le mentor."}
          </p>

          {isMentor && relation?.statut === "ACCEPTEE" && (
            <form className="suivi-form" onSubmit={creerTache}>
              <h3>Nouvelle tâche</h3>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">Titre *</label>
                  <input
                    className="form-control"
                    value={tacheForm.titre}
                    onChange={(e) =>
                      setTacheForm({ ...tacheForm, titre: e.target.value })
                    }
                    placeholder="Ex : Créer une API CRUD"
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Date limite *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={tacheForm.dateLimite}
                    onChange={(e) =>
                      setTacheForm({ ...tacheForm, dateLimite: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Priorité</label>
                  <select
                    className="form-select"
                    value={tacheForm.priorite}
                    onChange={(e) =>
                      setTacheForm({ ...tacheForm, priorite: e.target.value })
                    }
                  >
                    {PRIORITES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={tacheForm.description}
                    onChange={(e) =>
                      setTacheForm({
                        ...tacheForm,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Objectif lié (validé)</label>
                  <select
                    className="form-select"
                    value={tacheForm.objectifId}
                    onChange={(e) =>
                      setTacheForm({ ...tacheForm, objectifId: e.target.value })
                    }
                  >
                    <option value="">— Aucun —</option>
                    {objectifsActifs.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.titre}
                      </option>
                    ))}
                  </select>
                  {objectifsActifs.length === 0 && (
                    <small className="text-muted">
                      Validez d&apos;abord un objectif du mentoré.
                    </small>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Étape liée</label>
                  <select
                    className="form-select"
                    value={tacheForm.etapeId}
                    onChange={(e) =>
                      setTacheForm({ ...tacheForm, etapeId: e.target.value })
                    }
                  >
                    <option value="">— Aucune —</option>
                    {etapes.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.ordre}. {e.titre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary w-100">
                    Créer la tâche
                  </button>
                </div>
              </div>
            </form>
          )}

          {taches.length === 0 ? (
            <p className="text-muted">
              {isMentor
                ? "Aucune tâche. Validez un objectif puis créez les étapes de travail."
                : "Aucune tâche pour le moment. Votre mentor en créera après validation de vos objectifs."}
            </p>
          ) : (
            <div className="tache-list">
              {taches.map((tache) => {
                const mentorePeutEditer =
                  isMentore &&
                  tache.statut !== "SOUMISE" &&
                  tache.statut !== "TERMINEE" &&
                  tache.statut !== "ANNULEE";
                const showDepot =
                  mentorePeutEditer &&
                  (terminerOuvert[tache.id] || tache.statut === "A_CORRIGER");

                return (
                  <article key={tache.id} className="tache-card">
                    <div className="objectif-card__top">
                      <div>
                        <h4>{tache.titre}</h4>
                        <span
                          className={`badge-statut badge-statut--${tache.statut}`}
                        >
                          {STATUT_TACHE_LABEL[tache.statut] || tache.statut}
                        </span>
                      </div>
                      {isMentor && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => supprimerTache(tache.id)}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <p className="objectif-card__desc">{tache.description}</p>
                    <div className="objectif-card__meta">
                      <span>
                        Échéance :{" "}
                        {tache.dateLimite
                          ? new Date(tache.dateLimite).toLocaleDateString(
                              "fr-FR"
                            )
                          : "—"}
                      </span>
                      <span> · Priorité : {tache.priorite}</span>
                    </div>

                    {(tache.commentaireSoumission ||
                      tache.lienTravail ||
                      tache.fichierUrl) && (
                      <div className="tache-livrable">
                        <strong>Travail du mentoré</strong>
                        {tache.commentaireSoumission && (
                          <p>{tache.commentaireSoumission}</p>
                        )}
                        <div className="tache-livrable__links">
                          {tache.lienTravail && (
                            <a
                              href={tache.lienTravail}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Ouvrir le lien
                            </a>
                          )}
                          {tache.fichierUrl && (
                            <a
                              href={resolveUploadUrl(tache.fichierUrl)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Télécharger le fichier
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {tache.commentaireMentor && (
                      <p className="objectif-card__comment">
                        Mentor : {tache.commentaireMentor}
                      </p>
                    )}

                    {mentorePeutEditer && (
                      <div className="tache-statut-row">
                        <label className="form-label mb-1">Mon avancement</label>
                        <select
                          className="form-select form-select-sm"
                          style={{ maxWidth: 260 }}
                          value={mentoreSelectValue(tache)}
                          onChange={(e) =>
                            mentoreChangeStatut(tache, e.target.value)
                          }
                        >
                          <option value="A_FAIRE">Pas encore</option>
                          <option value="EN_COURS">En cours</option>
                          <option value="TERMINEE_DEMANDE">Terminée</option>
                        </select>
                      </div>
                    )}

                    {showDepot && (
                      <div className="tache-soumission">
                        <p className="suivi-hint mb-2">
                          Joignez un lien (GitHub, Drive…) et/ou un fichier pour
                          que le mentor puisse consulter votre travail.
                        </p>
                        <input
                          className="form-control form-control-sm"
                          placeholder="Commentaire (optionnel)"
                          value={soumissionDraft[tache.id]?.commentaire || ""}
                          onChange={(e) =>
                            setSoumissionDraft((prev) => ({
                              ...prev,
                              [tache.id]: {
                                ...prev[tache.id],
                                commentaire: e.target.value,
                              },
                            }))
                          }
                        />
                        <input
                          className="form-control form-control-sm"
                          placeholder="Lien (GitHub, projet…)"
                          value={soumissionDraft[tache.id]?.lienTravail || ""}
                          onChange={(e) =>
                            setSoumissionDraft((prev) => ({
                              ...prev,
                              [tache.id]: {
                                ...prev[tache.id],
                                lienTravail: e.target.value,
                              },
                            }))
                          }
                        />
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.zip,.doc,.docx,.txt,.md"
                          onChange={(e) =>
                            setSoumissionDraft((prev) => ({
                              ...prev,
                              [tache.id]: {
                                ...prev[tache.id],
                                fichier: e.target.files?.[0] || null,
                              },
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => soumettreTache(tache.id)}
                        >
                          Envoyer au mentor
                        </button>
                      </div>
                    )}

                    {isMentor && tache.statut === "SOUMISE" && (
                      <div className="objectif-card__actions">
                        <button
                          type="button"
                          className="btn-suivi btn-suivi--success"
                          onClick={() => validerTache(tache.id)}
                        >
                          Valider le travail
                        </button>
                        <button
                          type="button"
                          className="btn-suivi btn-suivi--outline"
                          onClick={() => corrigerTache(tache.id)}
                        >
                          Demander une correction
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {commentModal && (
        <div
          className="suivi-modal-overlay"
          role="presentation"
          onClick={() => setCommentModal(null)}
        >
          <div
            className="suivi-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="suivi-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="suivi-modal-title">{commentModal.titre}</h3>
            <p className="suivi-modal__hint">{commentModal.hint}</p>
            <textarea
              className="form-control suivi-modal__input"
              rows={4}
              autoFocus
              placeholder={
                commentModal.required
                  ? "Votre commentaire…"
                  : "Motif (optionnel)…"
              }
              value={commentModal.commentaire}
              onChange={(e) =>
                setCommentModal((prev) =>
                  prev ? { ...prev, commentaire: e.target.value } : prev
                )
              }
            />
            <div className="suivi-modal__actions">
              <button
                type="button"
                className="btn-suivi btn-suivi--ghost"
                onClick={() => setCommentModal(null)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn-suivi btn-suivi--primary"
                onClick={confirmerCommentModal}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RelationSuivi;
