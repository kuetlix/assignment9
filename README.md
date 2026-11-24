# Assignment 9 - Reading List

**Name:** Kübra Etli
**Student No:** 230408003

A REST API (Node.js + Express 5) and a React client (Vite) for a reading list. Data is kept in memory, so it goes back to the seed books when the server restarts.

## How to Run

**Server** (port `3000`):

```bash
cd server
npm install
npm run dev        # or: npm start
```

| Variable | Default |
| --- | --- |
| `PORT` | `3000` |
| `CLIENT_ORIGIN` | `http://localhost:5173` |

Example: `PORT=4000 CLIENT_ORIGIN=http://localhost:5173 npm start`

**Client** (port `5173`):

```bash
cd client
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:3000
npm run dev
```

Then open `http://localhost:5173`. There is no Vite proxy; the server sends the CORS headers.

## File Organization

```
assignment9/
├─ server/
│  ├─ server.js        routes, 404 fallback, error middleware
│  ├─ booksStore.js    in-memory data, async functions, immutable updates
│  ├─ validate.js      id, book and query validation
│  └─ package.json
├─ client/
│  ├─ src/
│  │  ├─ api/books.js  all fetch calls
│  │  ├─ components/   FilterStrip, ShelfTable, ShelfRow, BookEditor, ShelfStats
│  │  ├─ App.jsx       state and effects
│  │  ├─ main.jsx
│  │  └─ index.css
│  ├─ .env.example
│  ├─ index.html
│  └─ package.json
├─ .gitignore
└─ README.md
```

`GET /api/crash` is kept on purpose: it throws inside an async handler to show that the error middleware answers `500 {"error":"Something went wrong"}` and logs the error on the server.

## Testing Evidence

All requests were run in this order against a freshly started server.

#### 1. Stats before any change (200)
```
$ curl --include http://localhost:3000/api/stats
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 97
ETag: W/"61-jpjDRZzg2vGg1gZ4vtbzGgh5CN0"
Date: Tue, 24 Nov 2026 19:27:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":6,"read":4,"unread":2,"averageRating":4.7,"byGenre":{"fiction":3,"other":2,"fantasy":1}}
```

#### 2. List with combined query parameters (200)
```
$ curl --include 'http://localhost:3000/api/books?genre=fiction&sort=year&order=desc'
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 354
ETag: W/"162-ZuUuBP9q4rYiqnmFu6s5wDzOXvE"
Date: Tue, 24 Nov 2026 19:27:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":2,"title":"Kardeşimin Hikayesi","author":"Zülfü Livaneli","year":2013,"genre":"fiction","read":true,"rating":4},{"id":3,"title":"Kürk Mantolu Madonna","author":"Sabahattin Ali","year":1943,"genre":"fiction","read":true,"rating":null},{"id":1,"title":"Anna Karenina","author":"Lev Tolstoy","year":1878,"genre":"fiction","read":true,"rating":5}]
```

#### 3. One book (200)
```
$ curl --include http://localhost:3000/api/books/3
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 122
ETag: W/"7a-YgyOKs+2Vce4iAxKrOUl4sxw+lE"
Date: Tue, 24 Nov 2026 19:27:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":3,"title":"Kürk Mantolu Madonna","author":"Sabahattin Ali","year":1943,"genre":"fiction","read":true,"rating":null}
```

#### 4. Create a book (201 + Location)
```
$ curl --include -X POST http://localhost:3000/api/books -H 'Content-Type: application/json' -d '{"title":"Diriliş","author":"Lev Tolstoy","year":1899,"genre":"fiction"}'
HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Location: /api/books/7
Content-Type: application/json; charset=utf-8
Content-Length: 107
ETag: W/"6b-gtektDt8z41yrW+9nt/PHYjdAZI"
Date: Tue, 24 Nov 2026 19:27:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":7,"title":"Diriliş","author":"Lev Tolstoy","year":1899,"genre":"fiction","read":false,"rating":null}
```

#### 5. Invalid body (400)
```
$ curl --include -X POST http://localhost:3000/api/books -H 'Content-Type: application/json' -d '{"title":"Tutunamayanlar","author":"Oğuz Atay","year":2999,"genre":"fiction"}'
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 61
ETag: W/"3d-R1HxlzjfCJHRlHTHeseOyO0rvCo"
Date: Tue, 24 Nov 2026 19:27:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"\"year\" must be an integer between 1000 and 2026"}
```

#### 6. Repeated query parameter (400)
```
$ curl --include 'http://localhost:3000/api/books?genre=fiction&genre=fantasy'
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 58
ETag: W/"3a-6mT0mDMdSpAfOdjXJoHaV9ooo4w"
Date: Tue, 24 Nov 2026 19:27:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Query parameter \"genre\" must not be repeated"}
```

#### 7. Missing book (404)
```
$ curl --include http://localhost:3000/api/books/99
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 41
ETag: W/"29-qoCgxr308WAZ4JR0JtKqz/gQZ9k"
Date: Tue, 24 Nov 2026 19:27:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book with id 99 was not found"}
```

#### 8. Duplicate, different case (409)
```
$ curl --include -X POST http://localhost:3000/api/books -H 'Content-Type: application/json' -d '{"title":"KÜRK MANTOLU MADONNA","author":"sabahattin ali","year":1943,"genre":"fiction"}'
HTTP/1.1 409 Conflict
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 99
ETag: W/"63-sWJVascAEde5pmbblg4pjBiuKFM"
Date: Tue, 24 Nov 2026 19:27:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"A book with title \"KÜRK MANTOLU MADONNA\" by \"sabahattin ali\" already exists (id 3)"}
```

#### 9. PATCH book 7: only the sent fields change (200)
```
$ curl --include -X PATCH http://localhost:3000/api/books/7 -H 'Content-Type: application/json' -d '{"read":true,"rating":4}'
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 103
ETag: W/"67-LDHCiHUU2+86kKRo0/y/L+0MB/M"
Date: Tue, 24 Nov 2026 19:27:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":7,"title":"Diriliş","author":"Lev Tolstoy","year":1899,"genre":"fiction","read":true,"rating":4}
```

#### 10. Stats after the POST and PATCH (200)
```
$ curl --include http://localhost:3000/api/stats
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 97
ETag: W/"61-MJ2IDEaMfpepMBnxHAWzJKzE+ww"
Date: Tue, 24 Nov 2026 19:27:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":7,"read":5,"unread":2,"averageRating":4.5,"byGenre":{"fiction":4,"other":2,"fantasy":1}}
```

#### 11. PUT book 7: the whole book is replaced (200)
```
$ curl --include -X PUT http://localhost:3000/api/books/7 -H 'Content-Type: application/json' -d '{"title":"Diriliş","author":"Lev Tolstoy","year":1899,"genre":"fiction"}'
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 107
ETag: W/"6b-gtektDt8z41yrW+9nt/PHYjdAZI"
Date: Tue, 24 Nov 2026 19:27:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":7,"title":"Diriliş","author":"Lev Tolstoy","year":1899,"genre":"fiction","read":false,"rating":null}
```

#### 12. Delete (204, no body)
```
$ curl --include -X DELETE http://localhost:3000/api/books/7
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Date: Tue, 24 Nov 2026 19:27:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

#### 13. Same delete repeated (404)
```
$ curl --include -X DELETE http://localhost:3000/api/books/7
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 40
ETag: W/"28-JlowEoxlmheyqPE464t+q3GCswo"
Date: Tue, 24 Nov 2026 19:27:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book with id 7 was not found"}
```

#### 14. Malformed JSON (400)
```
$ curl --include -X POST http://localhost:3000/api/books -H 'Content-Type: application/json' -d '{"title": oops'
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 104
ETag: W/"68-hmtX0dLh6TvIWztbAK2J9XH442I"
Date: Tue, 24 Nov 2026 19:27:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Malformed JSON in request body: Unexpected token 'o', \"{\"title\": oops\" is not valid JSON"}
```

#### 15. Unknown /api route (404)
```
$ curl --include http://localhost:3000/api/authors
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Tue, 24 Nov 2026 19:27:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

#### 16. Deliberate crash in an async handler (500)
```
$ curl --include http://localhost:3000/api/crash
HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 32
ETag: W/"20-cI8B1wZuBEyTE5ClDvphKZx7wd0"
Date: Tue, 24 Nov 2026 19:27:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Something went wrong"}
```

#### 17. CORS preflight (204)
```
$ curl --include -X OPTIONS http://localhost:3000/api/books/1 -H 'Origin: http://localhost:5173' -H 'Access-Control-Request-Method: PATCH' -H 'Access-Control-Request-Headers: content-type'
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin, Access-Control-Request-Headers
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type
Content-Length: 0
Date: Tue, 24 Nov 2026 19:27:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

### Preflight in the Network tab

When I toggled "read" for a book in the browser, the Network tab showed two requests for `http://localhost:3000/api/books/4`:

1. `OPTIONS` with status **204 No Content** (the preflight). Request headers: `Origin: http://localhost:5173`, `Access-Control-Request-Method: PATCH`, `Access-Control-Request-Headers: content-type`. Response headers: `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE`, `Access-Control-Allow-Headers: content-type`.
2. `PATCH` with status **200 OK**, sent only after the preflight succeeded.

`GET` requests had no preflight because they have no body and no custom headers. Request 17 above shows the same preflight with `curl`.

## Reasoning Questions

### 1. Parameters
id is part of the path because it points to one specific book: /api/books/3 literally means "book number 3", and returning 404 when the book doesn't exist is natural. genre and sort don't identify a book; they define how the same list is filtered or sorted. They are optional and can be combined, which is exactly what query parameters are for. If id were in the query (/api/books?id=3), the URL would point to the list rather than a single book. A missing book would look like an empty list instead of a 404, and PUT/PATCH/DELETE would end up going to the collection address.

### 2. Body parsing
I moved the app.use(express.json()) line below the routes and sent a valid book with POST /api/books. The server returned 400: "Request body must be a JSON object". Middleware runs in registration order, so by the time the route ran, the body hadn't been parsed yet and req.body was undefined. As a result, validation rejected even valid data.

### 3. One response
In GET /api/books/:id, I removed the return in front of the 404 and requested /api/books/99. The client still got a 404, but the function didn't stop and reached the res.status(200).json(book) line. The server console printed the error ERR_HTTP_HEADERS_SENT: Cannot set headers after they are sent to the client. Only one response can be sent per HTTP request; without return, the code tries to send a second response too.

### 4. PUT and PATCH
The "read" checkbox and star rating in the UI use PATCH: they send only the changed field (e.g. {"rating":4}), so they don't need to know the rest of the book and can't accidentally overwrite it. The edit form uses PUT: the user sees and saves all of the book's fields, so the request is the complete new state of the book. Outputs 9 and 11 in the README show the difference. PATCH changed only read and rating, whereas with PUT, the read and rating that weren't sent went back to their defaults (false, null).

### 5. CORS
I started the server with CLIENT_ORIGIN=http://localhost:5999 and refreshed the page. The console showed "blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5999' that is not equal to the supplied origin", and the page displayed "Could not load books: Failed to fetch".

Did the server log the request: My server has no logger that prints requests, so nothing appeared in the console. But the request did reach the server and was answered; sending the same request with curl returned 200 and the data.

Why curl works: CORS is enforced by the browser. The server responds, but because the header doesn't match the page's origin, the browser doesn't hand the response to JavaScript. curl isn't a browser and doesn't check these headers.


### 6. Validation
Client-side checks are only a convenience for the user. They can be bypassed: someone can call the API directly with curl, Postman, or DevTools, and an old or buggy client version might also be in use. The server is the only place every request is guaranteed to pass through, so only the server can guarantee that the stored data is correct. Also, some checks, like detecting duplicate books, can only be done by the server, which knows all the data.

### 7. State
I set Hayvan Çiftliği to read: true, rating: 2, then stopped and restarted the server. The book went back to read: false, rating: null, i.e. its seed values; added and deleted books were reset too. The data lives only in the memory of the running Node process, in the books variable in booksStore.js, and disappears when the process ends. Persistence requires durable storage such as a database or a file. Since the functions in booksStore.js are already async, moving to a database later will be easy.

## Challenges I Faced

1. **Wrong Git remote URL.** My first `git push` failed with "Repository not
   found" and later "Could not resolve host". The remote URL was missing
   `github.com`. I checked it with `git remote -v` and fixed it with
   `git remote set-url origin <url>`.

2. **Running commands in the wrong folder.** `npm run dev` and `git add`
   failed several times because I was in `assignment9` instead of `server`
   (or the other way round). `package.json` lives in `server/`, and `git add`
   paths are relative to the current folder. Checking the terminal prompt
   and `pwd` before running a command solved it.

3. **Requests hanging with no response.** `curl` connected to port 3000 but
   never received an answer. An old Node process was still holding the port,
   so my new server could not start even though it printed "listening".
   I found the process with `lsof -i :3000`, stopped it with `kill -9`, and
   restarted the server. I also added an error check to `app.listen` so a
   busy port now stops the server with a clear message.

4. **Wrong default `package.json`.** `npm init` created `"type": "commonjs"`
   and no `start`/`dev` scripts. The assignment needs ES modules, so I changed
   it to `"type": "module"` and added `node server.js` and
   `node --watch server.js` scripts.

## Self-Study Notes

### Sorting text with `localeCompare`
Subtracting or using `<` on strings compares character codes, which puts
letters like "ç", "ş" or "ö" in the wrong place. I read the MDN page for
`String.prototype.localeCompare`. It compares two strings according to a
language's alphabet and returns a negative number, zero or a positive number,
which is what `Array.prototype.sort` expects. In `compareBooks` I used
`a.title.localeCompare(b.title, 'tr', { sensitivity: 'base' })` so Turkish
letters sort correctly and upper/lower case does not change the order.

### Sorting without changing stored data
`Array.prototype.sort` changes the array it is called on. To keep the stored
data untouched, I filter first (`filter` returns a new array) and sort a copy
with `[...filtered].sort(...)`. `getAllBooks` also returns a copy of the
stored array.

### URLSearchParams
In the getBooks function (client/src/api/books.js), I add only the filters that have a value using params.set(), then build the query string with params.toString(). It encodes values automatically: a search for "çift" is sent as ?q=%C3%A7ift. Characters like & can't break the query either.

### import.meta.env and the VITE_ prefix
Vite exposes variables from the .env file through import.meta.env. But it puts only the ones starting with VITE_ into browser code, so a secret value in .env isn't accidentally sent to every visitor. I used VITE_API_URL for the API address; .env is not committed to git, and .env.example documents the variable.

### Bodyless 204 in Express 5
In the DELETE route I used res.status(204).end(). A 204 response must not have a body, so I used end() instead of json(). The request helper on the client also returns null on a 204 without calling response.json(); trying to parse an empty body as JSON would throw an error.

### AbortController and AbortError
In the list effect in App.jsx, I create a new AbortController for each request and pass its signal to fetch. When the filter changes, the effect's cleanup function calls controller.abort(). The aborted fetch throws an error named AbortError, which I ignore. This way, a slow old response can't overwrite the new list.
