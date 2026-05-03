import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject, deleteProject, listMembers, addMember, removeMember } from '../../api/projects'
import { listTasks, createTask, updateTask, deleteTask } from '../../api/tasks'
import { useAuth } from '../../hooks/useAuth'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Navbar } from '../../components/layout/Navbar'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { Input, Select } from '../../components/common/Input'
import { Badge } from '../../components/common/Badge'
import { TaskDetailModal } from '../tasks/TaskDetailModal'
import './ProjectDetail.css'

export function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showAddMember, setShowAddMember] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const isAdmin = project?.role === 'admin'

  const load = async () => {
    try {
      const [projRes, membersRes, tasksRes] = await Promise.all([
        getProject(id),
        listMembers(id),
        listTasks(id),
      ])
      setProject(projRes.data)
      setMembers(membersRes.data)
      setTasks(tasksRes.data)
    } catch {
      setError('Failed to load project.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return
    try {
      await deleteProject(id)
      navigate('/projects')
    } catch {
      setError('Failed to delete project.')
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return
    try {
      await removeMember(id, memberId)
      setMembers((prev) => prev.filter((m) => m.user_id !== memberId))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove member.')
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(id, taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      setSelectedTask(null)
    } catch {
      setError('Failed to delete task.')
    }
  }

  const handleUpdateTask = async (taskId, data) => {
    try {
      const res = await updateTask(id, taskId, data)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)))
      setSelectedTask(res.data)
    } catch (err) {
      throw err
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <Navbar title="Project" />
        <div className="page-inner"><p className="loading-text">Loading...</p></div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <Navbar
        title={project?.name || 'Project'}
        actions={
          isAdmin && (
            <Button variant="danger" size="sm" onClick={handleDeleteProject}>
              Delete Project
            </Button>
          )
        }
      />
      <div className="page-inner">
        {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}

        {project?.description && (
          <p className="project-description">{project.description}</p>
        )}

        <div className="project-detail-grid">
          {/* Members panel */}
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Members <span className="panel-count">{members.length}</span></h2>
              {isAdmin && (
                <Button size="sm" variant="secondary" onClick={() => setShowAddMember(true)}>
                  Add Member
                </Button>
              )}
            </div>
            <div className="member-list">
              {members.map((m) => (
                <div key={m.id} className="member-item">
                  <div className="member-avatar">{m.name[0].toUpperCase()}</div>
                  <div className="member-info">
                    <span className="member-name">{m.name}</span>
                    <span className="member-email">{m.email}</span>
                  </div>
                  <span className={`project-role-badge project-role-badge--${m.role}`}>{m.role}</span>
                  {isAdmin && m.user_id !== user?.id && (
                    <button
                      className="member-remove"
                      onClick={() => handleRemoveMember(m.user_id)}
                      title="Remove member"
                    >
                      &#10005;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Tasks panel */}
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Tasks <span className="panel-count">{tasks.length}</span></h2>
              {isAdmin && (
                <Button size="sm" variant="secondary" onClick={() => setShowCreateTask(true)}>
                  Add Task
                </Button>
              )}
            </div>
            {tasks.length === 0 ? (
              <div className="empty-state"><p>No tasks yet.</p></div>
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    className="task-item"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="task-item-top">
                      <span className="task-item-title">{task.title}</span>
                      <Badge status={task.status} />
                    </div>
                    <div className="task-item-meta">
                      {task.assigned_name && (
                        <span className="task-assignee">{task.assigned_name}</span>
                      )}
                      {task.due_date && (
                        <span className="task-due">Due {new Date(task.due_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {showAddMember && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowAddMember(false)}
          onAdded={() => { setShowAddMember(false); load() }}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          projectId={id}
          members={members}
          onClose={() => setShowCreateTask(false)}
          onCreated={() => { setShowCreateTask(false); load() }}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isAdmin={isAdmin}
          currentUserId={user?.id}
          members={members}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </PageWrapper>
  )
}

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await addMember(projectId, email, role)
      onAdded()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add member.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Add Member" onClose={onClose} size="sm">
      {error && <div className="error-message" style={{ marginBottom: 14 }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@example.com"
          required
          autoFocus
        />
        <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </Select>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Add Member</Button>
        </div>
      </form>
    </Modal>
  )
}

function CreateTaskModal({ projectId, members, onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [status, setStatus] = useState('todo')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createTask(projectId, {
        title,
        description: description || null,
        assigned_to: assignedTo || null,
        status,
        due_date: dueDate || null,
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="New Task" onClose={onClose}>
      {error && <div className="error-message" style={{ marginBottom: 14 }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
          autoFocus
        />
        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details..."
        />
        <Select label="Assign To" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>{m.name}</option>
          ))}
        </Select>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </Select>
        <Input
          label="Due Date (optional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Task</Button>
        </div>
      </form>
    </Modal>
  )
}
