import './Button.css'

export function Button({ children, variant = 'primary', size = 'md', loading, ...props }) {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="btn-spinner" /> : children}
    </button>
  )
}
