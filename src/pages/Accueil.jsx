import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Accueil.css";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDeCXqZLaK0sM2Y2nY3kvOPDotyy252zTDiPkOieRyWLQQCh6qbd7FUdNGiwXgz6SSr3LpM9qttAgSVDNfVDbXnz8bbasp5exuRlbzwrYCXwlaxq3-UF8R8C0BKlRUxqCrhfmXFKDZmPztHWJ4Km-KvwJVLFoi2wxNJ3G7yhht3xSdZAX_9x_rEu0CWRq-Gxmzl5CKpv6tiQtsW-w6a8ON6-7-Do1XmAOoz1-qlZwTHtEyxXKw1WK_VBvnMZFKpWCUB7Hg5ZKidcYhr";
const AVATAR_SARAH =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD0TOi6tGch5vGoB0-bEEeXUxIpvwN4HUTzt2Vo_tl9vec-Y9kgwi9rzT7hatzz7sG-wzlOQYc0bfKQBRf8BCMsKpysYVYG2SWFs_wzdcU7nW7JFQ9Db97C30cedmWuv44JGKQKozUitEnHkws58-YQlJSa2r2iWJsOFCrdbNjdCY9kxMmZ-LRfiDGoLRRYkVOBCFqxbxValVTeWm2LYFcjLjaGLzRhrfkQmpORfrp2B6wly5X7QWkERbhDF55RWbmfnyJb0watdbos";
const AVATAR_LUCAS =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBDyUX9xk2PT-OI3xHgm-gsi8R93MmP7U-IVePQs93-kpT0fafSNGL5ellxHK60xAu7SFT36wuRAzc1fCFdpyonOMIdROqB5PJSXng7LubeAJCdSUPHRcRUpC0LtPP-yMwFPECiDs7N--opoLF1-jusPTirjZLOwUw5xpvBUglppxYjmTryQno_78pfujIly4FiVSvuqgQe5zsLgaVkfgR3PRYKJk1iTJn1xoHtePk3cEVsg57hB0iyrQT2Rr_fycQ1BmHBAO5ZK90q";

function Accueil() {
  useEffect(() => {
    const sections = document.querySelectorAll(".accueil-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="accueil-page">
      <main>
        <section className="accueil-hero accueil-reveal">
          <div className="mc-container accueil-hero__inner">
            <div className="accueil-hero__content">
              <span className="accueil-badge">Évolution de carrière 2.0</span>
              <h1 className="accueil-hero__title">
                Propulsez votre carrière avec un mentor expert
              </h1>
              <p className="accueil-hero__text">
                Rejoignez la plus grande communauté francophone de mentorat.
                Apprenez, partagez et grandissez aux côtés des meilleurs leaders
                de l&apos;industrie.
              </p>
              <div className="accueil-hero__actions">
                <Link className="accueil-btn accueil-btn--primary" to="/register">
                  Commencer maintenant
                </Link>
                <Link className="accueil-btn accueil-btn--secondary" to="/mentors">
                  Découvrir les mentors
                </Link>
              </div>
            </div>

            <div className="accueil-hero__visual">
              <div className="accueil-hero__image-wrap">
                <img
                  src={HERO_IMG}
                  alt="Mentor et mentoré en discussion collaborativement"
                />
              </div>
              <div className="accueil-live-card">
                <div className="accueil-live-card__status">
                  <span className="accueil-live-card__dot" />
                  <span>Session en direct</span>
                </div>
                <p className="accueil-live-card__title">Marketing Stratégique</p>
                <p className="accueil-live-card__subtitle">avec Thomas Durand</p>
              </div>
            </div>
          </div>
        </section>

        <section className="accueil-stats accueil-reveal">
          <div className="mc-container">
            <div className="accueil-stats__grid">
              <div>
                <div className="accueil-stats__value">1000+</div>
                <div className="accueil-stats__label">Mentors experts</div>
              </div>
              <div>
                <div className="accueil-stats__value">5000+</div>
                <div className="accueil-stats__label">Matches réussis</div>
              </div>
              <div>
                <div className="accueil-stats__value">98%</div>
                <div className="accueil-stats__label">Satisfaction</div>
              </div>
              <div>
                <div className="accueil-stats__value">50+</div>
                <div className="accueil-stats__label">Industries</div>
              </div>
            </div>
          </div>
        </section>

        <section className="accueil-section accueil-reveal">
          <div className="mc-container">
            <div className="accueil-section__header">
              <h2 className="accueil-section__title">Pourquoi MentorConnect ?</h2>
              <p className="accueil-section__subtitle">
                Une plateforme conçue pour accélérer votre développement
                professionnel grâce à des connexions humaines significatives.
              </p>
            </div>
            <div className="accueil-features">
              <div className="accueil-feature">
                <div className="accueil-feature__icon accueil-feature__icon--primary">
                  <span className="material-symbols-outlined">hub</span>
                </div>
                <h3 className="accueil-feature__title">Networking Elite</h3>
                <p className="accueil-feature__text">
                  Accédez à un réseau exclusif de professionnels chevronnés dans
                  la tech, le design, et le business.
                </p>
              </div>
              <div className="accueil-feature">
                <div className="accueil-feature__icon accueil-feature__icon--secondary">
                  <span className="material-symbols-outlined">model_training</span>
                </div>
                <h3 className="accueil-feature__title">Skill Sharing</h3>
                <p className="accueil-feature__text">
                  Bénéficiez d&apos;un transfert de compétences direct et
                  pratique, loin des théories académiques.
                </p>
              </div>
              <div className="accueil-feature">
                <div className="accueil-feature__icon accueil-feature__icon--tertiary">
                  <span className="material-symbols-outlined">track_changes</span>
                </div>
                <h3 className="accueil-feature__title">Guidance Structurée</h3>
                <p className="accueil-feature__text">
                  Des parcours de mentorat balisés avec des objectifs clairs pour
                  mesurer vos progrès réels.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="accueil-section accueil-section--alt accueil-reveal">
          <div className="mc-container">
            <h2 className="accueil-section__title" style={{ textAlign: "center", marginBottom: 64 }}>
              Comment ça marche
            </h2>
            <div className="accueil-howto">
              <div className="accueil-howto__col">
                <div className="accueil-howto__heading">
                  <div className="accueil-howto__heading-icon accueil-howto__heading-icon--primary">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <h3>Pour les Mentorés</h3>
                </div>
                <div className="accueil-timeline">
                  <div className="accueil-timeline__item">
                    <span className="accueil-timeline__dot" />
                    <p className="accueil-timeline__step">Étape 01</p>
                    <p className="accueil-timeline__title">Créez votre profil</p>
                    <p className="accueil-timeline__text">
                      Définissez vos objectifs de carrière et vos compétences
                      cibles.
                    </p>
                  </div>
                  <div className="accueil-timeline__item">
                    <span className="accueil-timeline__dot" />
                    <p className="accueil-timeline__step">Étape 02</p>
                    <p className="accueil-timeline__title">Trouvez l&apos;expert idéal</p>
                    <p className="accueil-timeline__text">
                      Notre algorithme vous propose des mentors alignés avec vos
                      ambitions.
                    </p>
                  </div>
                  <div className="accueil-timeline__item">
                    <span className="accueil-timeline__dot" />
                    <p className="accueil-timeline__step">Étape 03</p>
                    <p className="accueil-timeline__title">Lancez vos sessions</p>
                    <p className="accueil-timeline__text">
                      Échangez en visioconférence et suivez votre roadmap
                      personnalisée.
                    </p>
                  </div>
                </div>
              </div>

              <div className="accueil-howto__col">
                <div className="accueil-howto__heading">
                  <div className="accueil-howto__heading-icon accueil-howto__heading-icon--secondary">
                    <span className="material-symbols-outlined">workspace_premium</span>
                  </div>
                  <h3>Pour les Mentors</h3>
                </div>
                <div className="accueil-timeline accueil-timeline--secondary">
                  <div className="accueil-timeline__item">
                    <span className="accueil-timeline__dot accueil-timeline__dot--secondary" />
                    <p className="accueil-timeline__step accueil-timeline__step--secondary">
                      Étape 01
                    </p>
                    <p className="accueil-timeline__title">Postulez comme Mentor</p>
                    <p className="accueil-timeline__text">
                      Partagez votre expertise et rejoignez une communauté
                      d&apos;élite.
                    </p>
                  </div>
                  <div className="accueil-timeline__item">
                    <span className="accueil-timeline__dot accueil-timeline__dot--secondary" />
                    <p className="accueil-timeline__step accueil-timeline__step--secondary">
                      Étape 02
                    </p>
                    <p className="accueil-timeline__title">Définissez vos créneaux</p>
                    <p className="accueil-timeline__text">
                      Gérez votre emploi du temps et choisissez vos mentorés
                      selon vos critères.
                    </p>
                  </div>
                  <div className="accueil-timeline__item">
                    <span className="accueil-timeline__dot accueil-timeline__dot--secondary" />
                    <p className="accueil-timeline__step accueil-timeline__step--secondary">
                      Étape 03
                    </p>
                    <p className="accueil-timeline__title">Inspirez le futur</p>
                    <p className="accueil-timeline__text">
                      Aidez les talents à surmonter leurs blocages et développez
                      votre leadership.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="accueil-section accueil-reveal">
          <div className="mc-container">
            <div className="accueil-section__header" style={{ marginBottom: 64 }}>
              <h2 className="accueil-section__title">Histoires de succès</h2>
            </div>
            <div className="accueil-testimonials">
              <article className="accueil-testimonial">
                <div>
                  <div className="accueil-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined">
                        star
                      </span>
                    ))}
                  </div>
                  <p className="accueil-testimonial__quote">
                    &ldquo;Grâce à mon mentor chez MentorConnect, j&apos;ai pu
                    négocier une promotion de +25% et structurer toute mon équipe
                    de design en moins de 6 mois. C&apos;est l&apos;investissement
                    le plus rentable de ma carrière.&rdquo;
                  </p>
                </div>
                <div className="accueil-testimonial__author">
                  <div className="accueil-testimonial__avatar">
                    <img src={AVATAR_SARAH} alt="Sarah Belkacem" />
                  </div>
                  <div>
                    <p className="accueil-testimonial__name">Sarah Belkacem</p>
                    <p className="accueil-testimonial__role">
                      Head of Design, TechFlow
                    </p>
                  </div>
                </div>
              </article>

              <article className="accueil-testimonial">
                <div>
                  <div className="accueil-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined">
                        star
                      </span>
                    ))}
                  </div>
                  <p className="accueil-testimonial__quote">
                    &ldquo;La plateforme est intuitive et le matching est d&apos;une
                    précision incroyable. Mon mentor m&apos;a aidé à passer d&apos;un
                    profil junior à un rôle de Senior Developer en un temps
                    record.&rdquo;
                  </p>
                </div>
                <div className="accueil-testimonial__author">
                  <div className="accueil-testimonial__avatar accueil-testimonial__avatar--secondary">
                    <img src={AVATAR_LUCAS} alt="Lucas Martin" />
                  </div>
                  <div>
                    <p className="accueil-testimonial__name">Lucas Martin</p>
                    <p className="accueil-testimonial__role">
                      Senior Developer, DataCore
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="accueil-section accueil-reveal">
          <div className="mc-container">
            <div className="accueil-cta-banner">
              <div className="accueil-cta-banner__inner">
                <h2 className="accueil-cta-banner__title">
                  Prêt à franchir une nouvelle étape ?
                </h2>
                <p className="accueil-cta-banner__text">
                  Rejoignez des milliers de professionnels qui transforment leur
                  carrière chaque jour.
                </p>
                <Link className="accueil-btn accueil-btn--cta" to="/register">
                  Inscrivez-vous gratuitement
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="accueil-footer">
        <div className="mc-container accueil-footer__inner">
          <div>
            <p className="accueil-footer__brand">MentorConnect</p>
            <p className="accueil-footer__copy">
              © 2026 MentorConnect. Tous droits réservés.
            </p>
          </div>
          <div className="accueil-footer__links">
            <a href="#confidentialite">Confidentialité</a>
            <a href="#conditions">Conditions</a>
            <a href="#aide">Centre d&apos;aide</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="accueil-footer__social">
            <button type="button" className="accueil-footer__social-btn" aria-label="Partager">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button type="button" className="accueil-footer__social-btn" aria-label="Contact">
              <span className="material-symbols-outlined">alternate_email</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Accueil;
