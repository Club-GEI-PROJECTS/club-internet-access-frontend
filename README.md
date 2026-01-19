# 🌐 Club Internet Access - Frontend

Interface web Next.js pour la gestion d'accès Wi-Fi MikroTik.

## 🚀 Déploiement sur Vercel

### Configuration Automatique

Ce projet est configuré pour Vercel avec:
- ✅ Next.js 14 avec App Router
- ✅ Configuration TypeScript
- ✅ TailwindCSS intégré
- ✅ Variables d'environnement configurées

### Étapes de Déploiement

1. **Créer un projet sur Vercel**
   - Allez sur https://vercel.com
   - Connectez votre compte GitHub
   - Importez ce repository

2. **Configurer les Variables d'Environnement**
   - Dans Vercel Dashboard → Settings → Environment Variables
   - Ajoutez: `NEXT_PUBLIC_API_URL=https://votre-backend.railway.app/api`
   - Remplacez `votre-backend.railway.app` par l'URL réelle de votre backend

3. **Déployer**
   - Vercel détectera automatiquement Next.js
   - Le build se fera automatiquement
   - L'application sera accessible sur l'URL générée par Vercel

**C'est tout !** Vercel gère automatiquement les builds et déploiements.

## 📦 Développement Local

### Prérequis

- Node.js >= 18
- npm ou yarn

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

### Build

```bash
npm run build
```

Les fichiers buildés seront dans le dossier `.next/`

### Production Locale

```bash
npm run start
```

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

- `NEXT_PUBLIC_API_URL`: URL de l'API backend (défaut: `/api` pour le proxy)

### Fichiers Importants

- `next.config.js`: Configuration Next.js avec rewrites pour l'API
- `app/layout.tsx`: Layout principal de l'application
- `services/api.ts`: Service API avec configuration de base URL
- `components/`: Composants réutilisables
- `contexts/`: Contextes React (Auth, etc.)

## 🏗️ Architecture

```
app/
├── layout.tsx          # Layout principal
├── page.tsx            # Page d'accueil (Dashboard)
├── login/
│   └── page.tsx        # Page de connexion
├── wifi-accounts/
│   └── page.tsx        # Gestion des comptes Wi-Fi
├── payments/
│   └── page.tsx        # Gestion des paiements
├── sessions/
│   └── page.tsx        # Sessions actives
├── bandwidth/
│   └── page.tsx        # Analyse de bande passante
└── users/
    └── page.tsx        # Gestion des utilisateurs

components/
├── Layout.tsx          # Layout avec sidebar
├── PrivateRoute.tsx    # Protection des routes
└── Dashboard.tsx       # Composant Dashboard

contexts/
└── AuthContext.tsx     # Context d'authentification

services/
└── api.ts              # Services API
```

## 🔗 Backend

Le backend est dans un repository séparé: `club-internet-access-backend`

## 📚 Technologies

- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Axios
- Recharts (Graphiques)
- React Hot Toast (Notifications)
- Lucide React (Icônes)

## 📝 License

Propriétaire - UNIKIN
