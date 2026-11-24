// Shows the list of books, or a loading / error / empty message instead.
function ShelfTable({ books, status, error, onRetry }) {
  if (status === 'error') {
    return (
      <div className="state state-error" role="alert">
        <p>Could not load books: {error}</p>
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (status === 'loading' && books.length === 0) {
    return <p className="state">Loading books…</p>;
  }

  if (books.length === 0) {
    return <p className="state">No books match these filters.</p>;
  }

  return (
    <div className={status === 'loading' ? 'table-wrap is-refreshing' : 'table-wrap'}>
      <table className="shelf-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Year</th>
            <th>Genre</th>
            <th>Read</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td className="cell-title">{book.title}</td>
              <td>{book.author}</td>
              <td>{book.year}</td>
              <td>
                <span className={`genre-tag genre-${book.genre}`}>{book.genre}</span>
              </td>
              <td>{book.read ? 'Yes' : 'No'}</td>
              <td>{book.rating ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ShelfTable;
