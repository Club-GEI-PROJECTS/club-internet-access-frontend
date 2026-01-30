'use client'

import { Wifi, ArrowRight } from 'lucide-react'
import { logger } from '@/lib/logger'

/**
 * Page "tampon" pour le portail captif MikroTik
 */
export default function CaptivePage() {
  const handleContinue = () => {
    if (typeof window !== 'undefined') {
      logger.log('Captive: clic Continuer, redirection vers /buy-ticket (HTTPS)')
      const httpsUrl = window.location.href.replace('http://', 'https://').replace('/captive', '/buy-ticket')
      window.location.href = httpsUrl
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
            <Wifi className="h-8 w-8 text-primary-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenue sur le Wi-Fi
          </h1>
          
          <p className="text-gray-600 mb-2">
            Club Internet Access
          </p>
          
          <p className="text-sm text-gray-500 mb-8">
            Université de Kinshasa - UNIKIN
          </p>

          <div className="bg-primary-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              Pour accéder à Internet, vous devez vous connecter ou créer un compte.
            </p>
            <p className="text-xs text-gray-600">
              Cliquez sur le bouton ci-dessous pour continuer.
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="w-full btn btn-primary py-3 text-base font-semibold flex items-center justify-center gap-2"
          >
            Continuer pour se connecter
            <ArrowRight className="h-5 w-5" />
          </button>

          <div className="mt-6 text-xs text-gray-500">
            <p>En continuant, vous acceptez nos conditions d'utilisation</p>
          </div>
        </div>
      </div>
    </div>
  )
}
