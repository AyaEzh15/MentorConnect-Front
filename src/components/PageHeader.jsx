function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mc-page-header">
      <div>
        <h1 className="mc-page-header__title">{title}</h1>
        {subtitle && <p className="mc-page-header__subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="mc-page-header__actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;
