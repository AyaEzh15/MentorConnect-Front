function SearchBar({ value, onChange, onSearch, placeholder = "Rechercher...", children }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="mc-search">
      <div className="row g-2 align-items-end">
        <div className="col">
          <label className="form-label">Recherche</label>
          <input
            className="form-control"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {children}

        {onSearch && (
          <div className="col-auto">
            <button className="btn btn-primary" type="button" onClick={onSearch}>
              Rechercher
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
