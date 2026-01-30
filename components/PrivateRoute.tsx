'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      logger.info('PrivateRoute: non authentifié, redirection vers /login')
      router.push('/login')
    } else if (user) {
      logger.debug('PrivateRoute: accès autorisé', { email: user.email, role: user.role })
    }
  }, [user, loading, router])

  if (loading) {
    logger.debug('PrivateRoute: chargement auth en cours')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    logger.log('PrivateRoute: pas d\'utilisateur, rendu null')
    return null
  }

  return <>{children}</>
}
