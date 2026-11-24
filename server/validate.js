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