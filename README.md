# CineFind — Movie Discovery App

A full-stack movie discovery app built with React, Node.js/Express, MySQL and the TMDB API.

## Problem Statement

The assignment was to build a movie discovery product where a user can browse, search,
filter and sort movies from a real third-party API, look at details for a specific movie,
and save movies to a wishlist that survives closing and reopening the browser. The brief
also asked for realistic engineering around API integration: the frontend should never
talk to the third-party API directly, and the app should handle the ordinary failure
modes of a real API (timeouts, rate limits, slow responses, rapid user input) rather than
only the happy path.

This README explains what was built, why it was built that way, and what was
deliberately left out.

## Features

- Browse Popular / Top Rated / Now Playing / Upcoming movies on the home page
- Debounced search with loading, empty, and error states
- Filter by genre, year and minimum rating; sort by popularity, rating, release date, or title
- "Load More" pagination that appends results and disables while loading
- Movie details page (poster, overview, genres, runtime, cast/director)
- Wishlist backed by MySQL — persists across browser restarts
- Duplicate wishlist entries are prevented (both in the UI and at the database level)
- Backend abstraction layer so the frontend never sees TMDB's response shape or API key
- Simple in-memory backend caching to cut down on repeated TMDB calls
- Request cancellation so a slow, stale search response can't overwrite a newer one
- Responsive layout (desktop / tablet / mobile)
- Consistent success/error JSON response shape and HTTP status codes across the API

## Architecture

```
React (Vite)
   │  HTTP (JSON)
   ▼
Express Routes  ──▶  Controllers  ──▶  Movie API Service  ──▶  TMDB API
                                   ▲
                                   │
                              In-memory Cache

React (Wishlist page)
   │
   ▼
Express Routes ──▶ Wishlist Controller ──▶ Sequelize Model ──▶ MySQL
```

The frontend only ever calls our own Express API (`VITE_API_URL`). TMDB's base URL and
API key live only in the backend's `.env` file and are never sent to the browser.

## Technology Stack

| Layer      | Choice                     | Why |
|------------|----------------------------|-----|
| Frontend   | React + Vite               | Fast dev server, minimal config, industry-standard for a SPA of this size. |
| Routing    | React Router               | URL-driven state for Discover (shareable, refresh-safe) is a first-class feature, not a workaround. |
| HTTP       | Axios                      | Built-in cancellation via `AbortController` support, simpler error shape than raw `fetch`. |
| Backend    | Node.js + Express          | Small, well-understood, easy to explain endpoint-by-endpoint in an interview. |
| ORM        | Sequelize + MySQL          | Wishlist is simple relational data (one table); Sequelize gives migrations/validation without the ceremony of a bigger system. |
| Movie data | TMDB API                   | Free, well-documented, supports discover/search/genres/credits out of the box. |
| Cache      | In-memory `Map`             | The assessment size doesn't justify Redis; see "Known Limitations". |

## Project Structure

```
cinefind/
├── server/                  Express backend
│   └── src/
│       ├── config/          Sequelize/MySQL connection
│       ├── controllers/     Thin request handlers
│       ├── routes/          Express routers
│       ├── services/        movieApiService.js (the ONLY file that calls TMDB), cacheService.js
│       ├── models/          WishlistMovie Sequelize model
│       ├── middleware/      Validation + centralized error handling
│       └── utils/           responseMapper.js (TMDB → our own shape)
│   └── tests/               Jest + Supertest
└── client/                  React (Vite) frontend
    └── src/
        ├── components/      Navbar, MovieCard, MovieGrid, SearchBar, FilterBar, etc.
        ├── pages/           Home, Discover, MovieDetails, Wishlist
        ├── services/api.js  The ONLY file that calls our backend
        ├── hooks/           useMovies (pagination/cancellation), useWishlist (context)
        └── styles/          Plain CSS, split by concern
```

## API Endpoints

All responses use the shape `{ success: true, data }` or
`{ success: false, message, errorCode }`.

| Method | Endpoint                     | Description |
|--------|-------------------------------|--------------|
| GET    | `/api/health`                 | Health check |
| GET    | `/api/movies/popular`         | Popular movies (`?page=`) |
| GET    | `/api/movies/top-rated`       | Top rated movies (`?page=`) |
| GET    | `/api/movies/now-playing`     | Now playing movies (`?page=`) |
| GET    | `/api/movies/upcoming`        | Upcoming movies (`?page=`) |
| GET    | `/api/movies/search`          | `?query=&page=` |
| GET    | `/api/movies/discover`        | `?genre=&year=&minRating=&sortBy=&page=` |
| GET    | `/api/movies/:id`              | Full movie details |
| GET    | `/api/wishlist`                | List saved movies |
| POST   | `/api/wishlist`                | Add a movie (`{ movieId, title, posterUrl, releaseDate, rating }`) |
| DELETE | `/api/wishlist/:movieId`       | Remove a movie |

## Database Schema

Single table, `wishlist_movies`:

| Column        | Type      | Notes |
|---------------|-----------|-------|
| id            | INTEGER   | Primary key, auto-increment |
| movie_id      | INTEGER   | TMDB movie id, **UNIQUE** — prevents duplicates |
| title         | STRING    | |
| poster_url    | STRING    | Nullable |
| release_date  | STRING    | Nullable, display-only |
| rating        | FLOAT     | Nullable |
| created_at / updated_at | DATETIME | Managed by Sequelize |

We deliberately store a small, denormalized snapshot of each movie rather than the full
TMDB payload. This means the wishlist page renders correctly even if TMDB is briefly
down, at the cost of showing slightly stale poster/rating data if it changed upstream.
For a "save for later" feature, that trade-off is the right one.

The app treats itself as a single-user/local assessment application — there's no user
authentication, so there is one shared wishlist. Adding real auth would mean adding a
`user_id` column and scoping all wishlist queries by the logged-in user; the rest of the
design doesn't change.

## External API Handling

- **Isolation**: `services/movieApiService.js` is the only file that imports Axios pointed
  at TMDB. Routes and controllers never see a TMDB URL or API key.
- **Response mapping**: `utils/responseMapper.js` converts TMDB's shape (`poster_path`,
  `vote_average`, `genre_ids`, ...) into our own (`posterUrl`, `rating`, `genres`, ...).
  If we ever changed movie API providers, only these two files change — nothing on the
  frontend or in routes would need to move.
- **Caching**: Common list requests (`popular:1`, `search:batman:1`, etc.) are cached
  in-memory for 5 minutes; movie details are cached for 30 minutes since they change
  rarely. This cuts down on repeated TMDB calls during normal browsing.
- **Failure handling**: `middleware/errorHandler.js` inspects Axios errors and maps them
  to sensible HTTP statuses and messages (`502` for TMDB being down, `503` for a timeout,
  `429` if TMDB rate-limits us), and never leaks the API key or a stack trace to the client.

## Search Handling (Debounce + Race Conditions)

Two closely related problems, solved in two different places:

1. **Debounce** (`SearchBar.jsx`): the input waits 400ms after the user stops typing
   before it notifies the parent. This avoids sending a request per keystroke.
2. **Race conditions / cancellation** (`useMovies.js`): every fetch uses an
   `AbortController`. If the user types "Batman" then quickly changes to "Avatar", the
   in-flight "Batman" request is aborted and a monotonically increasing request id makes
   sure a straggling response can never overwrite newer state, even if the abort itself
   doesn't land in time.

Sorting is delegated to TMDB via `sort_by` on `/discover/movie` rather than sorted
client-side, because we only ever have one page of results in memory at a time — sorting
locally would be incorrect once "Load More" is used (it would only reorder the visible
page, not the whole result set).

## Performance

- Pagination via TMDB (20 results/page) instead of fetching large result sets
- Debounced search (400ms)
- In-memory response caching (5–30 min depending on endpoint)
- Request cancellation to avoid wasted renders on stale responses
- `loading="lazy"` on poster images
- Small, focused components (`MovieCard`, `MovieGrid`) so React only re-renders what changed

## Assumptions

- This assessment uses a single shared wishlist and does not implement authentication,
  because user authentication was not specified in the brief.
- TMDB is used as the external movie API (any TMDB-compatible key works via `.env`).
- Filters/sorting are limited to what TMDB's `/discover/movie` endpoint actually supports,
  rather than inventing filters the API can't back.

## Known Limitations

- In-memory cache is lost on server restart, and would not work correctly if the API were
  ever run as multiple server instances (each instance would have its own cache). A
  production deployment would replace it with Redis or another shared cache.
- No user authentication — the wishlist is shared rather than account-specific.
- Movie discovery quality/availability depends entirely on TMDB's uptime and data.
- Sequelize's `sync()` is used instead of migrations, which is fine for this project size
  but wouldn't be how a production schema is managed.

## Future Improvements

- User authentication and per-user wishlists
- Redis (or similar) for caching, to support multiple backend instances
- Personalized recommendations
- Watch history / "already watched" tracking
- Additional filters (runtime, streaming availability) if the data source supports them
- Production monitoring/alerting on the external API failure rate

## AI Usage

Used AI tools to understand the TMDB API documentation, generate initial boilerplate,
troubleshoot API integration issues, and review parts of the implementation. The final
application structure, data model, API behaviour, and technical decisions were reviewed
and understood as part of building this project.

## Running Locally

### Backend

```bash
cd server
cp .env.example .env   # then fill in TMDB_API_KEY and DATABASE_URL
npm install
npm run dev             # http://localhost:5000
npm test                # runs the Jest/Supertest suite (mocks TMDB + DB, no keys needed)
```

You'll need a MySQL server running and a database created (e.g. `CREATE DATABASE cinefind;`)
matching `DATABASE_URL`. On first run, Sequelize will create the `wishlist_movies` table.

You'll also need a free TMDB API key from https://www.themoviedb.org/settings/api.

### Frontend

```bash
cd client
cp .env.example .env    # defaults to http://localhost:5000/api
npm install
npm run dev              # http://localhost:5173
```

## Deployment Notes

- Backend: any Node host (Render, Railway, etc.) — set `PORT`, `DATABASE_URL`,
  `TMDB_API_KEY`, `TMDB_BASE_URL`, and `CLIENT_ORIGIN` (for CORS) as environment variables.
- Frontend: any static host (Vercel, Netlify) — set `VITE_API_URL` to the deployed
  backend's `/api` URL and run `npm run build`.
- Never commit `.env` files; `.env.example` files are provided for both apps.
