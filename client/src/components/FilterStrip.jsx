import { GENRES } from '../api/books.js';

// Search, filter and sort controls. Every change goes up to App, which asks
// the server for a new list with these values as query parameters.
function FilterStrip({ filters, onChange, onReset }) {
  const handle = (event) => onChange(event.target.name, event.target.value);

  return (
    <section className="filter-strip" aria-label="Search, filter and sort">
      <label className="field field-grow">
        <span>Search</span>
        <input
          type="search"
          name="q"
          placeholder="Title or author…"
          value={filters.q}
          onChange={handle}
        />
      </label>

      <label className="field">
        <span>Genre</span>
        <select name="genre" value={filters.genre} onChange={handle}>
          <option value="">All genres</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Status</span>
        <select name="read" value={filters.read} onChange={handle}>
          <option value="">Read and unread</option>
          <option value="true">Read</option>
          <option value="false">Unread</option>
        </select>
      </label>

      <label className="field">
        <span>Sort by</span>
        <select name="sort" value={filters.sort} onChange={handle}>
          <option value="">Date added</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="year">Year</option>
          <option value="rating">Rating</option>
        </select>
      </label>

      <label className="field">
        <span>Direction</span>
        <select name="order" value={filters.order} onChange={handle}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>

      <button type="button" className="btn btn-ghost" onClick={onReset}>
        Reset
      </button>
    </section>
  );
}

export default FilterStrip;
