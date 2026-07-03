import { useState } from "react";

function StarRating({ value = 0, onChange, readOnly = false, size = "2rem" }) {
  const [hover, setHover] = useState(0);

  const stars = [1, 2, 3, 4, 5];
  const active = hover || value;

  return (
    <div className="d-inline-flex" style={{ gap: "0.25rem" }}>
      {stars.map((star) => (
        <span
          key={star}
          role={readOnly ? undefined : "button"}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={star <= active ? "text-warning" : "text-secondary"}
          style={{
            fontSize: size,
            lineHeight: 1,
            cursor: readOnly ? "default" : "pointer",
            userSelect: "none",
          }}
          title={`${star} / 5`}
        >
          {star <= active ? "\u2605" : "\u2606"}
        </span>
      ))}
    </div>
  );
}

export default StarRating;
