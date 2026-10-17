export default function PriorityBadge({ priority }) {
  const className = `badge priority-${priority.toLowerCase()}`;
  return <span className={className}>{priority}</span>;
}
