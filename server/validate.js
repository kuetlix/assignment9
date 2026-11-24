export const GENRES = [
  'fiction',
  'non-fiction',
  'science',
  'history',
  'fantasy',
  'other',
];

export function parseId(value) {
  if (!/^\d+$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validateText(value, field) {
  if (typeof value !== 'string') {
    return { error: `"${field}" is required and must be a string` };
  }
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    return { error: `"${field}" must be between 1 and 100 characters after trimming` };
  }
  return { value: trimmed };
}
export function validateBook(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  const title = validateText(body.title, 'title');
  if (title.error) return title;

  const author = validateText(body.author, 'author');
  if (author.error) return author;

  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(body.year) || body.year < 1000 || body.year > currentYear) {
    return { error: `"year" must be an integer between 1000 and ${currentYear}` };
  }

  if (!GENRES.includes(body.genre)) {
    return { error: `"genre" must be one of: ${GENRES.join(', ')}` };
  }

  const read = body.read === undefined ? false : body.read;
  if (typeof read !== 'boolean') {
    return { error: '"read" must be a boolean (true or false)' };
  }

  const rating = body.rating === undefined ? null : body.rating;
  if (rating !== null) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { error: '"rating" must be an integer between 1 and 5, or null' };
    }
    if (!read) {
      return { error: '"rating" is only allowed when "read" is true' };
    }
  }

  return {
    value: {
      title: title.value,
      author: author.value,
      year: body.year,
      genre: body.genre,
      read,
      rating,
    },
  };
}
const SORT_FIELDS = ['title', 'author', 'year', 'rating'];
const QUERY_KEYS = ['genre', 'read', 'q', 'sort', 'order', 'limit', 'page'];

// Returns { value } with clean options, or { error }.
export function parseListQuery(query) {
  // A repeated parameter (?genre=a&genre=b) arrives as an array -> 400
  for (const key of QUERY_KEYS) {
    if (Array.isArray(query[key])) {
      return { error: `Query parameter "${key}" must not be repeated` };
    }
  }
  const options = {
    genre: null,
    read: null,
    q: null,
    sort: null,
    order: 'asc',
    limit: 50,
    page: 1,
  };
  if (query.genre !== undefined) {
    if (!GENRES.includes(query.genre)) {
      return { error: `"genre" must be one of: ${GENRES.join(', ')}` };
    }
    options.genre = query.genre;
  }
  if (query.read !== undefined) {
    if (query.read !== 'true' && query.read !== 'false') {
      return { error: '"read" must be "true" or "false"' };
    }
    options.read = query.read === 'true';
  }
  if (query.q !== undefined) {
    const q = query.q.trim().toLowerCase();
    options.q = q === '' ? null : q;
  }
  if (query.sort !== undefined) {
    if (!SORT_FIELDS.includes(query.sort)) {
      return { error: `"sort" must be one of: ${SORT_FIELDS.join(', ')}` };
    }
    options.sort = query.sort;
  }
  if (query.order !== undefined) {
    if (query.order !== 'asc' && query.order !== 'desc') {
      return { error: '"order" must be "asc" or "desc"' };
    }
    options.order = query.order;
  }
  if (query.limit !== undefined) {
    const limit = /^\d+$/.test(query.limit) ? Number(query.limit) : NaN;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      return { error: '"limit" must be an integer between 1 and 50' };
    }
    options.limit = limit;
  }
  if (query.page !== undefined) {
    const page = /^\d+$/.test(query.page) ? Number(query.page) : NaN;
    if (!Number.isInteger(page) || page < 1) {
      return { error: '"page" must be an integer of 1 or more' };
    }
    options.page = page;
  }
  return { value: options };
}