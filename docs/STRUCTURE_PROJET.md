# 📁 Structure et logique du projet Club Internet Access

Ce document décrit comment le projet est constitué, ses fonctionnalités et sa logique globale.

---

## 🎯 Objectif du projet

**Club Internet Access** est une application web de **vente de tickets Wi-Fi** pour l’Université de Kinshasa (UNIKIN). Elle permet :

1. **Au public** : acheter des tickets Wi-Fi pré-générés (sans compte).
2. **À l’admin** : importer des tickets depuis Mikhmon (CSV) et gérer le système.
3. **Aux utilisateurs connectés** : accéder à un dashboard selon leur rôle (admin, agent, étudiant).

Le site ne fait **pas** office de portail captif : c’est un **portail de vente directe**. Les tickets sont créés dans Mikhmon, importés en base, puis vendus via l’application.

---

## 🏗️ Architecture technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styles** : TailwindCSS
- **État / Auth** : React Context (AuthContext)
- **API** : `lib/api-client.ts` (fetch) + `services/api.ts` (Axios)
- **UI** : Lucide React (icônes), React Hot Toast (notifications), Recharts (graphiques)

---

## 📂 Structure des dossiers

```
club-internet-access-frontend/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx            # Point d’entrée : redirige /home ou /dashboard
│   ├── layout.tsx          # Layout global (AuthProvider, Toaster)
│   ├── globals.css         # Styles globaux
│   ├── home/               # Page d’accueil publique (types de tickets)
│   ├── buy-ticket/         # Page d’achat de tickets (publique)
│   ├── login/              # Connexion
│   ├── forgot-password/     # Mot de passe oublié
│   ├── reset-password/      # Réinitialisation mot de passe
│   ├── dashboard/          # Dashboard protégé (par rôle)
│   ├── admin/tickets/       # Gestion des tickets (admin) – upload CSV
│   ├── wifi-accounts/      # Comptes Wi-Fi
│   ├── payments/           # Paiements
│   ├── sessions/           # Sessions actives
│   ├── bandwidth/          # Bande passante
│   ├── users/              # Utilisateurs (admin)
│   └── captive/            # Page tampon (optionnelle, peu utilisée)
├── components/             # Composants React réutilisables
│   ├── Layout.tsx          # Layout avec sidebar (navigation par rôle)
│   ├── PrivateRoute.tsx    # Protection des routes (redirige vers /login si non connecté)
│   ├── Dashboard.tsx       # Aiguilleur vers DashboardAdmin / Agent / Student
│   ├── DashboardAdmin.tsx  # Dashboard admin (stats, graphiques)
│   ├── DashboardAgent.tsx  # Dashboard agent
│   ├── DashboardStudent.tsx# Dashboard étudiant
│   ├── Login.tsx           # Formulaire de connexion
│   ├── TicketManagement.tsx# Import CSV des tickets (admin)
│   ├── WiFiAccounts.tsx    # Liste / création comptes Wi-Fi
│   ├── Payments.tsx        # Liste / création paiements
│   ├── Sessions.tsx        # Sessions
│   ├── Bandwidth.tsx       # Bande passante
│   ├── Users.tsx           # Gestion utilisateurs
│   └── ...
├── contexts/
│   └── AuthContext.tsx     # État global : user, token, login, logout
├── lib/
│   ├── api-client.ts       # Client API principal (tickets, auth, admin, etc.)
│   ├── api.ts              # Utilitaires API
│   └── auth.ts             # Stockage token (localStorage + cookies)
├── services/
│   └── api.ts              # Services Axios (auth, wifi, payments, etc.)
├── types/
│   └── api.ts              # Types partagés (User, Ticket, Payment, etc.)
├── hooks/
│   └── useApi.ts           # Hook personnalisé API
├── middleware.ts           # Routes publiques / protégées, redirection HTTPS
└── docs/                   # Documentation (dont CONSIGNES_BACKEND_TICKETS.md)
```

---

## 🔀 Logique de navigation et des routes

### 1. Point d’entrée (`/`)

- **Non connecté** → redirection vers **`/home`** (page publique).
- **Connecté** → redirection vers **`/dashboard`** (dashboard selon le rôle).

### 2. Routes publiques (sans authentification)

| Route | Rôle | Description |
|-------|------|-------------|
| `/home` | Public | Liste des **types de tickets** disponibles (nom, prix, durée, données). Clic → `/buy-ticket?type=xxx`. |
| `/buy-ticket` | Public | Achat d’un ticket : choix du ticket (éventuellement filtré par type), numéro Mobile Money, affichage des identifiants après achat. |
| `/login` | Public | Connexion (email / mot de passe). |
| `/forgot-password` | Public | Demande de réinitialisation du mot de passe. |
| `/reset-password` | Public | Réinitialisation avec token. |

### 3. Routes protégées (authentification requise)

Toutes les autres routes sont protégées par **PrivateRoute** : si pas de token / user, redirection vers `/login`.

| Route | Rôles | Description |
|-------|--------|-------------|
| `/dashboard` | Tous | Dashboard différent selon le rôle (Admin, Agent, Étudiant). |
| `/admin/tickets` | Admin | **Import CSV** de tickets depuis Mikhmon (zone glisser-déposer, template, résultats d’import). |
| `/wifi-accounts` | Tous | Liste / création de comptes Wi-Fi. |
| `/payments` | Tous | Liste / création de paiements. |
| `/sessions` | Admin / Agent | Sessions actives. |
| `/bandwidth` | Admin | Statistiques de bande passante. |
| `/users` | Admin | Gestion des utilisateurs. |

### 4. Rôles et menus (Layout)

- **Admin** : Dashboard, Tickets, Comptes Wi-Fi, Paiements, Sessions, Bande Passante, Utilisateurs.
- **Agent** : Dashboard, Comptes Wi-Fi, Paiements.
- **Étudiant** : Dashboard, Mes Connexions, Mes Paiements.

---

## 🔐 Authentification et sécurité

- **AuthContext** : stocke `user`, `token`, `login`, `logout`, `loading`. Au chargement, si un token existe (cookie ou localStorage), appel à `getProfile` pour récupérer l’utilisateur.
- **Token** : conservé dans un cookie et dans localStorage (voir `lib/auth.ts`).
- **PrivateRoute** : affiche les enfants seulement si `user` existe ; sinon redirige vers `/login`.
- **Middleware** :  
  - Routes publiques : pas de redirection.  
  - Routes protégées : en production, redirection vers **HTTPS** si la requête est en HTTP.

---

## 🎫 Fonctionnalités « tickets » (cœur métier)

### Côté public

1. **`/home`**  
   - Appel à `apiClient.tickets.getTypes()` pour lister les **types de tickets** (nom, profil, description, durée, données, prix, `availableCount`).  
   - Affichage en cartes ; clic sur un type → `/buy-ticket?type=xxx`.

2. **`/buy-ticket`**  
   - Si `?type=xxx` : chargement du type + tickets disponibles de ce type (`getTypes` + `getByType`).  
   - Sinon : tous les tickets disponibles (`getAvailable`).  
   - L’utilisateur choisit un ticket, saisit son numéro Mobile Money, puis appelle `apiClient.tickets.purchase({ ticketId, phoneNumber, method })`.  
   - Après succès : affichage des **identifiants** (username, password, profil, instructions) et boutons pour copier / acheter un autre ticket.

### Côté admin

3. **`/admin/tickets` (TicketManagement)**  
   - **Import CSV** : glisser-déposer ou sélection de fichier.  
   - Appel à `apiClient.admin.tickets.import(file)` (multipart/form-data).  
   - Affichage du résultat : nombre importés, échoués, liste d’erreurs.  
   - Téléchargement d’un **template CSV** (colonnes : Username, Password, Profile, Time Limit, Data Limit, Comment).

La logique métier est donc : **pas de création de comptes MikroTik côté app** ; les tickets sont **pré-générés dans Mikhmon**, exportés en CSV, importés par l’admin, puis **vendus** via `/buy-ticket`.

---

## 📡 Couche API (client)

Le fichier **`lib/api-client.ts`** centralise les appels backend :

- **Auth** : login, register, getProfile, forgotPassword, resetPassword.
- **Tickets** : list, getAvailable, getTypes, getByType, getById, purchase, reserve, release.
- **Admin** : tickets.import, tickets.list, tickets.getStats.
- **WiFi accounts** : list, getActive, getById, create, delete.
- **Payments** : list, getById, getByTransactionId, create, complete, updateStatus.
- **Sessions** : list, getActive, getStatistics, sync, getByWiFiAccount, getById.
- **Dashboard** : getStats, getCharts.
- **MikroTik** : status, createUser, listUsers, getUser, deleteUser, getActiveUsers, etc.
- **Bandwidth** : getRealtime, getStats, getUserBandwidth, getHistory.
- **Users** : list, getById, create, update, delete.

Les types utilisés (User, Ticket, TicketType, Payment, etc.) sont dans **`types/api.ts`** et doivent rester alignés avec le backend.

---

## 📄 Types principaux (résumé)

- **User** : id, email, firstName, lastName, role (admin | agent | student), etc.
- **Ticket** : id, username, password, profile, timeLimit, dataLimit, comment, status (available | reserved | sold | expired), price, soldAt, soldTo, paymentId.
- **TicketType** : id, name, profile, description, timeLimit, dataLimit, price, isActive, availableCount.
- **Payment** : id, amount, method, status, transactionId, phoneNumber, wifiAccountId, ticketId, etc.

---

## 🔄 Flux résumés

### Achat d’un ticket (visiteur)

1. Visite **`/`** → redirection **`/home`**.  
2. Sur **`/home`**, choix d’un type de ticket → **`/buy-ticket?type=xxx`**.  
3. Sur **`/buy-ticket`** : choix d’un ticket, saisie du numéro Mobile Money, clic « Acheter ».  
4. Appel **POST /api/tickets/purchase** (côté backend).  
5. Affichage des identifiants Wi-Fi (username, password, instructions).  
6. L’utilisateur se connecte au Wi-Fi avec ces identifiants (hors de l’app).

### Import de tickets (admin)

1. Connexion en tant qu’admin → **`/dashboard`**.  
2. Menu **Tickets** → **`/admin/tickets`**.  
3. Glisser-déposer ou sélection d’un **CSV** (format Mikhmon).  
4. Appel **POST /api/admin/tickets/import**.  
5. Affichage du résultat (importés, échoués, erreurs). Les tickets importés deviennent disponibles à la vente sur **`/home`** et **`/buy-ticket`**.

### Connexion et usage du dashboard

1. **`/login`** → saisie email / mot de passe → `AuthContext.login` → token et user stockés.  
2. Redirection vers **`/dashboard`**.  
3. **Dashboard** affiche le composant selon le rôle (Admin / Agent / Student).  
4. **Layout** affiche le menu adapté au rôle (Tickets visible uniquement pour l’admin).

---

## 📌 Fichiers clés à retenir

| Fichier | Rôle |
|---------|------|
| `app/page.tsx` | Redirection `/` → `/home` ou `/dashboard`. |
| `app/home/page.tsx` | Page d’accueil publique : types de tickets. |
| `app/buy-ticket/page.tsx` | Page d’achat publique : sélection ticket + paiement + identifiants. |
| `app/admin/tickets/page.tsx` | Page admin : import CSV des tickets. |
| `components/TicketManagement.tsx` | Composant d’import CSV (upload, template, résultats). |
| `components/Layout.tsx` | Sidebar et navigation selon le rôle. |
| `components/PrivateRoute.tsx` | Protection des routes par authentification. |
| `contexts/AuthContext.tsx` | État global d’authentification. |
| `lib/api-client.ts` | Tous les appels API (tickets, auth, admin, etc.). |
| `types/api.ts` | Types partagés avec le backend. |
| `middleware.ts` | Routes publiques vs protégées et passage en HTTPS. |
| `docs/CONSIGNES_BACKEND_TICKETS.md` | Spécifications backend (endpoints, modèles, import CSV). |

---

## 🚀 En résumé

Le projet est une **application de vente de tickets Wi-Fi** en Next.js 14 :

- **Public** : voir les types de tickets (`/home`), acheter un ticket (`/buy-ticket`), obtenir les identifiants après paiement.
- **Admin** : importer des tickets en CSV depuis Mikhmon (`/admin/tickets`), gérer comptes Wi-Fi, paiements, sessions, bande passante, utilisateurs.
- **Agents / Étudiants** : dashboards et menus limités à leur rôle.

La logique repose sur des **tickets pré-générés** (Mikhmon → CSV → import admin → vente), **sans création directe d’utilisateurs MikroTik** par l’application. Le backend doit exposer les endpoints décrits dans **`docs/CONSIGNES_BACKEND_TICKETS.md`** pour que tout fonctionne correctement.
