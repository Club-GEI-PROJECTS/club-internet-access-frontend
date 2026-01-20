'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardAdmin from './DashboardAdmin'
import DashboardAgent from './DashboardAgent'
import DashboardStudent from './DashboardStudent'
import { UserRole } from '@/types/api'

export default function Dashboard() {
  const { user } = useAuth()

  // Rediriger selon le rôle de l'utilisateur
  if (!user) {
    return null
  }

  switch (user.role) {
    case UserRole.ADMIN:
      return <DashboardAdmin />
    case UserRole.AGENT:
      return <DashboardAgent />
    case UserRole.STUDENT:
      return <DashboardStudent />
    default:
      return <DashboardStudent />
  }
}
