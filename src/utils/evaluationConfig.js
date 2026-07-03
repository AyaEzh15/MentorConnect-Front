export const EVALUATION_CONFIG = {
  MENTORE: {
    type: "MENTORE_VERS_MENTOR",
    title: "Evaluer votre mentor",
    subtitle: "Partagez votre retour sur la qualite du mentorat recu.",
    criteria: [
      "Qualite des conseils",
      "Disponibilite",
      "Pedagogie",
      "Ecoute",
    ],
    placeholder:
      "Ex : Conseils pertinents, tres a l'ecoute, explications claires...",
    buttonClass: "btn-primary",
    badgeLabel: "Mentore → Mentor",
    badgeClass: "bg-primary",
  },
  MENTOR: {
    type: "MENTOR_VERS_MENTORE",
    title: "Evaluer votre mentore",
    subtitle: "Signalez le niveau d'implication du mentore.",
    criteria: ["Serieux", "Preparation", "Implication"],
    placeholder:
      "Ex : Bien prepare, participe activement, respecte les engagements...",
    buttonClass: "btn-info",
    badgeLabel: "Mentor → Mentore",
    badgeClass: "bg-info text-dark",
  },
};

export function getEvaluationConfig(userRole) {
  return EVALUATION_CONFIG[userRole] || EVALUATION_CONFIG.MENTORE;
}

export function getEvaluationTypeLabel(type) {
  if (type === "MENTORE_VERS_MENTOR") {
    return EVALUATION_CONFIG.MENTORE.badgeLabel;
  }
  if (type === "MENTOR_VERS_MENTORE") {
    return EVALUATION_CONFIG.MENTOR.badgeLabel;
  }
  return type || "-";
}

export function getEvaluationTypeBadgeClass(type) {
  if (type === "MENTORE_VERS_MENTOR") {
    return EVALUATION_CONFIG.MENTORE.badgeClass;
  }
  if (type === "MENTOR_VERS_MENTORE") {
    return EVALUATION_CONFIG.MENTOR.badgeClass;
  }
  return "bg-secondary";
}
