const STATUS_CONFIG = {
  EN_ATTENTE: { label: "En attente", className: "mc-badge mc-badge--pending" },
  ACCEPTEE: { label: "Acceptée", className: "mc-badge mc-badge--success" },
  REFUSE: { label: "Refusée", className: "mc-badge mc-badge--danger" },
  REFUSEE: { label: "Refusée", className: "mc-badge mc-badge--danger" },
  PLANIFIE: { label: "Planifié", className: "mc-badge mc-badge--pending" },
  CONFIRME: { label: "Confirmé", className: "mc-badge mc-badge--primary" },
  ANNULE: { label: "Annulé", className: "mc-badge mc-badge--danger" },
  TERMINE: { label: "Terminé", className: "mc-badge mc-badge--success" },
};

function StatusBadge({ statut }) {
  const config = STATUS_CONFIG[statut] || {
    label: statut || "-",
    className: "mc-badge mc-badge--muted",
  };

  return <span className={config.className}>{config.label}</span>;
}

export default StatusBadge;
