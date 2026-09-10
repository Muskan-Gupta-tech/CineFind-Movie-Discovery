export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-state">
      <p>{message || 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
