function ConfirmDialog({
  show,
  title = "Confirmation",
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}) {
  if (!show) {
    return null;
  }

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        onClick={onCancel}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          role="document"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                aria-label="Fermer"
              />
            </div>

            <div className="modal-body">
              <p className="mb-0 text-muted">{message}</p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button
                className={`btn btn-${confirmVariant}`}
                type="button"
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
}

export default ConfirmDialog;
