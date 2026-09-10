import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/discover?query=${encodeURIComponent(trimmed)}`);
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          MovieHub
        </Link>

        <button
          className="navbar__toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <div className={`navbar__content ${menuOpen ? 'navbar__content--open' : ''}`}>
          <nav className="navbar__links">
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/discover" onClick={() => setMenuOpen(false)}>
              Discover
            </NavLink>
            <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>
              Wishlist
            </NavLink>
          </nav>

          <form className="navbar__search" onSubmit={handleSubmit}>
            <span className="navbar__search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
    </header>
  );
}
