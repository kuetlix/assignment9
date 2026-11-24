import express from 'express';
import cors from 'cors';
import { getAllBooks, getBookById } from './booksStore.js';
import { parseId } from './validate.js';

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// List all books (query options come in the next step)
app.get('/api/books', async (req, res) => {
  const books = await getAllBooks();
  res.status(200).json(books);
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