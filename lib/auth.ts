// Gestion de l'authentification et du token

import { logger } from './logger'

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
    logger.info('Auth: token stocké')
  }
}

/**
 * Récupère le token d'authentification
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    logger.debug('Auth: getToken', token ? 'token présent' : 'aucun token')
    return token
  }
  return null
}

/**
 * Supprime le token d'authentification
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    logger.info('Auth: token supprimé')
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  const ok = getToken() !== null
  logger.debug('Auth: isAuthenticated', ok)
  return ok
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
