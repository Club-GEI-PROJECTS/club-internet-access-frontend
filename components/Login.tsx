'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { Wifi, UserPlus } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { RegisterRequest } from '@/types/api'
import { UserRole } from '@/types/api'

export default function Login() {
  // IMPORTANT: Ne pas forcer HTTPS sur cette page
  // Le portail captif MikroTik redirige en HTTP avant authentification
  // On accepte HTTP ici, puis on redirige vers HTTPS après login
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerData, setRegisterData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: UserRole.STUDENT,
  })
  const { login, user } = useAuth()
  const router = useRouter()

  // Vérifier si l'utilisateur est déjà authentifié
  // Si oui, rediriger vers HTTPS
  useEffect(() => {
    if (user && typeof window !== 'undefined' && window.location.protocol === 'http:') {
      const httpsUrl = window.location.href.replace('http://', 'https://').replace('/login', '/')
      window.location.href = httpsUrl
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Connexion réussie!')
      
      // Redirection HTTPS après authentification
      // Si on est en HTTP (portail captif), on redirige vers HTTPS
      if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
        const httpsUrl = window.location.href.replace('http://', 'https://')
        window.location.href = httpsUrl.replace('/login', '/')
      } else {
        router.push('/')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterLoading(true)

    try {
      await apiClient.auth.register(registerData)
      toast.success('Compte créé avec succès! Vous pouvez maintenant vous connecter.')
      setShowRegisterModal(false)
      setRegisterData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: UserRole.STUDENT,
      })
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du compte')
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Wifi className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Club Internet Access
            </h1>
            <p className="text-gray-600">Université de Kinshasa - UNIKIN</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@unikin.cd"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Mot de passe oublié?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="w-full btn btn-secondary py-3 text-base font-semibold flex items-center justify-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              Créer un compte étudiant
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Accès réservé au personnel autorisé</p>
          </div>
        </div>

        {/* Modal d'inscription */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-3">
                  <UserPlus className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Créer un compte étudiant
                </h2>
                <p className="text-sm text-gray-600">
                  Remplissez le formulaire pour créer votre compte
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      className="input"
                      placeholder="Jean"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      className="input"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="registerEmail"
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="input"
                    placeholder="etudiant@unikin.cd"
                  />
                </div>

                <div>
                  <label htmlFor="registerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    id="registerPhone"
                    type="tel"
                    value={registerData.phone || ''}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="input"
                    placeholder="+243900000000"
                  />
                </div>

                <div>
                  <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    id="registerPassword"
                    type="password"
                    required
                    minLength={6}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="input"
                    placeholder="••••••••"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 6 caractères
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="flex-1 btn btn-secondary"
                    disabled={registerLoading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                    disabled={registerLoading}
                  >
                    {registerLoading ? 'Création...' : 'Créer le compte'}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center text-xs text-gray-500">
                <p>En créant un compte, vous acceptez les conditions d'utilisation</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

