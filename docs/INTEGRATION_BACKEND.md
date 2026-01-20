# 🔗 Intégration Frontend Next.js

Guide complet pour intégrer le frontend Next.js avec le backend API.

---

## 🌐 Configuration CORS

Le backend est configuré pour accepter les requêtes depuis le frontend Next.js.

### Variables d'environnement backend

```env
FRONTEND_URL=http://localhost:3000,https://votre-frontend.railway.app
```

**Note :** Vous pouvez spécifier plusieurs URLs séparées par des virgules.

### Configuration actuelle

Le backend accepte :
- ✅ Requêtes depuis `FRONTEND_URL`
- ✅ Credentials (cookies, headers d'authentification)
- ✅ Méthodes : GET, POST, PUT, DELETE, PATCH, OPTIONS
- ✅ Headers : Content-Type, Authorization

---

## 🔐 Authentification

### 1. Login

Le frontend utilise déjà `authService.login()` qui fait :

```typescript
const response = await api.post('/auth/login', { email, password })
return response.data // { access_token, user }
```

### 2. Stockage du token

**Actuellement :** localStorage (via `lib/auth.ts`)

**Option alternative :** Cookies (plus sécurisé en production)

Pour activer les cookies, décommentez le code dans `lib/auth.ts` et installez :

```bash
npm install js-cookie @types/js-cookie
```

### 3. Requêtes authentifiées

Le frontend offre **trois approches** pour les appels API :

**Option 1 :** Client API réutilisable (recommandé, dans `lib/api-client.ts`)
```typescript
import { apiClient } from '@/lib/api-client'

// Toutes les méthodes sont organisées par domaine
const accounts = await apiClient.wifiAccounts.list()
const stats = await apiClient.dashboard.getStats()
const activeUsers = await apiClient.mikrotik.getActiveUsers()
```

**Option 2 :** Axios (actuel, dans `services/api.ts`)
```typescript
import { wifiAccountsService } from '@/services/api'
const accounts = await wifiAccountsService.getAll()
```

**Option 3 :** Fetch API de base (dans `lib/api.ts`)
```typescript
import { apiRequest } from '@/lib/api'
const accounts = await apiRequest<WiFiAccount[]>('/wifi-accounts')
```

---

## 📡 Exemples d'appels API

### Créer un compte Wi-Fi

```typescript
// Recommandé : Client API réutilisable
import { apiClient } from '@/lib/api-client'

const account = await apiClient.wifiAccounts.create({
  duration: '24h',
  bandwidthProfile: '2mbps',
  maxDevices: 1,
  comment: 'Compte étudiant',
})

// Alternative : Axios (services/api.ts)
import { wifiAccountsService } from '@/services/api'

const account = await wifiAccountsService.create({
  duration: '24h',
  bandwidthProfile: '2mbps',
  maxDevices: 1,
  comment: 'Compte étudiant',
})

// Alternative : Fetch de base (lib/api.ts)
import { apiRequest } from '@/lib/api'

const account = await apiRequest<WiFiAccount>('/wifi-accounts', {
  method: 'POST',
  body: {
    duration: '24h',
    bandwidthProfile: '2mbps',
    maxDevices: 1,
    comment: 'Compte étudiant',
  },
})
```

### Lister les comptes Wi-Fi

```typescript
// Recommandé : Client API réutilisable
import { apiClient } from '@/lib/api-client'
import { useEffect, useState } from 'react'

function WiFiAccountsList() {
  const [accounts, setAccounts] = useState<WiFiAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.wifiAccounts.list()
      .then(setAccounts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Chargement...</div>

  return (
    <ul>
      {accounts.map(account => (
        <li key={account.id}>{account.username}</li>
      ))}
    </ul>
  )
}

// Alternative : Hook personnalisé
import { useApi } from '@/hooks/useApi'

function WiFiAccountsList() {
  const { data: accounts, loading, error, refetch } = useApi<WiFiAccount[]>('/wifi-accounts')

  if (loading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error.message}</div>

  return (
    <ul>
      {accounts?.map(account => (
        <li key={account.id}>{account.username}</li>
      ))}
    </ul>
  )
}
```

### Dashboard - Statistiques

Le composant Dashboard utilise déjà :

```typescript
import { dashboardService } from '@/services/api'

const stats = await dashboardService.getStats()
const charts = await dashboardService.getCharts(7)
```

---

## 🔄 Variables d'environnement Next.js

### `.env.local` (Next.js)

```env
# URL du backend API
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Pour la production
# NEXT_PUBLIC_API_URL=https://votre-backend.railway.app/api
```

### Utilisation dans le code

```typescript
// lib/api.ts ou services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
```

---

## 🛡️ Protection des routes

### Middleware Next.js (App Router)

Le fichier `middleware.ts` est déjà créé et configure la protection des routes.

**Note :** Pour une protection complète côté serveur, utilisez des cookies avec httpOnly. Actuellement, la protection se fait côté client via `PrivateRoute` component.

### Composant PrivateRoute

```typescript
// components/PrivateRoute.tsx (déjà implémenté)
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Chargement...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

**Usage :**
```typescript
// app/page.tsx
import PrivateRoute from '@/components/PrivateRoute'

export default function Home() {
  return (
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  )
}
```

---

## 📦 Types TypeScript

Tous les types sont centralisés dans `types/api.ts` :

```typescript
import type { 
  User, 
  WiFiAccount, 
  Payment, 
  DashboardStats,
  LoginResponse 
} from '@/types/api'
```

**Types disponibles :**
- `User`
- `WiFiAccount`
- `Payment`
- `Session`
- `ActiveUser`
- `DashboardStats`
- `LoginResponse`
- `BandwidthUsage`
- `BandwidthStats`
- `SessionStatistics`
- `ChartData`

---

## 🎨 Hook personnalisé pour les appels API

### Hook useApi

```typescript
// hooks/useApi.ts (déjà créé)
import { useApi } from '@/hooks/useApi'

function WiFiAccountsList() {
  const { data, loading, error, refetch } = useApi<WiFiAccount[]>('/wifi-accounts')

  // ...
}
```

### Hook useApiMutation

```typescript
// Pour les mutations (POST, PUT, DELETE)
import { useApiMutation } from '@/hooks/useApi'

function CreateAccount() {
  const { mutate, loading, error } = useApiMutation<WiFiAccount>()

  const handleCreate = async () => {
    try {
      const account = await mutate('/wifi-accounts', 'POST', {
        duration: '24h',
        bandwidthProfile: '2mbps',
      })
      console.log('Compte créé:', account)
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? 'Création...' : 'Créer'}
    </button>
  )
}
```

---

## 🔄 Gestion des erreurs

La gestion des erreurs est améliorée dans `lib/api.ts` :

- ✅ 401 → Redirection automatique vers `/login`
- ✅ 403 → Message "Accès refusé"
- ✅ 404 → Message "Ressource non trouvée"
- ✅ Autres erreurs → Message personnalisé ou générique
- ✅ Erreurs réseau → Message de connexion

---

## 📱 Exemple complet : Page de login

La page de login existe déjà dans `app/login/page.tsx` et utilise :

```typescript
const { login } = useAuth()
await login(email, password)
// Redirection automatique après succès
```

---

## 🚀 Déploiement

### Variables d'environnement production

**Backend (Railway) :**
```env
FRONTEND_URL=https://votre-frontend.vercel.app
```

**Frontend (Vercel) :**
```env
NEXT_PUBLIC_API_URL=https://votre-backend.railway.app/api
```

### Vérification CORS

Si vous avez des erreurs CORS en production :

1. Vérifier que `FRONTEND_URL` dans le backend correspond exactement à l'URL du frontend
2. Vérifier que les deux sont en HTTPS en production
3. Vérifier les headers dans la console du navigateur

---

## 📚 Documentation API

Tous les endpoints sont documentés dans Swagger :

**Développement :** `http://localhost:4000/api`  
**Production :** `https://votre-backend.railway.app/api`

---

## ✅ Checklist d'intégration

- [x] Variables d'environnement configurées (`NEXT_PUBLIC_API_URL`)
- [x] Fonction `apiRequest` créée (`lib/api.ts`)
- [x] Gestion du token (localStorage via `lib/auth.ts`)
- [x] Middleware de protection des routes (`middleware.ts`)
- [x] Types TypeScript créés (`types/api.ts`)
- [x] Gestion des erreurs implémentée (`lib/api.ts`)
- [x] Page de login fonctionnelle (`app/login/page.tsx`)
- [x] Service API avec Axios (`services/api.ts`)
- [x] Hook personnalisé `useApi` (`hooks/useApi.ts`)
- [ ] Test de connexion au backend
- [ ] CORS configuré correctement (backend)

---

## 📝 Fichiers créés

```
lib/
├── auth.ts           # Gestion du token (localStorage/cookies)
├── api.ts            # Fonction apiRequest avec fetch (basique)
└── api-client.ts     # Client API réutilisable complet (recommandé)

services/
└── api.ts            # Services Axios (compatible existant)

hooks/
└── useApi.ts         # Hook personnalisé pour appels API

types/
└── api.ts            # Tous les types TypeScript

middleware.ts         # Protection des routes
```

## 🎯 Client API Réutilisable (Recommandé)

Le client API dans `lib/api-client.ts` offre une interface complète et organisée :

```typescript
import { apiClient } from '@/lib/api-client'

// Authentification
await apiClient.auth.login({ email, password })
await apiClient.auth.getProfile()
apiClient.auth.logout()

// Comptes Wi-Fi
await apiClient.wifiAccounts.list()
await apiClient.wifiAccounts.create({ duration: '24h', bandwidthProfile: '2mbps' })
await apiClient.wifiAccounts.delete(id)

// Paiements
await apiClient.payments.list()
await apiClient.payments.create({ amount: 1000, method: 'mobile_money' })
await apiClient.payments.complete(id, { transactionId: 'xxx' })

// Sessions
await apiClient.sessions.list()
await apiClient.sessions.getStatistics()
await apiClient.sessions.sync()

// Dashboard
await apiClient.dashboard.getStats()
await apiClient.dashboard.getCharts(7)

// MikroTik
await apiClient.mikrotik.getStatus()
await apiClient.mikrotik.getActiveUsers()
await apiClient.mikrotik.disconnectUser(sessionId)

// Bande passante
await apiClient.bandwidth.getRealtime()
await apiClient.bandwidth.getStats()
await apiClient.bandwidth.getUserBandwidth(username)

// Utilisateurs système
await apiClient.users.list()
await apiClient.users.create({ email, firstName, lastName, role })
await apiClient.users.update(id, { isActive: true })
```

---

**Dernière mise à jour :** 2024-01-19
