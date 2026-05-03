import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../../api/projects'
import { useAuth } from '../../hooks/useAuth'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Navbar } from '../../components/layout/Navbar'
import { Badge } from '../../components/common/Badge'
import './Dashboard.css'

export function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageWrapper>
      <Navbar title="Dashboard" />
      <div className="page-inner">
        <p className="dashboard-greeting">Hello, {user?.name?.split(' ')[0]}.</p>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="dashboard-loading">Loading...</div>
        ) : data && (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-value">{data.project_count}</span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{data.tasks_by_status.todo}</span>
                <span className="stat-label">To Do</span>
              </div>
              <div className="stat-card stat-card--blue">
                <span className="stat-value">{data.tasks_by_status.in_progress}</span>
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat-card stat-card--green">
                <span className="stat-value">{data.tasks_by_status.done}</span>
                <span className="stat-label">Done</span>
              </div>
            </div>

            <section className="dashboard-section">
              <h2 className="dashboard-section-title">Overdue Tasks</h2>
              {data.overdue_tasks.length === 0 ? (
                <div className="empty-state">
                  <p>No overdue tasks. Great work!</p>
                </div>
              ) : (
                <div className="overdue-list">
                  {data.overdue_tasks.map((task) => (
                    <div key={task.id} className="overdue-item">
                      <div className="overdue-info">
                        <span className="overdue-title">{task.title}</span>
                        <span className="overdue-project">{task.project_name}</span>
                      </div>
                      <div className="overdue-meta">
                        <Badge status={task.status} />
                        <span className="overdue-date">
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </PageWrapper>
  )
}
