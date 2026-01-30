'use client'

import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import DashboardAdmin from './DashboardAdmin'
import DashboardAgent from './DashboardAgent'
import DashboardStudent from './DashboardStudent'
import { UserRole } from '@/types/api'

export default function Dashboard() {
  const { user } = useAuth()

  if (!user) {
    logger.debug('Dashboard: pas d\'utilisateur')
    return null
  }

  logger.log('Dashboard: affichage selon rôle', { email: user.email, role: user.role })
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
