'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'

/**
 * Page d'accueil - Redirige vers /home (publique) ou /dashboard (si connecté)
 */
export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    logger.log('Page /: redirection selon état auth', { hasUser: !!user })
    if (user) {
      logger.info('Page /: utilisateur connecté → /dashboard')
      router.push('/dashboard')
    } else {
      logger.info('Page /: non connecté → /home')
      router.push('/home')
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}
