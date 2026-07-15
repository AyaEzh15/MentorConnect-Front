import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import frLocale from "@fullcalendar/core/locales/fr";
import RendezVousService from "../../services/RendezVousService";
import RelationService from "../../services/RelationService";
import ProfilService from "../../services/ProfilService";
import PageHeader from "../../components/PageHeader";
import handleApiError from "../../utils/handleApiError";
import { getEffectiveStatut } from "../../utils/rendezVousJoin";
import "./Calendrier.css";

const STATUS_META = {
  PLANIFIE: { label: "Planifié", bg: "#e8ecff", border: "#4b6bff" },
  CONFIRME: { label: "Confirmé", bg: "#e8ecff", border: "#00288e" },
  TERMINE: { label: "Terminé", bg: "#dcfce7", border: "#16a34a" },
  ANNULE: { label: "Annulé", bg: "#fee2e2", border: "#dc2626" },
};

function formatEventTime(dateInput) {
  if (!dateInput) return "";
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusPrefix(statut) {
  if (statut === "TERMINE") return "Terminé: ";
  if (statut === "ANNULE") return "Annulé: ";
  return "";
}

function Calendrier() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isMentor = user?.role === "MENTOR";

  const [events, setEvents] = useState([]);
  const [disponibilites, setDisponibilites] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rawRdvs, setRawRdvs] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const [rdvRes, relRes] = await Promise.all([
        RendezVousService.getRendezVous(),
        isMentor
          ? RelationService.getRelationsByMentor(user.id)
          : RelationService.getRelationsByMentore(user.id),
      ]);

      const myRdv = (rdvRes.data || []).filter((rdv) => {
        const mentorId = rdv.miseEnRelation?.mentor?.id;
        const mentoreId =
          typeof rdv.miseEnRelation?.mentore === "number"
            ? rdv.miseEnRelation.mentore
            : rdv.miseEnRelation?.mentore?.id;
        return mentorId === user.id || mentoreId === user.id;
      });
      setRawRdvs(myRdv);

      const accepted = (relRes.data || []).filter((r) => r.statut === "ACCEPTEE");
      const disponoItems = [];

      if (isMentor) {
        try {
          const profilRes = await ProfilService.getProfilByUtilisateur(user.id);
          if (profilRes.data?.disponibilites?.trim()) {
            disponoItems.push({
              label: "Mes disponibilités",
              text: profilRes.data.disponibilites.trim(),
            });
          }
        } catch {
          // profil optionnel
        }
      } else {
        for (const relation of accepted) {
          const mentorId = relation.mentor?.id;
          if (!mentorId) continue;
          try {
            const profilRes = await ProfilService.getProfilByUtilisateur(mentorId);
            if (profilRes.data?.disponibilites?.trim()) {
              disponoItems.push({
                label: `${relation.mentor?.prenom || ""} ${relation.mentor?.nom || ""}`.trim(),
                text: profilRes.data.disponibilites.trim(),
              });
            }
          } catch {
            // ignore
          }
        }
      }
      setDisponibilites(disponoItems);
    } catch (err) {
      setError(handleApiError(err, "Impossible de charger le calendrier"));
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return rawRdvs
      .map((rdv) => {
        const statut = getEffectiveStatut(rdv, now);
        const mentor = rdv.miseEnRelation?.mentor;
        const mentore =
          typeof rdv.miseEnRelation?.mentore === "object"
            ? rdv.miseEnRelation.mentore
            : null;
        const other = isMentor
          ? `${mentore?.prenom || ""} ${mentore?.nom || ""}`.trim()
          : `${mentor?.prenom || ""} ${mentor?.nom || ""}`.trim();

        const start = rdv.dateHeure;
        if (!start) return null;
        const duree = rdv.duree || 60;
        const end = new Date(new Date(start).getTime() + duree * 60 * 1000);

        return {
          id: String(rdv.id),
          title: other || rdv.notes || "Session",
          start,
          end: end.toISOString(),
          classNames: [`mc-cal-event-wrap--${statut}`],
          extendedProps: {
            statut,
            notes: rdv.notes || "",
            rdv,
          },
        };
      })
      .filter(Boolean)
      .filter((ev) => {
        if (filter === "all") return true;
        if (filter === "a_venir") {
          return (
            (ev.extendedProps.statut === "PLANIFIE" ||
              ev.extendedProps.statut === "CONFIRME") &&
            new Date(ev.start) >= now
          );
        }
        if (filter === "termine") return ev.extendedProps.statut === "TERMINE";
        if (filter === "annule") return ev.extendedProps.statut === "ANNULE";
        return true;
      });
  }, [rawRdvs, filter, isMentor]);

  useEffect(() => {
    setEvents(filteredEvents);
  }, [filteredEvents]);

  const renderEventContent = (arg) => {
    const statut = arg.event.extendedProps.statut || "PLANIFIE";
    const notes = arg.event.extendedProps.notes;
    const time = formatEventTime(arg.event.start);
    const label = notes
      ? `${arg.event.title} · ${notes}`
      : arg.event.title;
    const selected =
      selectedEventId != null && String(arg.event.id) === String(selectedEventId);
    const classes = [
      "mc-cal-event",
      `mc-cal-event--${statut}`,
      selected ? "mc-cal-event--selected" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={classes} title={`${time} - ${statusPrefix(statut)}${label}`}>
        <span className="mc-cal-event__bar" aria-hidden />
        <span className="mc-cal-event__body">
          {time ? `${time} - ` : ""}
          {statusPrefix(statut)}
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="mc-page calendrier-page">
      <PageHeader
        title="Calendrier"
        subtitle="Rendez-vous à venir, terminés, annulés et disponibilités"
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="calendrier-filters">
        {[
          { id: "all", label: "Tous" },
          { id: "a_venir", label: "À venir" },
          { id: "termine", label: "Terminés" },
          { id: "annule", label: "Annulés" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={`calendrier-filter${
              filter === f.id ? " calendrier-filter--active" : ""
            }`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="calendrier-legend">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <span key={key}>
            <i style={{ background: meta.bg, borderColor: meta.border }} />
            {meta.label}
          </span>
        ))}
      </div>

      <div className="calendrier-layout">
        <div className="calendrier-main">
          {loading ? (
            <p className="text-muted">Chargement du calendrier…</p>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
              initialView="dayGridMonth"
              locale={frLocale}
              firstDay={1}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,listWeek",
              }}
              buttonText={{
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                list: "Liste",
              }}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              slotDuration="01:00:00"
              slotLabelInterval="01:00:00"
              slotLabelContent={(arg) => {
                const h = String(arg.date.getHours()).padStart(2, "0");
                return `${h} h`;
              }}
              allDaySlot={false}
              nowIndicator
              events={events}
              height="auto"
              eventDisplay="block"
              dayMaxEvents={3}
              eventContent={renderEventContent}
              eventClick={(info) => {
                info.jsEvent.preventDefault();
                setSelectedEventId(info.event.id);
              }}
              dateClick={() => setSelectedEventId(null)}
            />
          )}
        </div>

        <aside className="calendrier-aside">
          <h3>Disponibilités {isMentor ? "" : "des mentors"}</h3>
          {disponibilites.length === 0 ? (
            <p className="text-muted mb-0">
              {isMentor
                ? "Renseignez vos disponibilités dans Mon profil."
                : "Aucune disponibilité renseignée pour vos mentors."}
            </p>
          ) : (
            <ul className="calendrier-dispono">
              {disponibilites.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

export default Calendrier;
