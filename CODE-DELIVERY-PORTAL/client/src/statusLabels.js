export function statusLabel(status) {
  switch (status) {
    case 'LIVE':
      return 'Live';
    case 'COMPLETED':
      return 'Completed';
    default:
      return 'Coming Soon';
  }
}

export function statusClass(status) {
  switch (status) {
    case 'LIVE':
      return 'status-live';
    case 'COMPLETED':
      return 'status-completed';
    default:
      return 'status-soon';
  }
}
