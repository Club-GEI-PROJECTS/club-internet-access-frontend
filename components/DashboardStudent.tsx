'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Wifi, ShoppingCart, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { WiFiAccount, Payment, CreatePaymentRequest } from '@/types/api'
import { PaymentMethod } from '@/types/api'
import { PaymentMethod as PaymentMethodEnum } from '@/types/api'
import { durationLabels, bandwidthLabels } from '@/types/api'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function DashboardStudent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [myAccounts, setMyAccounts] = useState<WiFiAccount[]>([])
  const [myPayments, setMyPayments] = useState<Payment[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<string>('24h')
  
  const [paymentData, setPaymentData] = useState<CreatePaymentRequest>({
    amount: 0,
    method: PaymentMethodEnum.MOBILE_MONEY,
    phoneNumber: '',
  })

  useEffect(() => {
    loadMyData()
  }, [])

  const loadMyData = async () => {
    try {
      // Récupérer tous les comptes actifs et filtrer par utilisateur si nécessaire
      const accounts = await apiClient.wifiAccounts.list()
      const payments = await apiClient.payments.list()
      
      // TODO: Filtrer par l'utilisateur connecté quand le backend le permet
      setMyAccounts(accounts.filter(acc => acc.isActive).slice(0, 5))
      setMyPayments(payments.slice(0, 5))
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    }
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await apiClient.payments.create(paymentData)
      toast.success('Paiement créé avec succès!')
      setShowPaymentModal(false)
      setPaymentData({
        amount: 0,
        method: PaymentMethodEnum.MOBILE_MONEY,
        phoneNumber: '',
      })
      loadMyData()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du paiement')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papiers!')
  }

  const getDurationPrice = (duration: string) => {
    // Prix en CDF - À adapter selon vos tarifs
    const prices: Record<string, number> = {
      '24h': 1000,
      '48h': 1800,
      '7d': 5000,
      '30d': 18000,
    }
    return prices[duration] || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Espace Étudiant</h1>
          <p className="text-gray-600 mt-1">Achetez et gérez votre connexion Wi-Fi</p>
        </div>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          Acheter une connexion
        </button>
      </div>

      {/* Mes comptes actifs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mes connexions actives</h2>
          <button
            onClick={() => router.push('/wifi-accounts')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Voir tout
          </button>
        </div>
        {myAccounts.length === 0 ? (
          <div className="text-center py-8">
            <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune connexion active</p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn btn-primary mt-4"
            >
              Acheter une connexion
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-semibold text-lg">{account.username}</span>
                      {account.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactif
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Durée:</span>
                        <span className="ml-2 font-medium">{durationLabels[account.duration]}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Débit:</span>
                        <span className="ml-2 font-medium">{bandwidthLabels[account.bandwidthProfile]}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Expire le:</span>
                        <span className="ml-2 font-medium">
                          {account.expiresAt 
                            ? format(new Date(account.expiresAt), 'dd MMM yyyy HH:mm', { locale: fr })
                            : 'Illimité'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Appareils:</span>
                        <span className="ml-2 font-medium">{account.maxDevices}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${account.username}/${account.password}`)}
                    className="btn btn-sm btn-secondary ml-4"
                  >
                    Copier identifiants
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mes paiements */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mes paiements</h2>
          <button
            onClick={() => router.push('/payments')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Voir tout
          </button>
        </div>
        {myPayments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun paiement</p>
        ) : (
          <div className="space-y-3">
            {myPayments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{payment.amount.toLocaleString()} CDF</p>
                    <p className="text-sm text-gray-600">
                      {payment.createdAt && format(new Date(payment.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'achat */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Acheter une connexion</h2>
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée *
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => {
                    setSelectedDuration(e.target.value)
                    setPaymentData({ ...paymentData, amount: getDurationPrice(e.target.value) })
                  }}
                  className="input"
                >
                  <option value="24h">24 heures - 1,000 CDF</option>
                  <option value="48h">48 heures - 1,800 CDF</option>
                  <option value="7d">7 jours - 5,000 CDF</option>
                  <option value="30d">30 jours - 18,000 CDF</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={paymentData.amount || ''}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                  className="input"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement *
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value as PaymentMethod })}
                  className="input"
                >
                  <option value={PaymentMethodEnum.MOBILE_MONEY}>Mobile Money</option>
                  <option value={PaymentMethodEnum.CARD}>Carte bancaire</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={paymentData.phoneNumber || ''}
                  onChange={(e) => setPaymentData({ ...paymentData, phoneNumber: e.target.value })}
                  className="input"
                  placeholder="+243900000000"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Instructions:</strong> Après le paiement, vous recevrez vos identifiants de connexion Wi-Fi.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 btn btn-secondary"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Traitement...' : `Payer ${paymentData.amount.toLocaleString()} CDF`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
