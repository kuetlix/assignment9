import { useState } from 'react';

// One table row. The read checkbox and rating select are controlled by the
// book that came from the server, so they only change after the server agrees.
function ShelfRow({ book, onEdit, onPatch, onDelete }) {
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const toggleRead = () =>
    run(() =>
      // Marking a book unread also clears its rating (a rating needs read: true).
      onPatch(book.id, book.read ? { read: false, rating: null } : { read: true })
    );

  const changeRating = (event) => {
    const value = event.target.value;
    run(() => onPatch(book.id, { rating: value === '' ? null : Number(value) }));
  };

  const remove = () => {
    if (window.confirm(`Delete “${book.title}” from the list?`)) {
      run(() => onDelete(book.id));
    }
  };

  return (
    <tr className={busy ? 'is-busy' : undefined}>
      <td className="cell-title">{book.title}</td>
      <td>{book.author}</td>
      <td>{book.year}</td>
      <td>
        <span className={`genre-tag genre-${book.genre}`}>{book.genre}</span>
      </td>
      <td>
        <input
          type="checkbox"
          className="read-toggle"
          checked={book.read}
          onChange={toggleRead}
          disabled={busy}
          aria-label={`Mark “${book.title}” as ${book.read ? 'unread' : 'read'}`}
        />
      </td>
      <td>
        <select
          className="rating-select"
          value={book.rating ?? ''}
          onChange={changeRating}
          disabled={busy || !book.read}
          title={book.read ? 'Rate this book' : 'Mark the book as read to rate it'}
          aria-label={`Rating for “${book.title}”`}
        >
          <option value="">—</option>
          {[1, 2, 3, 4, 5].map((stars) => (
            <option key={stars} value={stars}>
              {'★'.repeat(stars)}
            </option>
          ))}
        </select>
      </td>
      <td className="cell-actions">
        <button
          type="button"
          className="btn btn-small btn-ghost"
          onClick={() => onEdit(book.id)}
          disabled={busy}
        >
          Edit
        </button>
        <button type="button" className="btn btn-small btn-danger" onClick={remove} disabled={busy}>
          Delete
        </button>
      </td>
    </tr>
  );
}

export default ShelfRow;
