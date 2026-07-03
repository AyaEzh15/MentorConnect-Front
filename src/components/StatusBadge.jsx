const STATUS_CONFIG = {
  EN_ATTENTE: { label: "En attente", className: "bg-warning text-dark" },
  ACCEPTEE: { label: "Acceptee", className: "bg-success" },
  REFUSE: { label: "Refusee", className: "bg-danger" },
  REFUSEE: { label: "Refusee", className: "bg-danger" },
  PLANIFIE: { label: "Planifie", className: "bg-warning text-dark" },
  CONFIRME: { label: "Confirme", className: "bg-primary" },
  ANNULE: { label: "Annule", className: "bg-danger" },
  TERMINE: { label: "Termine", className: "bg-success" },
};

function StatusBadge({ statut }) {
  const config = STATUS_CONFIG[statut] || {
    label: statut || "-",
    className: "bg-secondary",
  };

  return <span className={`badge ${config.className}`}>{config.label}</span>;
}

export default StatusBadge;
