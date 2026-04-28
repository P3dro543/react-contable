// ============================================================
// Pagination.jsx — Paginación reutilizable
// ============================================================

export function Pagination({ pagina, total, porPagina = 10, onPageChange }) {
  const totalPaginas = Math.ceil(total / porPagina);
  if (totalPaginas <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={pagina === 1}
        onClick={() => onPageChange(pagina - 1)}
      >‹</button>

      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          className={`page-btn ${p === pagina ? "active" : ""}`}
          onClick={() => onPageChange(p)}
        >{p}</button>
      ))}

      <button
        className="page-btn"
        disabled={pagina === totalPaginas}
        onClick={() => onPageChange(pagina + 1)}
      >›</button>
    </div>
  );
}