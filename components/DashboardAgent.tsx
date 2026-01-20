'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Plus, DollarSign, Wifi, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import type { WiFiAccount, Payment, CreateWiFiAccountRequest, CreatePaymentRequest, PaymentMethod } from '@/types/api'
import { DurationType, BandwidthProfile, PaymentMethod as PaymentMethodEnum } from '@/types/api'
import { durationLabels, bandwidthLabels, paymentMethodLabels } from '@/types/api'

export default function DashboardAgent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showWiFiModal, setShowWiFiModal] = useState(false)
  const [recentAccounts, setRecentAccounts] = useState<WiFiAccount[]>([])
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])
  
  const [paymentData, setPaymentData] = useState<CreatePaymentRequest>({
    amount: 0,
    method: PaymentMethodEnum.MOBILE_MONEY,
    phoneNumber: '',
  })
  
  const [wifiData, setWifiData] = useState<CreateWiFiAccountRequest>({
    duration: DurationType.HOURS_24,
    bandwidthProfile: BandwidthProfile.STANDARD_2MB,
    maxDevices: 1,
  })

  useEffect(() => {
    loadRecentData()
  }, [])

  const loadRecentData = async () => {
    try {
      const [accounts, payments] = await Promise.all([
        apiClient.wifiAccounts.getActive().catch(() => []),
        apiClient.payments.list().catch(() => []),
      ])
      setRecentAccounts(accounts.slice(0, 5))
      setRecentPayments(payments.slice(0, 5))
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    }
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payment = await apiClient.payments.create(paymentData)
      toast.success('Paiement créé avec succès!')
      setShowPaymentModal(false)
      setPaymentData({
        amount: 0,
        method: PaymentMethodEnum.MOBILE_MONEY,
        phoneNumber: '',
      })
      loadRecentData()
      
      // Si le paiement a un compte Wi-Fi associé, rediriger vers les comptes
      if (payment.wifiAccountId) {
        router.push('/wifi-accounts')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du paiement')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWiFiAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const account = await apiClient.wifiAccounts.create(wifiData)
      toast.success(
        `Compte créé! Username: ${account.username}, Password: ${account.password}`,
        { duration: 8000 }
      )
      setShowWiFiModal(false)
      setWifiData({
        duration: DurationType.HOURS_24,
        bandwidthProfile: BandwidthProfile.STANDARD_2MB,
        maxDevices: 1,
      })
      loadRecentData()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papiers!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Agent</h1>
          <p className="text-gray-600 mt-1">Gérer les paiements et générer des jetons</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <DollarSign className="h-5 w-5" />
            Nouveau paiement
          </button>
          <button
            onClick={() => setShowWiFiModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Créer un jeton
          </button>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/payments')}>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 rounded-full">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Gérer les paiements</h3>
              <p className="text-sm text-gray-600">Créer et compléter les paiements manuels</p>
            </div>
          </div>
        </div>

        <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/wifi-accounts')}>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Gérer les jetons</h3>
              <p className="text-sm text-gray-600">Créer et voir les comptes Wi-Fi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comptes récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Comptes Wi-Fi récents</h2>
          {recentAccounts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun compte récent</p>
          ) : (
            <div className="space-y-3">
              {recentAccounts.map((account) => (
                <div key={account.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{account.username}</span>
                        {account.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {durationLabels[account.duration]} - {bandwidthLabels[account.bandwidthProfile]}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${account.username}/${account.password}`)}
                      className="btn btn-sm btn-secondary"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Paiements récents</h2>
          {recentPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun paiement récent</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{payment.amount.toLocaleString()} CDF</p>
                      <p className="text-sm text-gray-600">
                        {paymentMethodLabels[payment.method]}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {payment.phoneNumber || 'Non spécifié'}
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
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Créer un paiement</h2>
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (CDF) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={paymentData.amount || ''}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                  className="input"
                  placeholder="1000"
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
                  <option value={PaymentMethodEnum.CASH}>Espèces</option>
                  <option value={PaymentMethodEnum.CARD}>Carte</option>
                </select>
              </div>

              {(paymentData.method === PaymentMethodEnum.MOBILE_MONEY || paymentData.method === PaymentMethodEnum.CARD) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={paymentData.phoneNumber || ''}
                    onChange={(e) => setPaymentData({ ...paymentData, phoneNumber: e.target.value })}
                    className="input"
                    placeholder="+243900000000"
                  />
                </div>
              )}

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
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de création de jeton Wi-Fi */}
      {showWiFiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Créer un jeton Wi-Fi</h2>
            <form onSubmit={handleCreateWiFiAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée *
                </label>
                <select
                  value={wifiData.duration}
                  onChange={(e) => setWifiData({ ...wifiData, duration: e.target.value as DurationType })}
                  className="input"
                >
                  <option value={DurationType.HOURS_24}>24 heures</option>
                  <option value={DurationType.HOURS_48}>48 heures</option>
                  <option value={DurationType.DAYS_7}>7 jours</option>
                  <option value={DurationType.DAYS_30}>30 jours</option>
                  <option value={DurationType.UNLIMITED}>Illimité</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Débit *
                </label>
                <select
                  value={wifiData.bandwidthProfile}
                  onChange={(e) => setWifiData({ ...wifiData, bandwidthProfile: e.target.value as BandwidthProfile })}
                  className="input"
                >
                  <option value={BandwidthProfile.BASIC_1MB}>1 Mbps</option>
                  <option value={BandwidthProfile.STANDARD_2MB}>2 Mbps</option>
                  <option value={BandwidthProfile.PREMIUM_5MB}>5 Mbps</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'appareils max
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={wifiData.maxDevices || 1}
                  onChange={(e) => setWifiData({ ...wifiData, maxDevices: parseInt(e.target.value) })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire (optionnel)
                </label>
                <input
                  type="text"
                  value={wifiData.comment || ''}
                  onChange={(e) => setWifiData({ ...wifiData, comment: e.target.value })}
                  className="input"
                  placeholder="Ex: Paiement manuel"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWiFiModal(false)}
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
                  {loading ? 'Création...' : 'Créer le jeton'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
