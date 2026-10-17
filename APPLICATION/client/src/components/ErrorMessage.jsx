export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state-message error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
