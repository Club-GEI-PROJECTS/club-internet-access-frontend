# 🌐 Club Internet Access - Frontend

Interface web React pour la gestion d'accès Wi-Fi MikroTik.

## 🚀 Déploiement sur Railway

### Configuration Automatique

Ce projet est configuré pour Railway avec:
- ✅ `Dockerfile` pour la production
- ✅ `railway.json` pour la configuration automatique
- ✅ `nginx.conf` pour servir les fichiers statiques

### Étapes de Déploiement

1. **Créer un projet Railway**
   - Allez sur https://railway.app
   - Créez un nouveau projet
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez ce repository

2. **Configurer la Variable d'Environnement**
   - Railway Dashboard → Service → Variables
   - Ajoutez: `VITE_API_URL=https://votre-backend.railway.app/api`
   - Remplacez `votre-backend.railway.app` par l'URL réelle de votre backend

3. **Déployer**
   - Railway déploiera automatiquement
   - Le build utilisera le Dockerfile
   - L'application sera accessible sur l'URL générée par Railway

**C'est tout !** Pas besoin de configurer le Root Directory car tout est à la racine.

## 📦 Développement Local

### Option 1 : Avec Docker (Recommandé)

#### Prérequis
- Docker et Docker Compose installés

#### Démarrage rapide

```bash
# Démarrer le conteneur de développement avec hot reload
docker-compose up

# Ou en arrière-plan
docker-compose up -d
```

L'application sera accessible sur http://localhost:3000

Le hot reload est activé, vos modifications seront automatiquement reflétées.

#### Arrêter le conteneur

```bash
docker-compose down
```

#### Variables d'environnement pour Docker

Créez un fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:4000/api
```

### Option 2 : Sans Docker

#### Prérequis

- Node.js >= 18
- npm ou yarn

#### Installation

```bash
npm install
```

#### Développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

#### Build

```bash
npm run build
```

Les fichiers buildés seront dans le dossier `dist/`

#### Preview (Production Locale)

```bash
npm run preview
```

## 🐳 Docker Production Locale

Pour tester la version de production localement avec Docker :

```bash
# Build et démarrer en production
docker-compose -f docker-compose.prod.yml up --build

# Ou en arrière-plan
docker-compose -f docker-compose.prod.yml up -d --build
```

L'application sera accessible sur http://localhost:80

**Note** : Assurez-vous que la variable d'environnement `VITE_API_URL` est définie dans un fichier `.env` ou via `export VITE_API_URL=...`

## 🔧 Configuration

### Variables d'Environnement

- `VITE_API_URL`: URL de l'API backend (défaut: `/api` pour le proxy local)

### Fichiers Importants

- `vite.config.ts`: Configuration Vite
- `src/services/api.ts`: Service API avec configuration de base URL
- `nginx.conf`: Configuration Nginx pour la production
- `Dockerfile`: Dockerfile pour la production
- `Dockerfile.dev`: Dockerfile pour le développement local
- `docker-compose.yml`: Configuration Docker Compose pour le développement
- `docker-compose.prod.yml`: Configuration Docker Compose pour la production locale

## 🏗️ Architecture

```
src/
├── components/     # Composants réutilisables
├── pages/          # Pages de l'application
├── services/       # Services API
├── contexts/       # Contextes React
└── App.tsx         # Composant principal
```

## 🔗 Backend

Le backend est dans un repository séparé: `club-internet-access-backend`

## 📚 Technologies

- React 18
- TypeScript
- Vite
- TailwindCSS
- Axios
- React Router

## 📝 License

Propriétaire - UNIKIN
