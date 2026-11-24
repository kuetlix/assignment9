let books = [
  { id: 1, title: 'Anna Karenina', author: 'Lev Tolstoy', year: 1878, genre: 'fiction', read: true, rating: 5 },
  { id: 2, title: 'Kardeşimin Hikayesi', author: 'Zülfü Livaneli', year: 2013, genre: 'fiction', read: true, rating: 4 },
  { id: 3, title: 'Kürk Mantolu Madonna', author: 'Sabahattin Ali', year: 1943, genre: 'fiction', read: true, rating: null },
  { id: 4, title: 'Hayvan Çiftliği', author: 'George Orwell', year: 1945, genre: 'other', read: false, rating: null },
  { id: 5, title: 'Yeraltından Notlar', author: 'Fyodor Dostoyevski', year: 1864, genre: 'other', read: false, rating: null },
  { id: 6, title: 'Harry Potter ve Felsefe Taşı', author: 'J.K. Rowling', year: 1997, genre: 'fantasy', read: true, rating: 5 },
];


const delay = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));

// Returns a COPY, so callers can sort/filter without touching the stored array
export async function getAllBooks() {
  await delay();
  return [...books];
}

export async function getBookById(id) {
  await delay();
  return books.find((book) => book.id === id) ?? null;
}

// Finds a book with the same title AND author (case-insensitive).
export async function findDuplicate(title, author, excludeId = null) {
  await delay();
  const t = title.trim().toLowerCase();
  const a = author.trim().toLowerCase();
  return (
    books.find(
      (book) =>
        book.id !== excludeId &&
        book.title.toLowerCase() === t &&
        book.author.toLowerCase() === a
    ) ?? null
  );
}