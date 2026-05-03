import './Input.css'

export function Input({ label, error, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input className={`input-field${error ? ' input-field--error' : ''}`} {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <textarea className={`input-field input-textarea${error ? ' input-field--error' : ''}`} {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  )
}

export function Select({ label, error, children, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <select className={`input-field input-select${error ? ' input-field--error' : ''}`} {...props}>
        {children}
      </select>
      {error && <span className="input-error">{error}</span>}
    </div>
  )
}
