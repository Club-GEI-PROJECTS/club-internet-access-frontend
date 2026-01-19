import { useState, useEffect } from 'react'
import { bandwidthService } from '../services/api'
import { Activity, Download, Upload, Users, RefreshCw } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

interface BandwidthUsage {
  username: string
  ipAddress: string
  bytesIn: number
  bytesOut: number
  totalBytes: number
  bytesInFormatted: string
  bytesOutFormatted: string
  totalBytesFormatted: string
  uptime: string
  downloadSpeed?: number
  uploadSpeed?: number
}

interface BandwidthStats {
  totalBytesIn: number
  totalBytesOut: number
  totalBytes: number
  activeUsers: number
  averageBytesPerUser: number
  topUsers: BandwidthUsage[]
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatSpeed(bytesPerSecond: number): string {
  return formatBytes(bytesPerSecond) + '/s'
}

export default function Bandwidth() {
  const [realtimeUsage, setRealtimeUsage] = useState<BandwidthUsage[]>([])
  const [stats, setStats] = useState<BandwidthStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5 secondes

  const fetchData = async () => {
    try {
      const [usage, statsData] = await Promise.all([
        bandwidthService.getRealTimeUsage(),
        bandwidthService.getStats(),
      ])
      setRealtimeUsage(usage)
      setStats(statsData)
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données de bande passante')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Préparer les données pour les graphiques
  const chartData = realtimeUsage.slice(0, 10).map((user) => ({
    username: user.username.substring(0, 10),
    download: user.bytesIn,
    upload: user.bytesOut,
    total: user.totalBytes,
    downloadSpeed: user.downloadSpeed || 0,
    uploadSpeed: user.uploadSpeed || 0,
  }))

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analyse de Bande Passante</h1>
          <p className="text-gray-600 mt-1">Surveillance en temps réel de la consommation</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Actualisation auto</span>
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="input text-sm"
            disabled={!autoRefresh}
          >
            <option value={2000}>2 secondes</option>
            <option value={5000}>5 secondes</option>
            <option value={10000}>10 secondes</option>
            <option value={30000}>30 secondes</option>
          </select>
          <button
            onClick={fetchData}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Téléchargé</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatBytes(stats.totalBytesIn)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Uploadé</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatBytes(stats.totalBytesOut)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bande Passante</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatBytes(stats.totalBytes)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.activeUsers}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Moyenne: {formatBytes(stats.averageBytesPerUser)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique de consommation totale */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Consommation par Utilisateur</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="username" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatBytes(value)} />
              <Legend />
              <Bar dataKey="download" fill="#3b82f6" name="Téléchargement" />
              <Bar dataKey="upload" fill="#10b981" name="Upload" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique de vitesse */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Vitesse de Transfert</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="username" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatSpeed(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="downloadSpeed"
                stroke="#3b82f6"
                name="Vitesse Download"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="uploadSpeed"
                stroke="#10b981"
                name="Vitesse Upload"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Utilisateurs Actifs - Détails</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléchargé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploadé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vitesse Download
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vitesse Upload
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uptime
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {realtimeUsage.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Aucun utilisateur actif
                  </td>
                </tr>
              ) : (
                realtimeUsage.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-primary-100 rounded-full">
                          <span className="text-primary-600 font-medium text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.bytesInFormatted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.bytesOutFormatted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {user.totalBytesFormatted}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {user.downloadSpeed ? formatSpeed(user.downloadSpeed) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {user.uploadSpeed ? formatSpeed(user.uploadSpeed) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.uptime}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

