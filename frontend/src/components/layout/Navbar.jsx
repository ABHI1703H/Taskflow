import './Navbar.css'

export function Navbar({ title, actions }) {
  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>
      {actions && <div className="navbar-actions">{actions}</div>}
    </header>
  )
}
