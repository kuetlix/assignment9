// The only place in the client that talks to the server.
// Components import these functions and never build URLs or call fetch.

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL is not set. Copy client/.env.example to client/.env.');
}

export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

// Shared helper used by every request below.
async function request(path, { method = 'GET', body, signal } = {}) {
  const options = { method, signal, headers: {} };

  // Only requests that carry a body say what that body is.
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, options);

  // 204 No Content has no body to read.
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  // Turn the server's { error } into a normal JavaScript Error.
  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with status ${response.status}`);
  }

  return data;
}

// filters: { q, genre, read, sort, order }. Empty values are left out.
export function getBooks(filters = {}, signal) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return request(`/api/books${query ? `?${query}` : ''}`, { signal });
}

export function getBook(id, signal) {
  return request(`/api/books/${encodeURIComponent(id)}`, { signal });
}

export function addBook(book) {
  return request('/api/books', { method: 'POST', body: book });
}

export function replaceBook(id, book) {
  return request(`/api/books/${encodeURIComponent(id)}`, { method: 'PUT', body: book });
}

export function updateBook(id, changes) {
  return request(`/api/books/${encodeURIComponent(id)}`, { method: 'PATCH', body: changes });
}

export function deleteBook(id) {
  return request(`/api/books/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function getStats(signal) {
  return request('/api/stats', { signal });
}
