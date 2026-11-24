import { useEffect, useState } from 'react';
import { getBooks } from './api/books.js';
import FilterStrip from './components/FilterStrip.jsx';
import ShelfTable from './components/ShelfTable.jsx';

const START_FILTERS = { q: '', genre: '', read: '', sort: '', order: 'asc' };

function App() {
  const [filters, setFilters] = useState(START_FILTERS);
  const [books, setBooks] = useState([]);
  const [listStatus, setListStatus] = useState('loading');
  const [listError, setListError] = useState('');
  const [listVersion, setListVersion] = useState(0);

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

  const changeFilter = (name, value) => {
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const reloadList = () => setListVersion((version) => version + 1);

  return (
    <main className="page">
      <header className="masthead">
        <h1>Bark &amp; Bloom</h1>
        <p>A small reading list, powered by our own REST API.</p>
      </header>

      <FilterStrip
        filters={filters}
        onChange={changeFilter}
        onReset={() => setFilters(START_FILTERS)}
      />

      <ShelfTable books={books} status={listStatus} error={listError} onRetry={reloadList} />
    </main>
  );
}

export default App;
