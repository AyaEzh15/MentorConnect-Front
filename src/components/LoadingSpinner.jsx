function LoadingSpinner({ message = "Chargement...", fullPage = true }) {
  const content = (
    <div className="mc-spinner" style={fullPage ? undefined : { minHeight: "auto", padding: 24 }}>
      <div className="mc-spinner__circle" role="status" aria-label={message} />
      {message && <p>{message}</p>}
    </div>
  );

  return content;
}

export default LoadingSpinner;
