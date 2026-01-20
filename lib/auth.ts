// Gestion de l'authentification et du token

/**
 * Gestion de l'authentification avec localStorage
 * Pour utiliser cookies, décommentez la section en bas de fichier
 */

/**
 * Stocke le token d'authentification
 * Utilise localStorage par défaut, peut être adapté pour cookies
 */
export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
  }
}

/**
 * Récupère le token d'authentification
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

/**
 * Supprime le token d'authentification
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null
}

/* 
 * ============================================
 * ALTERNATIVE AVEC COOKIES (Plus sécurisé)
 * ============================================
 * 
 * Pour activer les cookies au lieu de localStorage :
 * 1. Décommentez le code ci-dessous
 * 2. Commentez les fonctions ci-dessus
 * 3. js-cookie est déjà installé (npm install js-cookie @types/js-cookie)
 * 
 * Avantages des cookies :
 * - httpOnly possible (côté serveur)
 * - Secure flag en production
 * - SameSite protection
 * 
import Cookies from 'js-cookie'

export const setToken = (token: string) => {
  Cookies.set('token', token, {
    expires: 7, // 7 jours
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
}

export const getToken = (): string | null => {
  return Cookies.get('token') || null
}

export const removeToken = () => {
  Cookies.remove('token')
}

export const isAuthenticated = (): boolean => {
  return getToken() !== null
}
*/
