/* Status badge */
export function StatusBadge({ status }) {
  const map = {
    'Pending':      'badge-pending',
    'Under Review': 'badge-under-review',
    'Assigned':     'badge-assigned',
    'In Progress':  'badge-in-progress',
    'Resolved':     'badge-resolved',
    'Rejected':     'badge-rejected',
  };
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

/* Priority badge */
export function PriorityBadge({ priority }) {
  const map = {
    Critical: 'badge-critical',
    High:     'badge-high',
    Medium:   'badge-medium',
    Low:      'badge-low',
  };
  return (
    <span className={`badge ${map[priority] || 'badge-low'}`}>
      {priority === 'Critical' && '⚡ '}
      {priority}
    </span>
  );
}

/* Sentiment badge */
export function SentimentBadge({ sentiment }) {
  const map = {
    Positive: 'badge-positive',
    Neutral:  'badge-neutral',
    Negative: 'badge-negative',
  };
  const emoji = { Positive: '😊', Neutral: '😐', Negative: '😞' };
  return (
    <span className={`badge ${map[sentiment] || 'badge-neutral'}`}>
      <span>{emoji[sentiment]}</span>
      <span>{sentiment}</span>
    </span>
  );
}
