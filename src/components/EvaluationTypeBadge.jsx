import {
  getEvaluationTypeBadgeClass,
  getEvaluationTypeLabel,
} from "../utils/evaluationConfig";

function EvaluationTypeBadge({ type }) {
  if (!type) {
    return <span className="text-muted">-</span>;
  }

  return (
    <span className={`badge ${getEvaluationTypeBadgeClass(type)}`}>
      {getEvaluationTypeLabel(type)}
    </span>
  );
}

export default EvaluationTypeBadge;
