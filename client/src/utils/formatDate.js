export function formatYear(dateString) {
  if (!dateString) return 'N/A';
  return dateString.slice(0, 4);
}

export function formatFullDate(dateString) {
  if (!dateString) return 'Release date unknown';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Release date unknown';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatRuntime(minutes) {
  if (!minutes) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}
