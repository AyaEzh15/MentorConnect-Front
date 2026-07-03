function LoadingSpinner({ message = "Chargement...", fullPage = true }) {
  const content = (
    <div className="text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      {message && <p className="mt-2 text-muted">{message}</p>}
    </div>
  );

  if (!fullPage) {
    return content;
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "60vh" }}
    >
      {content}
    </div>
  );
}

export default LoadingSpinner;
