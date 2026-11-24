import ShelfRow from './ShelfRow.jsx';

// Shows the list of books, or a loading / error / empty message instead.
function ShelfTable({ books, status, error, onRetry, onEdit, onPatch, onDelete }) {
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
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <ShelfRow
              key={book.id}
              book={book}
              onEdit={onEdit}
              onPatch={onPatch}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ShelfTable;
