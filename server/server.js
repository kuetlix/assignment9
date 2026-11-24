import express from 'express';
import cors from 'cors';
import { getAllBooks, getBookById } from './booksStore.js';
import { parseId, parseListQuery } from './validate.js';

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Compares two books for sorting. Unrated books always go last.
function compareBooks(a, b, sort, order) {
  const direction = order === 'desc' ? -1 : 1;

  if (sort === 'rating') {
    if (a.rating === null && b.rating !== null) return 1;
    if (a.rating !== null && b.rating === null) return -1;
  }

  let result = 0;
  if (sort === 'title' || sort === 'author') {
    result = a[sort].localeCompare(b[sort], 'tr', { sensitivity: 'base' });
  } else if (sort === 'year' || sort === 'rating') {
    result = (a[sort] ?? 0) - (b[sort] ?? 0);
  } else {
    result = a.id - b.id;
  }

  // Ties are broken by id so the order is stable
  return result !== 0 ? result * direction : a.id - b.id;
}

// List books with filter, search, sort and pagination
app.get('/api/books', async (req, res) => {
  const parsed = parseListQuery(req.query);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }
  const { genre, read, q, sort, order, limit, page } = parsed.value;

  const all = await getAllBooks(); // already a copy

  const filtered = all.filter(
    (book) =>
      (genre === null || book.genre === genre) &&
      (read === null || book.read === read) &&
      (q === null ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q))
  );

  // filter() returned a new array, so sorting it does not touch the stored data
  const sorted = [...filtered].sort((a, b) => compareBooks(a, b, sort, order));

  const start = (page - 1) * limit;
  res.status(200).json(sorted.slice(start, start + limit));
});

// One book by id
app.get('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Book id must be a positive integer' });
  }

  const book = await getBookById(id);
  if (!book) {
    return res.status(404).json({ error: `Book with id ${id} was not found` });
  }

  res.status(200).json(book);
});

app.listen(PORT, (error) => {
  if (error) {
    console.error('Could not start server:', error.message);
    process.exit(1);
  }
  console.log(`Server listening on http://localhost:${PORT}`);
});