import { useState } from 'react';
import { GENRES } from '../api/books.js';

const EMPTY_FORM = { title: '', author: '', year: '', genre: 'fiction', read: false, rating: '' };

function toFormValues(book) {
  if (!book) {
    return EMPTY_FORM;
  }
  return {
    title: book.title,
    author: book.author,
    year: String(book.year),
    genre: book.genre,
    read: book.read,
    rating: book.rating === null ? '' : String(book.rating),
  };
}

// One form for both jobs: adding a new book (POST) and editing one (PUT).
// The parent gives it a new `key` per book, so the form starts fresh each time.
function BookEditor({ book, onSave, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(book));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(book);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setValues((previous) => {
      const next = { ...previous, [name]: type === 'checkbox' ? checked : value };
      // An unread book cannot keep a rating.
      return name === 'read' && !checked ? { ...next, rating: '' } : next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      title: values.title,
      author: values.author,
      year: values.year === '' ? null : Number(values.year),
      genre: values.genre,
      read: values.read,
      rating: values.read && values.rating !== '' ? Number(values.rating) : null,
    };

    try {
      await onSave(payload);
      if (!isEditing) {
        setValues(EMPTY_FORM);
      }
    } catch (err) {
      // Show exactly what the server said (duplicate, invalid year, …).
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel book-editor" onSubmit={handleSubmit}>
      <h2>{isEditing ? `Edit “${book.title}”` : 'Add a book'}</h2>

      <label className="field">
        <span>Title</span>
        <input name="title" value={values.title} onChange={handleChange} required />
      </label>

      <label className="field">
        <span>Author</span>
        <input name="author" value={values.author} onChange={handleChange} required />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Year</span>
          <input type="number" name="year" value={values.year} onChange={handleChange} />
        </label>

        <label className="field">
          <span>Genre</span>
          <select name="genre" value={values.genre} onChange={handleChange}>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="field-row">
        <label className="check">
          <input type="checkbox" name="read" checked={values.read} onChange={handleChange} />
          <span>I have read it</span>
        </label>

        <label className="field">
          <span>Rating</span>
          <select
            name="rating"
            value={values.rating}
            onChange={handleChange}
            disabled={!values.read}
          >
            <option value="">No rating</option>
            {[1, 2, 3, 4, 5].map((stars) => (
              <option key={stars} value={stars}>
                {'★'.repeat(stars)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add book'}
        </button>
        {isEditing && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default BookEditor;
