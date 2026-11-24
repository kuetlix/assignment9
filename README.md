# Assignment 9 - Reading List

**Name:** Kübra Etli
**Student No:** 230408003

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