'use client'

import { useEffect, useState } from 'react'
import { dashboardService } from '@/services/api'
import { 
  Wifi, 
  Activity, 
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

interface Stats {
  accounts: {
    total: number
    active: number
    expired: number
  }
  payments: {
    total: number
    completed: number
    revenue: number
  }
  sessions: {
    total: number
    active: number
    mikrotikActive: number
    totalBytesTransferred: number
  }
  users: {
    total: number
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [charts, setCharts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [statsData, chartsData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCharts(7),
      ])
      setStats(statsData)
      setCharts(chartsData)
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={loadData}
          className="btn btn-secondary"
        >
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Comptes Wi-Fi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.accounts.total}</p>
              <p className="text-xs text-green-600 mt-1">
                {stats.accounts.active} actifs
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Wifi className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.payments.revenue.toLocaleString()} CDF
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.payments.completed} paiements
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sessions Actives</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.sessions.mikrotikActive}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.sessions.total} total
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trafic Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatBytes(stats.sessions.totalBytesTransferred)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Données transférées
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Comptes créés (7 derniers jours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts?.accounts || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Paiements (7 derniers jours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts?.payments || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10b981" name="Nombre" />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenus (CDF)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.accounts.expired > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">
                {stats.accounts.expired} compte(s) expiré(s)
              </p>
              <p className="text-sm text-yellow-600">
                Consultez la page Comptes Wi-Fi pour plus de détails
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
