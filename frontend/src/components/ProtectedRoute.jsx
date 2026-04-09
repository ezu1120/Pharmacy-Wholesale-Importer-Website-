import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

// DEV_BYPASS: set to true to skip auth checks during UI development
const DEV_BYPASS = import.meta.env.DEV

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuthStore()

  if (DEV_BYPASS) return children

  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  return children
}
