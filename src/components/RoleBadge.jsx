const ROLE_CONFIG = {
  ADMIN: { label: "Admin", className: "mc-badge mc-badge--muted" },
  MENTOR: { label: "Mentor", className: "mc-badge mc-badge--primary" },
  MENTORE: { label: "Mentoré", className: "mc-badge mc-badge--success" },
};

function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || {
    label: role || "-",
    className: "mc-badge mc-badge--muted",
  };

  return <span className={config.className}>{config.label}</span>;
}

export default RoleBadge;
