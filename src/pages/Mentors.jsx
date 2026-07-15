import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MentorCard from "../components/MentorCard";
import MentorProfileModal from "../components/MentorProfileModal";
import ProfilService from "../services/ProfilService";
import DomaineService from "../services/DomaineService";
import handleApiError from "../utils/handleApiError";
import "./Mentors.css";

const PAGE_SIZE = 6;

function matchesExperience(annees, niveau) {
  if (!niveau) return true;
  const years = Number(annees) || 0;
  if (niveau === "senior") return years >= 10;
  if (niveau === "confirme") return years >= 5 && years < 10;
  if (niveau === "intermediaire") return years >= 2 && years < 5;
  return true;
}

function Mentors() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProfil, setSelectedProfil] = useState(null);

  const [domaineId, setDomaineId] = useState("");
  const [competence, setCompetence] = useState("");
  const [experience, setExperience] = useState("");

  const [filters, setFilters] = useState({
    domaineId: "",
    competence: "",
    experience: "",
  });

  useEffect(() => {
    loadDomaines();
    loadMentors();
  }, []);

  const loadDomaines = async () => {
    try {
      const res = await DomaineService.getDomaines();
      setDomaines(res.data || []);
    } catch {
      // Les domaines restent optionnels côté filtres si l'API échoue
    }
  };

  const loadMentors = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await ProfilService.rechercheAvancee({
        role: "MENTOR",
        domaineId: params.domaineId || undefined,
        competence: params.competence || undefined,
      });
      setMentors(res.data || []);
      setPage(1);
    } catch (err) {
      setError(handleApiError(err, "Impossible de charger les mentors"));
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const appliquerFiltres = (e) => {
    e.preventDefault();
    const next = { domaineId, competence, experience };
    setFilters(next);
    loadMentors(next);
  };

  const filteredMentors = useMemo(
    () =>
      mentors.filter((profil) =>
        matchesExperience(profil.anneesExperiences, filters.experience)
      ),
    [mentors, filters.experience]
  );

  const totalPages = Math.max(1, Math.ceil(filteredMentors.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageMentors = filteredMentors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i += 1
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="mentors-page">
      <main className="mentors-page__container">
        <section>
          <div className="mentors-page__intro">
            <div>
              <h1 className="mentors-page__title">Trouvez votre Mentor</h1>
              <p className="mentors-page__subtitle">
                Connectez-vous avec des experts du secteur pour accélérer votre
                croissance professionnelle et atteindre vos objectifs.
              </p>
            </div>
            <div className="mentors-page__count">
              <span className="material-symbols-outlined">group</span>
              <span>
                {filteredMentors.length.toLocaleString("fr-FR")} Mentor
                {filteredMentors.length > 1 ? "s" : ""} disponible
                {filteredMentors.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <form className="mentors-filters" onSubmit={appliquerFiltres}>
            <div className="mentors-filters__field">
              <label className="mentors-filters__label" htmlFor="filtre-domaine">
                Domaine
              </label>
              <div className="mentors-filters__control">
                <span className="material-symbols-outlined">category</span>
                <select
                  id="filtre-domaine"
                  value={domaineId}
                  onChange={(e) => setDomaineId(e.target.value)}
                >
                  <option value="">Tous les domaines</option>
                  {domaines.map((domaine) => (
                    <option key={domaine.id} value={domaine.id}>
                      {domaine.libelle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mentors-filters__field">
              <label className="mentors-filters__label" htmlFor="filtre-competence">
                Compétences
              </label>
              <div className="mentors-filters__control">
                <span className="material-symbols-outlined">psychology</span>
                <input
                  id="filtre-competence"
                  type="text"
                  placeholder="Ex: React, SEO, Java..."
                  value={competence}
                  onChange={(e) => setCompetence(e.target.value)}
                />
              </div>
            </div>

            <div className="mentors-filters__field">
              <label className="mentors-filters__label" htmlFor="filtre-experience">
                Expérience
              </label>
              <div className="mentors-filters__control">
                <span className="material-symbols-outlined">clinical_notes</span>
                <select
                  id="filtre-experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
                  <option value="">Niveau d&apos;expérience</option>
                  <option value="senior">Sénior (10+ ans)</option>
                  <option value="confirme">Confirmé (5-10 ans)</option>
                  <option value="intermediaire">Intermédiaire (2-5 ans)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="mentors-filters__apply">
              <span className="material-symbols-outlined">filter_list</span>
              Appliquer
            </button>
          </form>
        </section>

        {loading && <p className="mentors-page__loading">Chargement des mentors…</p>}
        {error && <p className="mentors-page__error">{error}</p>}

        {!loading && !error && pageMentors.length === 0 && (
          <p className="mentors-page__empty">Aucun mentor trouvé.</p>
        )}

        {!loading && pageMentors.length > 0 && (
          <>
            <div className="mentors-grid">
              {pageMentors.map((profil, index) => (
                <MentorCard
                  key={profil.id}
                  profil={profil}
                  index={(currentPage - 1) * PAGE_SIZE + index}
                  topMentor={(Number(profil.anneesExperiences) || 0) >= 10}
                  onViewProfil={setSelectedProfil}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mentors-pagination">
                <button
                  type="button"
                  className="mentors-pagination__btn"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Page précédente"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                {pageNumbers.map((item, idx) =>
                  item === "…" ? (
                    <span key={`ellipsis-${idx}`} style={{ padding: "0 8px", color: "#757684" }}>
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      className={`mentors-pagination__btn${
                        item === currentPage ? " mentors-pagination__btn--active" : ""
                      }`}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="mentors-pagination__btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Page suivante"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedProfil && (
        <MentorProfileModal
          profil={selectedProfil}
          onClose={() => setSelectedProfil(null)}
          onDemander={() => navigate("/login")}
          demanderLabel="Demander"
        />
      )}

      <footer className="mentors-footer">
        <div className="mentors-footer__inner">
          <p className="mentors-footer__brand">MentorConnect</p>
          <div className="mentors-footer__links">
            <a href="#confidentialite">Confidentialité</a>
            <a href="#conditions">Conditions</a>
            <a href="#aide">Centre d&apos;aide</a>
            <a href="#contact">Contact</a>
          </div>
          <p className="mentors-footer__copy">
            © 2026 MentorConnect. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Mentors;
