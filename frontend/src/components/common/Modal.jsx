import { useEffect } from 'react'
import './Modal.css'

export function Modal({ title, onClose, children, size = 'md' }) {
  // Close on Escape key
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal modal--${size}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &#10005;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
