function DataTable({ columns, data, emptyMessage = "Aucune donnée trouvée.", rowKey = "id" }) {
  if (!data || data.length === 0) {
    return <div className="mc-empty">{emptyMessage}</div>;
  }

  const getKey = (row, index) =>
    typeof rowKey === "function" ? rowKey(row) : row[rowKey] ?? index;

  const renderCell = (column, row) => {
    if (typeof column.render === "function") {
      return column.render(row);
    }
    return row[column.accessor] ?? "-";
  };

  return (
    <div className="mc-table-wrap table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            {columns.map((column, i) => (
              <th key={column.header ?? i}>{column.header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={getKey(row, index)}>
              {columns.map((column, i) => (
                <td key={column.header ?? i}>{renderCell(column, row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
