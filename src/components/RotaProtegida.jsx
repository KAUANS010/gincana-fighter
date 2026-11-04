import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RotaProtegida() {
  const { user, carregando } = useAuth()
  const local = useLocation()
  if (carregando) return <p className="tela-mensagem">Carregando...</p>
  if (!user) return <Navigate to="/login" replace state={{ de: local.pathname }} />
  return <Outlet />
}
