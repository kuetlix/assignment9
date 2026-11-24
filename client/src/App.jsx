import { useEffect, useState } from 'react';
import {
  addBook,
  deleteBook,
  getBook,
  getBooks,
  getStats,
  replaceBook,
  updateBook,
} from './api/books.js';
import BookEditor from './components/BookEditor.jsx';
import FilterStrip from './components/FilterStrip.jsx';
import ShelfStats from './components/ShelfStats.jsx';
import ShelfTable from './components/ShelfTable.jsx';

const START_FILTERS = { q: '', genre: '', read: '', sort: '', order: 'asc' };

function App() {
  const [filters, setFilters] = useState(START_FILTERS);
  const [books, setBooks] = useState([]);
  const [listStatus, setListStatus] = useState('loading');
  const [listError, setListError] = useState('');
  const [listVersion, setListVersion] = useState(0);
  const [editingBook, setEditingBook] = useState(null);
  const [notice, setNotice] = useState('');
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [statsVersion, setStatsVersion] = useState(0);

  // Ask the server for a new list whenever a filter changes.
  useEffect(() => {
    const controller = new AbortController();

    // A short pause so typing in the search box does not send one request per key.
    const timer = setTimeout(async () => {
      setListStatus('loading');
      try {
        const data = await getBooks(filters, controller.signal);
        setBooks(data);
        setListStatus('ready');
      } catch (err) {
        // The request was cancelled because newer filters arrived: ignore it.
        if (err.name === 'AbortError') {
          return;
        }
        setListError(err.message);
        setListStatus('error');
      }
    }, 250);

    // Cleanup runs before the next request: the old response can never win.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters, listVersion]);

  // Statistics come from the server and are fetched again after every change.
  useEffect(() => {
    const controller = new AbortController();

    getStats(controller.signal)
      .then((data) => {
        setStats(data);
        setStatsError('');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setStatsError(err.message);
        }
      });

    return () => controller.abort();
  }, [statsVersion]);

  const changeFilter = (name, value) => {
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const reloadList = () => setListVersion((version) => version + 1);

  // After the server confirms a change: refresh the list (filters may now
  // exclude or reorder the book) and the statistics.
  const afterChange = () => {
    reloadList();
    setStatsVersion((version) => version + 1);
  };

  // Fetch the latest copy of the book from the server before editing it.
  const startEditing = async (id) => {
    setNotice('');
    try {
      setEditingBook(await getBook(id));
    } catch (err) {
      setNotice(err.message);
    }
  };

  // Called by the form. The screen only changes after the server confirms.
  const saveBook = async (payload) => {
    if (editingBook) {
      const saved = await replaceBook(editingBook.id, payload);
      setBooks((previous) => previous.map((book) => (book.id === saved.id ? saved : book)));
      setEditingBook(null);
    } else {
      const created = await addBook(payload);
      setBooks((previous) => [...previous, created]);
    }
    afterChange();
  };

  // Toggle read / set rating (PATCH sends only the changed fields).
  const patchBook = async (id, changes) => {
    setNotice('');
    try {
      const saved = await updateBook(id, changes);
      setBooks((previous) => previous.map((book) => (book.id === saved.id ? saved : book)));
      afterChange();
    } catch (err) {
      setNotice(err.message);
    }
  };

  const removeBook = async (id) => {
    setNotice('');
    try {
      await deleteBook(id);
      setBooks((previous) => previous.filter((book) => book.id !== id));
      if (editingBook?.id === id) {
        setEditingBook(null);
      }
      afterChange();
    } catch (err) {
      setNotice(err.message);
    }
  };

  return (
    <main className="page">
      <header className="masthead">
        <h1>Bark &amp; Bloom</h1>
        <p>A small reading list, powered by our own REST API.</p>
      </header>

      <div className="top-row">
        <BookEditor
          key={editingBook ? `edit-${editingBook.id}` : 'new'}
          book={editingBook}
          onSave={saveBook}
          onCancel={() => setEditingBook(null)}
        />
        <ShelfStats stats={stats} error={statsError} />
      </div>

      {notice && (
        <p className="notice" role="alert">
          {notice}
          <button type="button" className="notice-close" onClick={() => setNotice('')}>
            ×
          </button>
        </p>
      )}

      <FilterStrip
        filters={filters}
        onChange={changeFilter}
        onReset={() => setFilters(START_FILTERS)}
      />

      <ShelfTable
        books={books}
        status={listStatus}
        error={listError}
        onRetry={reloadList}
        onEdit={startEditing}
        onPatch={patchBook}
        onDelete={removeBook}
      />
    </main>
  );
}

export default App;
