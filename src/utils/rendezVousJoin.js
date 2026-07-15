const JOIN_MINUTES_BEFORE = 10;

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/**
 * meet.jit.si bloque les salles sans hôte 8x8 authentifié.
 * On redirige ces anciens liens vers une instance Jitsi ouverte.
 */
export function resolveMeetingUrl(url) {
  if (!isHttpUrl(url)) return "";
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === "meet.jit.si" || parsed.hostname === "8x8.vc") {
      const room = parsed.pathname.replace(/^\//, "").split("#")[0];
      if (!room) return trimmed;
      return `https://meet.ffmuc.net/${room}`;
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}

export function getMeetingWindow(rdv) {
  const start = parseDate(rdv?.dateHeure);
  if (!start) return null;

  const durationMs = (rdv.duree || 60) * 60 * 1000;
  const joinFrom = new Date(start.getTime() - JOIN_MINUTES_BEFORE * 60 * 1000);
  const joinUntil = new Date(start.getTime() + durationMs);

  return { start, joinFrom, joinUntil, durationMs };
}

/** True si date + durée est dépassée (ex. 10:30 + 30 min → après 11:00). */
export function isMeetingEnded(rdv, now = new Date()) {
  const window = getMeetingWindow(rdv);
  if (!window) return false;
  return now.getTime() > window.joinUntil.getTime();
}

/**
 * Statut affiché / utile pour les actions.
 * PLANIFIE/CONFIRME dont la durée est écoulée → traité comme TERMINE.
 */
export function getEffectiveStatut(rdv, now = new Date()) {
  if (!rdv) return null;
  if (rdv.statut === "ANNULE") return "ANNULE";
  if (rdv.statut === "TERMINE") return "TERMINE";
  if (
    (rdv.statut === "PLANIFIE" || rdv.statut === "CONFIRME") &&
    isMeetingEnded(rdv, now)
  ) {
    return "TERMINE";
  }
  return rdv.statut;
}

/** True si on peut rejoindre l'appel (10 min avant → fin de la durée). */
export function canJoinMeeting(rdv, now = new Date()) {
  const statut = getEffectiveStatut(rdv, now);
  if (statut !== "PLANIFIE" && statut !== "CONFIRME") return false;

  const window = getMeetingWindow(rdv);
  if (!window || !isHttpUrl(rdv?.lieuReunion)) return false;

  const t = now.getTime();
  return t >= window.joinFrom.getTime() && t <= window.joinUntil.getTime();
}

/** RDV encore pertinent : à venir ou en cours (non terminé). */
export function isRdvUpcomingOrOngoing(rdv, now = new Date()) {
  const statut = getEffectiveStatut(rdv, now);
  if (statut !== "PLANIFIE" && statut !== "CONFIRME") return false;

  const window = getMeetingWindow(rdv);
  if (!window) return false;

  return now.getTime() <= window.joinUntil.getTime();
}

export function getJoinLabel(rdv, now = new Date()) {
  if (!isHttpUrl(rdv?.lieuReunion)) {
    return { canJoin: false, label: "Voir le rendez-vous" };
  }

  const window = getMeetingWindow(rdv);
  if (!window) {
    return { canJoin: false, label: "Lien indisponible" };
  }

  if (getEffectiveStatut(rdv, now) === "TERMINE" || isMeetingEnded(rdv, now)) {
    return { canJoin: false, label: "Session terminée" };
  }

  const t = now.getTime();
  if (t < window.joinFrom.getTime()) {
    return {
      canJoin: false,
      label: `Disponible ${JOIN_MINUTES_BEFORE} min avant`,
    };
  }
  if (t > window.joinUntil.getTime()) {
    return { canJoin: false, label: "Session terminée" };
  }
  return { canJoin: true, label: "Rejoindre l'appel" };
}
