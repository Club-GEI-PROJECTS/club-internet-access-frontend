'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Wifi, Clock, HardDrive, ArrowRight, ShoppingCart } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { TicketType } from '@/types/api'
import toast from 'react-hot-toast'

/**
 * Page d'accueil publique - Liste des types de tickets disponibles
 * 
 * Cette page affiche les différents types de tickets Wi-Fi disponibles
 * et permet de rediriger vers la page d'achat
 */
export default function HomePage() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadTicketTypes()
  }, [])

  const loadTicketTypes = async () => {
    try {
      const data = await apiClient.tickets.getTypes()
      // Filtrer uniquement les types actifs avec des tickets disponibles
      const availableTypes = data.filter(type => type.isActive && type.availableCount > 0)
      setTicketTypes(availableTypes)
    } catch (error: any) {
      toast.error('Erreur lors du chargement des types de tickets')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatLimit = (limit?: string) => {
    if (!limit) return 'Illimité'
    return limit
  }

  const handleBuyTicket = (typeId: string) => {
    router.push(`/buy-ticket?type=${typeId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
      {/* Header */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Club Internet Access</h1>
                <p className="text-white text-opacity-90 text-sm">Université de Kinshasa - UNIKIN</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                Connexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Achetez votre accès Wi-Fi
          </h2>
          <p className="text-xl text-white text-opacity-90 max-w-2xl mx-auto">
            Choisissez le forfait qui correspond à vos besoins et connectez-vous en quelques minutes
          </p>
        </div>

        {loading ? (
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white text-opacity-90">Chargement des forfaits...</p>
          </div>
        ) : ticketTypes.length === 0 ? (
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-12">
            <ShoppingCart className="h-16 w-16 text-white text-opacity-50 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Aucun forfait disponible
            </h3>
            <p className="text-white text-opacity-90">
              Tous les tickets ont été vendus. Veuillez réessayer plus tard.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ticketTypes.map((type) => (
              <div
                key={type.id}
                className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <Wifi className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {type.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {type.description}
                  </p>
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    {formatPrice(type.price)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {type.availableCount} ticket{type.availableCount > 1 ? 's' : ''} disponible{type.availableCount > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {type.timeLimit && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-primary-600" />
                      <span>Durée: <strong>{formatLimit(type.timeLimit)}</strong></span>
                    </div>
                  )}
                  {type.dataLimit && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <HardDrive className="h-4 w-4 text-primary-600" />
                      <span>Données: <strong>{formatLimit(type.dataLimit)}</strong></span>
                    </div>
                  )}
                  {!type.timeLimit && !type.dataLimit && (
                    <div className="text-sm text-gray-600">
                      <span>Durée et données <strong>illimitées</strong></span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleBuyTicket(type.id)}
                  className="w-full btn btn-primary py-3 text-base font-semibold flex items-center justify-center gap-2"
                >
                  Acheter maintenant
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-white text-opacity-75 text-sm">
            Besoin d'aide ? Contactez-nous à support@clubgei-polytech.org
          </p>
        </div>
      </div>
    </div>
  )
}
