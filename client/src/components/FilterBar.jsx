const GENRES = [
  { id: '', label: 'All Genres' },
  { id: '28', label: 'Action' },
  { id: '35', label: 'Comedy' },
  { id: '18', label: 'Drama' },
  { id: '27', label: 'Horror' },
  { id: '10749', label: 'Romance' },
  { id: '878', label: 'Sci-Fi' },
  { id: '53', label: 'Thriller' },
  { id: '16', label: 'Animation' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = ['', ...Array.from({ length: 40 }, (_, i) => String(CURRENT_YEAR - i))];

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
  { value: 'release_date', label: 'Release Date' },
  { value: 'title', label: 'Title' },
];

export default function FilterBar({ filters, onChange, onClear, hasActiveFilters }) {
  const update = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="filter-bar">
      <select value={filters.genre} onChange={(e) => update('genre', e.target.value)}>
        {GENRES.map((g) => (
          <option key={g.id} value={g.id}>
            {g.label}
          </option>
        ))}
      </select>

      <select value={filters.year} onChange={(e) => update('year', e.target.value)}>
        {YEARS.map((y) => (
          <option key={y || 'any'} value={y}>
            {y || 'Any Year'}
          </option>
        ))}
      </select>

      <select value={filters.minRating} onChange={(e) => update('minRating', e.target.value)}>
        <option value="">Any Rating</option>
        {[9, 8, 7, 6, 5].map((r) => (
          <option key={r} value={r}>
            {r}+ ★
          </option>
        ))}
      </select>

      <select value={filters.sortBy} onChange={(e) => update('sortBy', e.target.value)}>
        {SORT_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            Sort: {s.label}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button type="button" className="filter-bar__clear" onClick={onClear}>
          Clear Filters
        </button>
      )}
    </div>
  );
}
