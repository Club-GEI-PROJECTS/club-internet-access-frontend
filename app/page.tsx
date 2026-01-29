'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Page d'accueil - Redirige vers /home (publique) ou /dashboard (si connecté)
 */
export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Si l'utilisateur est connecté, rediriger vers le dashboard
      router.push('/dashboard')
    } else {
      // Sinon, rediriger vers la page publique d'accueil
      router.push('/home')
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}
