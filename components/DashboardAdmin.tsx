'use client'

import { useEffect, useState } from 'react'
import { dashboardService } from '@/services/api'
import { 
  Wifi, 
  Activity, 
  DollarSign,
  Users
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import type { DashboardStats, ChartData } from '@/types/api'

export default function DashboardAdmin() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [charts, setCharts] = useState<ChartData | null>(null)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CD', { 
      style: 'currency', 
      currency: 'CDF',
      minimumFractionDigits: 0 
    }).format(amount)
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Admin</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble complète du système</p>
        </div>
        <button
          onClick={loadData}
          className="btn btn-secondary"
        >
          Actualiser
        </button>
      </div>

      {/* Statistiques principales */}
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
            <div className="p-3 bg-blue-100 rounded-full">
              <Wifi className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.payments.revenue)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stats.payments.completed} paiements
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sessions actives</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sessions.active}</p>
              <p className="text-xs text-blue-600 mt-1">
                {formatBytes(stats.sessions.totalBytesTransferred)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
              <p className="text-xs text-blue-600 mt-1">
                {stats.users.active} actifs
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Paiements</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{stats.payments.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Complétés</span>
              <span className="text-green-600 font-semibold">{stats.payments.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">En attente</span>
              <span className="text-yellow-600 font-semibold">{stats.payments.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Échoués</span>
              <span className="text-red-600 font-semibold">{stats.payments.failed}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-semibold">Revenus</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(stats.payments.revenue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Sessions</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{stats.sessions.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Actives</span>
              <span className="text-green-600 font-semibold">{stats.sessions.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">MikroTik actives</span>
              <span className="text-blue-600 font-semibold">{stats.sessions.mikrotikActive}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-semibold">Trafic total</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatBytes(stats.sessions.totalBytesTransferred)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique des paiements */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Revenus (7 derniers jours)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.payments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Revenus (CDF)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique des comptes */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Comptes créés/expirés</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.accounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
                />
                <Legend />
                <Bar dataKey="created" fill="#3b82f6" name="Créés" />
                <Bar dataKey="expired" fill="#ef4444" name="Expirés" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
