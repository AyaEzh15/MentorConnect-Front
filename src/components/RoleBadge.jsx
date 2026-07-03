const ROLE_CONFIG = {
  ADMIN: { label: "Admin", className: "bg-dark" },
  MENTOR: { label: "Mentor", className: "bg-info text-dark" },
  MENTORE: { label: "Mentore", className: "bg-primary" },
};

function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || {
    label: role || "-",
    className: "bg-secondary",
  };

  return <span className={`badge ${config.className}`}>{config.label}</span>;
}

export default RoleBadge;
