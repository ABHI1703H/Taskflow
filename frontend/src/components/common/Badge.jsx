import './Badge.css'

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

export function Badge({ status }) {
  return (
    <span className={`badge badge--${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}
