import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listProjects, createProject } from '../../api/projects'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Navbar } from '../../components/layout/Navbar'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { Input } from '../../components/common/Input'
import './Projects.css'

export function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const loadProjects = () => {
    listProjects()
      .then((res) => setProjects(res.data))
      .catch(() => setError('Failed to load projects.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProjects() }, [])

  return (
    <PageWrapper>
      <Navbar
        title="Projects"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>New Project</Button>
        }
      />
      <div className="page-inner">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p className="loading-text">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create your first one.</p>
            <Button onClick={() => setShowCreate(true)} style={{ marginTop: 14 }}>New Project</Button>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
                <div className="project-card-header">
                  <span className="project-card-icon">{project.name[0].toUpperCase()}</span>
                  <span className={`project-role-badge project-role-badge--${project.role}`}>
                    {project.role}
                  </span>
                </div>
                <h3 className="project-card-name">{project.name}</h3>
                {project.description && (
                  <p className="project-card-desc">{project.description}</p>
                )}
                <span className="project-card-date">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadProjects() }}
        />
      )}
    </PageWrapper>
  )
}

function CreateProjectModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createProject(name, description)
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="New Project" onClose={onClose}>
      {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Website Redesign"
          required
          autoFocus
        />
        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about?"
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Project</Button>
        </div>
      </form>
    </Modal>
  )
}
