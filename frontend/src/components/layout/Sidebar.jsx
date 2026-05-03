import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Sidebar.css'

export function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">TF</span>
        <span className="sidebar-name">TaskFlow</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}>
          Projects
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-email">{user?.email}</span>
          </div>
        </div>
        <button className="sidebar-signout" onClick={signOut}>Sign out</button>
      </div>
    </aside>
  )
}
