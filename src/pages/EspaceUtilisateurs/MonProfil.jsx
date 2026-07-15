import { useEffect, useRef, useState } from "react";
import ProfilService from "../../services/ProfilService";
import DomaineService from "../../services/DomaineService";
import UtilisateurService from "../../services/UtilisateurService";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import UserAvatar from "../../components/UserAvatar";
import handleApiError from "../../utils/handleApiError";

const EMPTY_FORM = {
  biographie: "",
  secteur: "",
  competences: "",
  anneesExperiences: "",
  linkedinUrl: "",
  disponibilites: "",
};

function isSameUser(a, b) {
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.photoProfil === b.photoProfil &&
    a.prenom === b.prenom &&
    a.nom === b.nom &&
    a.email === b.email
  );
}

function MonProfil({ setUser }) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const hasLoaded = useRef(false);

  const [user, setLocalUser] = useState(currentUser);
  const [photoProfil, setPhotoProfil] = useState(currentUser?.photoProfil || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [profilId, setProfilId] = useState(null);
  const [selectedDomaineIds, setSelectedDomaineIds] = useState([]);
  const [domaineToAdd, setDomaineToAdd] = useState("");
  const [domaines, setDomaines] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const syncSessionUser = (nextUser, { updateNavbar = false } = {}) => {
    setLocalUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));

    // Ne met à jour App/Navbar que si nécessaire, pour éviter
    // remount des routes + boucle de requêtes.
    if (updateNavbar && setUser) {
      setUser((prev) => (isSameUser(prev, nextUser) ? prev : nextUser));
    }
  };

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    if (!currentUser?.id) {
      setLoading(false);
      setErreur("Utilisateur non connecte.");
      return;
    }

    const loadData = async () => {
      try {
        const [domainesRes, utilisateurRes] = await Promise.all([
          DomaineService.getDomaines(),
          UtilisateurService.getUtilisateurById(currentUser.id),
        ]);

        setDomaines(domainesRes.data || []);

        if (utilisateurRes.data) {
          // Pas de setUser ici : évite la boucle infinie App -> remount -> reload
          syncSessionUser(utilisateurRes.data, { updateNavbar: false });
          setPhotoProfil(utilisateurRes.data.photoProfil || "");
        }

        try {
          const profilRes = await ProfilService.getProfilByUtilisateur(
            currentUser.id
          );
          const profil = profilRes.data;

          if (profil?.id) {
            setProfilId(profil.id);
            setSelectedDomaineIds(
              (profil.domaines || []).map((d) => String(d.id))
            );
            setForm({
              biographie: profil.biographie || "",
              secteur: profil.secteur || "",
              competences: profil.competences || "",
              anneesExperiences:
                profil.anneesExperiences != null
                  ? profil.anneesExperiences
                  : "",
              linkedinUrl: profil.linkedinUrl || "",
              disponibilites: profil.disponibilites || "",
            });
          }
        } catch (error) {
          if (error?.response?.status !== 404) {
            setErreur(handleApiError(error));
          }
        }
      } catch (error) {
        setErreur(handleApiError(error));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const availableDomaines = domaines.filter(
    (d) => !selectedDomaineIds.includes(String(d.id))
  );

  const selectedDomaines = selectedDomaineIds
    .map((id) => domaines.find((d) => String(d.id) === String(id)))
    .filter(Boolean);

  const addDomaine = () => {
    if (!domaineToAdd) return;
    const id = String(domaineToAdd);
    if (!selectedDomaineIds.includes(id)) {
      setSelectedDomaineIds((prev) => [...prev, id]);
    }
    setDomaineToAdd("");
  };

  const removeDomaine = (id) => {
    setSelectedDomaineIds((prev) => prev.filter((d) => d !== String(id)));
  };

  const syncUserPhoto = async () => {
    // Si l'URL n'a pas changé (upload fichier déjà fait), skip
    if ((photoProfil || "") === (user.photoProfil || "")) {
      return user;
    }

    const updated = await UtilisateurService.updateUtilisateur(user.id, {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      photoProfil: photoProfil.trim() || null,
      actif: user.actif ?? true,
    });

    const nextUser = updated.data;
    syncSessionUser(nextUser, { updateNavbar: true });
    return nextUser;
  };

  const handlePhotoFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user?.id) return;

    setMessage("");
    setErreur("");
    setUploadingPhoto(true);

    try {
      const res = await UtilisateurService.uploadPhoto(user.id, file);
      const nextUser = res.data;
      setPhotoProfil(nextUser.photoProfil || "");
      syncSessionUser(nextUser, { updateNavbar: true });
      setMessage("Photo de profil mise a jour.");
    } catch (error) {
      setErreur(handleApiError(error, "Erreur lors de l'upload de la photo"));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");

    if (selectedDomaineIds.length === 0) {
      setErreur("Veuillez choisir au moins un domaine.");
      return;
    }

    const payload = {
      ...form,
      anneesExperiences:
        form.anneesExperiences === "" ? null : Number(form.anneesExperiences),
      disponibilites:
        user?.role === "MENTOR" ? form.disponibilites : null,
    };

    try {
      await syncUserPhoto();

      if (profilId) {
        const res = await ProfilService.updateProfil(
          profilId,
          selectedDomaineIds,
          payload
        );
        setMessage("Profil mis a jour avec succes.");
        if (res.data?.id) {
          setProfilId(res.data.id);
        }
        if (res.data?.domaines) {
          setSelectedDomaineIds(res.data.domaines.map((d) => String(d.id)));
        }
      } else {
        const res = await ProfilService.createProfil(
          user.id,
          selectedDomaineIds,
          payload
        );
        setProfilId(res.data?.id || null);
        setMessage("Profil cree avec succes.");
        if (res.data?.domaines) {
          setSelectedDomaineIds(res.data.domaines.map((d) => String(d.id)));
        }
      }
    } catch (error) {
      setErreur(
        handleApiError(error, "Erreur lors de l'enregistrement du profil")
      );
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement du profil..." />;
  }

  return (
    <div className="mc-page mc-page--medium">
      <PageHeader
        title="Mon profil"
        subtitle="Renseignez votre domaine, vos compétences et votre photo."
      />

      {message && <div className="alert alert-success">{message}</div>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {!profilId && (
        <div className="alert alert-info">
          Vous n'avez pas encore de profil. Completez ce formulaire pour
          apparaitre dans les recherches.
        </div>
      )}

      <form onSubmit={handleSubmit} className="card shadow-sm">
        <div className="card-body">
          <div className="mb-4 d-flex align-items-center gap-3">
            <UserAvatar
              photoUrl={photoProfil}
              prenom={user?.prenom}
              nom={user?.nom}
              size={72}
            />
            <div className="flex-grow-1">
              <label className="form-label">Photo de profil</label>
              <input
                className="form-control mb-2"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handlePhotoFile}
                disabled={uploadingPhoto}
              />
              <small className="text-muted d-block mb-2">
                {uploadingPhoto
                  ? "Upload en cours…"
                  : "JPG, PNG, WEBP ou GIF — 5 Mo max."}
              </small>
              <label className="form-label">Ou lien URL (optionnel)</label>
              <input
                className="form-control"
                type="text"
                placeholder="https://exemple.com/ma-photo.jpg"
                value={photoProfil}
                onChange={(e) => setPhotoProfil(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Domaines *</label>

            {selectedDomaines.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-2">
                {selectedDomaines.map((domaine) => (
                  <span
                    key={domaine.id}
                    className="badge text-bg-primary d-inline-flex align-items-center gap-2"
                    style={{ fontSize: "0.9rem", fontWeight: 500, padding: "0.45em 0.7em" }}
                  >
                    {domaine.libelle}
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      style={{ fontSize: "0.55rem" }}
                      aria-label={`Retirer ${domaine.libelle}`}
                      onClick={() => removeDomaine(domaine.id)}
                    />
                  </span>
                ))}
              </div>
            )}

            <div className="input-group">
              <select
                className="form-select"
                value={domaineToAdd}
                onChange={(e) => setDomaineToAdd(e.target.value)}
                disabled={availableDomaines.length === 0}
              >
                <option value="">
                  {availableDomaines.length === 0
                    ? "Tous les domaines sont déjà sélectionnés"
                    : "Choisir un domaine…"}
                </option>
                {availableDomaines.map((domaine) => (
                  <option key={domaine.id} value={domaine.id}>
                    {domaine.libelle}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={addDomaine}
                disabled={!domaineToAdd}
              >
                Ajouter
              </button>
            </div>
            <small className="text-muted">
              Sélectionnez un domaine, cliquez sur Ajouter, puis répétez pour en ajouter d&apos;autres.
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Competences</label>
            <textarea
              className="form-control"
              name="competences"
              rows="2"
              placeholder="Ex : Java, Spring Boot, React, gestion de projet..."
              value={form.competences}
              onChange={handleChange}
            />
            <small className="text-muted">
              Separez les competences par des virgules.
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Secteur</label>
            <input
              className="form-control"
              name="secteur"
              placeholder="Ex : Informatique, Finance, Sante..."
              value={form.secteur}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Annees d'experience</label>
            <input
              type="number"
              min="0"
              className="form-control"
              name="anneesExperiences"
              value={form.anneesExperiences}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Biographie</label>
            <textarea
              className="form-control"
              name="biographie"
              rows="3"
              placeholder="Presentez-vous en quelques lignes..."
              value={form.biographie}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Lien LinkedIn</label>
            <input
              className="form-control"
              name="linkedinUrl"
              placeholder="https://www.linkedin.com/in/..."
              value={form.linkedinUrl}
              onChange={handleChange}
            />
          </div>

          {user?.role === "MENTOR" && (
            <div className="mb-3">
              <label className="form-label">Disponibilités</label>
              <input
                className="form-control"
                name="disponibilites"
                placeholder="Ex : Lundi et mercredi après-midi"
                value={form.disponibilites}
                onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">
            {profilId ? "Mettre a jour mon profil" : "Creer mon profil"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MonProfil;
