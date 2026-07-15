import { useState } from "react";
import { resolveMediaUrl } from "../utils/mediaUrl";
import "./UserAvatar.css";

function getInitials(prenom = "", nom = "") {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "?";
}

function UserAvatar({
  photoUrl,
  prenom = "",
  nom = "",
  size = 40,
  className = "",
  rounded = "full",
  alt,
}) {
  const [broken, setBroken] = useState(false);
  const resolved = resolveMediaUrl(photoUrl);
  const hasPhoto = Boolean(resolved) && !broken;
  const radiusClass =
    rounded === "xl" ? "user-avatar--xl-radius" : "user-avatar--full";

  return (
    <span
      className={`user-avatar ${radiusClass} ${className}`.trim()}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.32) }}
      title={`${prenom} ${nom}`.trim()}
    >
      {hasPhoto ? (
        <img
          src={resolved}
          alt={alt || `${prenom} ${nom}`.trim() || "Photo de profil"}
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="user-avatar__initials">
          {getInitials(prenom, nom)}
        </span>
      )}
    </span>
  );
}

export default UserAvatar;
