import { useEffect, useState } from 'react'
import { sessionsService, mikrotikService } from '../services/api'
import { RefreshCw, Wifi, Activity, Download, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Session {
  id: string
  wifiAccount: {
    username: string
  } | null
  ipAddress: string | null
  bytesIn: number
  bytesOut: number
  connectedAt: string | null
  isActive: boolean
}

interface ActiveUser {
  id: string
  user: string
  address: string
  uptime: string
  'bytes-in': number
  'bytes-out': number
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [sessionsData, activeData, statsData] = await Promise.all([
        sessionsService.getActive(),
        mikrotikService.getActiveUsers(),
        sessionsService.getStatistics(),
      ])
      setSessions(sessionsData)
      setActiveUsers(activeData)
      setStatistics(statsData)
    } catch (error: any) {
      toast.error('Erreur lors du chargement des sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await sessionsService.sync()
      toast.success('Synchronisation réussie!')
      loadData()
    } catch (error: any) {
      toast.error('Erreur lors de la synchronisation')
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter cet utilisateur?')) return

    try {
      await mikrotikService.disconnectUser(sessionId)
      toast.success('Utilisateur déconnecté')
      loadData()
    } catch (error: any) {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatUptime = (uptime: string) => {
    // MikroTik uptime format: "1d 2h 30m 15s"
    return uptime
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sessions Actives</h1>
          <p className="text-gray-600 mt-1">
            {activeUsers.length} utilisateur(s) connecté(s) en temps réel
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Synchroniser
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions totales</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalSessions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions actives</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.activeSessions}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trafic total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBytes(statistics.totalBytesTransferred)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Users Table */}
      <div className="card overflow-hidden">
        <h2 className="text-lg font-semibold mb-4 px-6 pt-6">Utilisateurs connectés (MikroTik)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temps de connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléchargé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Envoyé
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-medium">{user.user}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatUptime(user.uptime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Download className="h-4 w-4 text-blue-600 mr-1" />
                      {formatBytes(user['bytes-in'])}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Upload className="h-4 w-4 text-green-600 mr-1" />
                      {formatBytes(user['bytes-out'])}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDisconnect(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Déconnecter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activeUsers.length === 0 && (
          <div className="text-center py-12">
            <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun utilisateur connecté</p>
          </div>
        )}
      </div>
    </div>
  )
}

