import { useEffect, useState } from 'react'
import { wifiAccountsService } from '../services/api'
import { Plus, Trash2, Copy, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface WiFiAccount {
  id: string
  username: string
  password: string
  duration: string
  bandwidthProfile: string
  expiresAt: string | null
  isActive: boolean
  isExpired: boolean
  createdAt: string
}

export default function WiFiAccounts() {
  const [accounts, setAccounts] = useState<WiFiAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    duration: '24h',
    bandwidthProfile: '2mbps',
    maxDevices: 1,
    comment: '',
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const data = await wifiAccountsService.getAll()
      setAccounts(data)
    } catch (error: any) {
      toast.error('Erreur lors du chargement des comptes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newAccount = await wifiAccountsService.create(formData)
      toast.success('Compte Wi-Fi créé avec succès!')
      setShowCreateModal(false)
      setFormData({ duration: '24h', bandwidthProfile: '2mbps', maxDevices: 1, comment: '' })
      loadAccounts()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte?')) return

    try {
      await wifiAccountsService.delete(id)
      toast.success('Compte supprimé')
      loadAccounts()
    } catch (error: any) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copié!`)
  }

  const getStatusBadge = (account: WiFiAccount) => {
    if (account.isExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Expiré
        </span>
      )
    }
    if (account.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Actif
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Clock className="h-3 w-3 mr-1" />
        Inactif
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Comptes Wi-Fi</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Créer un compte
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Créer un compte Wi-Fi</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="input"
                >
                  <option value="24h">24 heures</option>
                  <option value="48h">48 heures</option>
                  <option value="7d">7 jours</option>
                  <option value="30d">30 jours</option>
                  <option value="unlimited">Illimité</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Débit
                </label>
                <select
                  value={formData.bandwidthProfile}
                  onChange={(e) => setFormData({ ...formData, bandwidthProfile: e.target.value })}
                  className="input"
                >
                  <option value="1mbps">1 Mbps</option>
                  <option value="2mbps">2 Mbps</option>
                  <option value="5mbps">5 Mbps</option>
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
                  value={formData.maxDevices}
                  onChange={(e) => setFormData({ ...formData, maxDevices: parseInt(e.target.value) })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="input"
                  placeholder="Ex: Compte étudiant"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accounts Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mot de passe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Débit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-mono text-sm">{account.username}</span>
                      <button
                        onClick={() => copyToClipboard(account.username, 'Username')}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-mono text-sm">••••••••</span>
                      <button
                        onClick={() => copyToClipboard(account.password, 'Mot de passe')}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.bandwidthProfile}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.expiresAt
                      ? format(new Date(account.expiresAt), 'dd/MM/yyyy HH:mm')
                      : 'Illimité'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(account)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun compte Wi-Fi créé</p>
          </div>
        )}
      </div>
    </div>
  )
}

