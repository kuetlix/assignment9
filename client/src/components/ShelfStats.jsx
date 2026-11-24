// Statistics panel, filled from GET /api/stats.
function ShelfStats({ stats, error }) {
  if (error) {
    return (
      <aside className="panel shelf-stats">
        <h2>Shelf at a glance</h2>
        <p className="form-error">Could not load statistics: {error}</p>
      </aside>
    );
  }

  if (!stats) {
    return (
      <aside className="panel shelf-stats">
        <h2>Shelf at a glance</h2>
        <p className="muted">Loading statistics…</p>
      </aside>
    );
  }

  const genres = Object.entries(stats.byGenre);

  return (
    <aside className="panel shelf-stats">
      <h2>Shelf at a glance</h2>

      <dl className="stat-tiles">
        <div>
          <dt>Books</dt>
          <dd>{stats.total}</dd>
        </div>
        <div>
          <dt>Read</dt>
          <dd>{stats.read}</dd>
        </div>
        <div>
          <dt>Unread</dt>
          <dd>{stats.unread}</dd>
        </div>
        <div>
          <dt>Avg. rating</dt>
          <dd>{stats.averageRating ?? '—'}</dd>
        </div>
      </dl>

      <h3>By genre</h3>
      {genres.length === 0 ? (
        <p className="muted">No books yet.</p>
      ) : (
        <ul className="genre-bars">
          {genres.map(([genre, count]) => (
            <li key={genre}>
              <span className="genre-name">{genre}</span>
              <span className="genre-bar">
                <span style={{ width: `${(count / stats.total) * 100}%` }} />
              </span>
              <span className="genre-count">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default ShelfStats;
