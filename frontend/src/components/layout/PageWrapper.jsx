import { Sidebar } from './Sidebar'
import './PageWrapper.css'

export function PageWrapper({ children }) {
  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content">
        {children}
      </div>
    </div>
  )
}
