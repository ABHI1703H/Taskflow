import { useState } from 'react'
import { Modal } from '../../components/common/Modal'
import { Button } from '../../components/common/Button'
import { Select } from '../../components/common/Input'
import { Badge } from '../../components/common/Badge'
import './Tasks.css'

export function TaskDetailModal({ task, isAdmin, currentUserId, members, onClose, onUpdate, onDelete }) {
  const [status, setStatus] = useState(task.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canUpdateStatus = isAdmin || task.assigned_to === currentUserId
  const statusChanged = status !== task.status

  const handleSave = async () => {
    if (!statusChanged) return
    setError('')
    setSaving(true)
    try {
      await onUpdate(task.id, { status })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update task.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!confirm('Delete this task?')) return
    onDelete(task.id)
  }

  return (
    <Modal title="Task Detail" onClose={onClose}>
      <div className="task-detail">
        <div className="task-detail-header">
          <h3 className="task-detail-title">{task.title}</h3>
          <Badge status={task.status} />
        </div>

        {task.description && (
          <p className="task-detail-desc">{task.description}</p>
        )}

        <div className="task-detail-meta">
          {task.assigned_name && (
            <div className="task-meta-row">
              <span className="task-meta-label">Assigned to</span>
              <span className="task-meta-value">{task.assigned_name}</span>
            </div>
          )}
          {task.due_date && (
            <div className="task-meta-row">
              <span className="task-meta-label">Due date</span>
              <span className="task-meta-value">
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="task-meta-row">
            <span className="task-meta-label">Created</span>
            <span className="task-meta-value">
              {new Date(task.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {error && <div className="error-message" style={{ marginTop: 12 }}>{error}</div>}

        {canUpdateStatus && (
          <div className="task-detail-actions">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </Select>
            <div className="task-detail-buttons">
              {isAdmin && (
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  Delete Task
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSave}
                loading={saving}
                disabled={!statusChanged}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
