export default function StatusBadge({ status }) {
  const className = `badge status-${status.replace(/\s+/g, '-').toLowerCase()}`;
  return <span className={className}>{status}</span>;
}
