import { useEffect, useState } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search movies...' }) {
  const [localValue, setLocalValue] = useState(value);

  // Keep local input in sync if the parent resets the query externally
  // (e.g. "Clear Filters" or navigating from the navbar search).
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce: wait 400ms after the user stops typing before notifying
  // the parent, instead of firing a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) onChange(localValue);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(localValue); // Enter applies immediately, no need to wait for debounce
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <span className="search-bar__icon">⌕</span>
      <input
        type="text"
        value={localValue}
        placeholder={placeholder}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </form>
  );
}
