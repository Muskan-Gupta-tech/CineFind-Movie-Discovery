/**
 * A deliberately simple in-memory cache using a Map.
 *
 * This is good enough for a single-server student/assessment project.
 * In production with multiple server instances, this would need to be
 * replaced with something shared like Redis, because each instance would
 * otherwise have its own cache and give inconsistent results.
 */

const store = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.value;
}

function set(key, value, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

module.exports = { get, set };
