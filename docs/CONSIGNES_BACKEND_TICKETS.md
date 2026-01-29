# 📋 Consignes Backend - Vente de Tickets Pré-générés

## 🎯 Objectif

Adapter le backend pour gérer la **vente de tickets pré-générés depuis Mikhmon** au lieu de créer directement des utilisateurs MikroTik.

---

## 📊 Structure des Tickets (basée sur Mikhmon)

Un ticket pré-généré depuis Mikhmon a la structure suivante :

```csv
Username,Password,Profile,Time Limit,Data Limit,Comment
dzpv,3552,TEST,,,2026-01-27 22:52:37
```

### Champs importants :

- **Username** : Nom d'utilisateur unique
- **Password** : Mot de passe du ticket
- **Profile** : Profil MikroTik (ex: TEST, BASIC, PREMIUM)
- **Time Limit** : Limite de temps (vide = illimité, ou format "1d", "24h", etc.)
- **Data Limit** : Limite de données (vide = illimité, ou format "1GB", "500MB", etc.)
- **Comment** : Timestamp de création depuis Mikhmon (optionnel)

---

## 🗄️ Modèle de Données Backend

### Table `ticket_types` (nouveau)

```typescript
interface TicketType {
  id: string                    // UUID
  name: string                  // Nom du type (ex: "Forfait Basique")
  profile: string               // Profil MikroTik (ex: TEST, BASIC, PREMIUM)
  description: string           // Description du forfait
  timeLimit?: string           // Format: "1d", "24h", null si illimité
  dataLimit?: string           // Format: "1GB", "500MB", null si illimité
  price: number                // Prix de vente en CDF
  isActive: boolean            // Si le type est actif
  availableCount: number       // Nombre de tickets disponibles (calculé)
  createdAt: Date
  updatedAt: Date
}
```

### Table `tickets`

```typescript
interface Ticket {
  id: string                    // UUID
  username: string              // Nom d'utilisateur (unique)
  password: string              // Mot de passe (chiffré dans la DB)
  profile: string              // Profil MikroTik
  timeLimit?: string           // Format: "1d", "24h", null si illimité
  dataLimit?: string           // Format: "1GB", "500MB", null si illimité
  comment?: string             // Timestamp depuis Mikhmon
  status: TicketStatus         // 'available' | 'reserved' | 'sold' | 'expired'
  price: number                // Prix de vente en CDF
  soldAt?: Date               // Date de vente
  soldTo?: string             // Email ou téléphone de l'acheteur
  paymentId?: string           // ID du paiement associé
  createdAt: Date
  updatedAt: Date
}
```

### Énumérations

```typescript
enum TicketStatus {
  AVAILABLE = 'available',    // Disponible à la vente
  RESERVED = 'reserved',      // Réservé temporairement (pendant le paiement)
  SOLD = 'sold',              // Vendu
  EXPIRED = 'expired',        // Expiré (si applicable)
}
```

---

## 🔌 Endpoints API Requis

### 1. **GET /api/tickets**

Liste tous les tickets (avec filtres optionnels).

**Query Parameters :**
- `status` (optionnel) : Filtrer par statut (`available`, `sold`, etc.)

**Réponse :**
```json
[
  {
    "id": "uuid",
    "username": "dzpv",
    "password": "***",  // Ne pas exposer le mot de passe dans la liste
    "profile": "TEST",
    "timeLimit": null,
    "dataLimit": null,
    "comment": "2026-01-27 22:52:37",
    "status": "available",
    "price": 5000,
    "createdAt": "2026-01-27T22:52:37Z",
    "updatedAt": "2026-01-27T22:52:37Z"
  }
]
```

---

### 2. **GET /api/tickets/available**

Liste uniquement les tickets disponibles à la vente.

**Réponse :** Même format que `/api/tickets` mais filtré sur `status: 'available'`

---

### 3. **GET /api/tickets/types**

Liste tous les types de tickets disponibles avec leur nombre de tickets disponibles.

**Réponse :**
```json
[
  {
    "id": "uuid",
    "name": "Forfait Basique",
    "profile": "BASIC",
    "description": "Accès Wi-Fi basique pour 24h",
    "timeLimit": "24h",
    "dataLimit": "1GB",
    "price": 10000,
    "isActive": true,
    "availableCount": 15,
    "createdAt": "2026-01-27T22:52:37Z",
    "updatedAt": "2026-01-27T22:52:37Z"
  }
]
```

---

### 4. **GET /api/tickets/type/:typeId**

Liste tous les tickets disponibles d'un type spécifique.

**Réponse :** Même format que `/api/tickets/available` mais filtré par type

---

### 5. **GET /api/tickets/:id**

Récupère un ticket spécifique.

**Réponse :**
```json
{
  "id": "uuid",
  "username": "dzpv",
  "password": "***",  // Ne pas exposer avant achat
  "profile": "TEST",
  "timeLimit": null,
  "dataLimit": null,
  "comment": "2026-01-27 22:52:37",
  "status": "available",
  "price": 5000,
  "createdAt": "2026-01-27T22:52:37Z",
  "updatedAt": "2026-01-27T22:52:37Z"
}
```

---

### 6. **POST /api/tickets/purchase**

Achète un ticket (publique, pas besoin d'authentification).

**Body :**
```json
{
  "ticketId": "uuid",
  "phoneNumber": "+243900000000",
  "method": "mobile_money"
}
```

**Flow :**
1. Vérifier que le ticket existe et est `available`
2. Créer un paiement avec statut `pending`
3. Réserver le ticket (`status: 'reserved'`)
4. Retourner les credentials (username + password) + infos de paiement

**Réponse :**
```json
{
  "ticket": {
    "id": "uuid",
    "username": "dzpv",
    "password": "3552",  // Exposer le mot de passe après achat
    "profile": "TEST",
    "status": "reserved",
    "price": 5000
  },
  "payment": {
    "id": "payment-uuid",
    "amount": 5000,
    "method": "mobile_money",
    "status": "pending",
    "transactionId": null,
    "phoneNumber": "+243900000000",
    "ticketId": "uuid",
    "createdAt": "2026-01-27T23:00:00Z"
  },
  "credentials": {
    "username": "dzpv",
    "password": "3552",
    "profile": "TEST",
    "instructions": "Connectez-vous au Wi-Fi 'Club Internet Access' et utilisez ces identifiants pour vous authentifier."
  }
}
```

**Erreurs possibles :**
- `404` : Ticket non trouvé
- `400` : Ticket déjà vendu ou réservé
- `400` : Numéro de téléphone invalide

---

### 7. **POST /api/tickets/:id/reserve**

Réserve un ticket temporairement (optionnel, pour éviter les conflits).

**Réponse :**
```json
{
  "id": "uuid",
  "status": "reserved",
  "updatedAt": "2026-01-27T23:00:00Z"
}
```

---

### 8. **POST /api/tickets/:id/release**

Libère un ticket réservé (si le paiement échoue).

**Réponse :**
```json
{
  "id": "uuid",
  "status": "available",
  "updatedAt": "2026-01-27T23:00:00Z"
}
```

---

## 💰 Intégration avec le Système de Paiement

### Flow de Paiement Mobile Money

1. **Création du paiement** (dans `/api/tickets/purchase`)
   - Créer un `Payment` avec `status: 'pending'`
   - Lier le paiement au ticket via `paymentId` dans le ticket

2. **Webhook Mobile Money** (à implémenter)
   - Quand le paiement est confirmé, mettre à jour :
     - `Payment.status = 'completed'`
     - `Ticket.status = 'sold'`
     - `Ticket.soldAt = now()`
     - `Ticket.soldTo = phoneNumber`

3. **Si le paiement échoue**
   - Mettre à jour `Payment.status = 'failed'`
   - Libérer le ticket : `Ticket.status = 'available'`

---

## 📥 Importation depuis Mikhmon

### Import CSV (OBLIGATOIRE)

Créer un endpoint **admin** pour importer un fichier CSV :

**POST /api/admin/tickets/import** (authentification admin requise)

**Headers :**
- `Authorization: Bearer <token>` (token admin)
- `Content-Type: multipart/form-data`

**Body :** Fichier CSV (multipart/form-data, champ `file`)

**Body :** Fichier CSV (multipart/form-data)

**Format CSV attendu :**
```csv
Username,Password,Profile,Time Limit,Data Limit,Comment
dzpv,3552,TEST,,,2026-01-27 22:52:37
user2,pass2,BASIC,24h,1GB,2026-01-27 22:52:37
```

**Traitement :**
1. Parser le CSV
2. Pour chaque ligne :
   - Créer un ticket avec `status: 'available'`
   - Définir un `price` par défaut selon le `profile`
   - Stocker le `comment` (timestamp Mikhmon)

**Réponse :**
```json
{
  "imported": 10,
  "failed": 0,
  "errors": []
}
```

---

### Option 2 : API Mikhmon (si disponible)

Si Mikhmon expose une API, créer un service pour synchroniser :

**POST /api/admin/tickets/sync-mikhmon** (authentification admin requise)

**Traitement :**
1. Appeler l'API Mikhmon pour récupérer les tickets
2. Comparer avec la base de données
3. Créer les nouveaux tickets
4. Marquer comme `expired` les tickets qui n'existent plus dans Mikhmon

---

## 🔐 Sécurité

### Protection des Mots de Passe

- **Dans la base de données** : Chiffrer les mots de passe avec bcrypt ou argon2
- **Dans les réponses API** :
  - Ne jamais exposer le mot de passe dans `/api/tickets` (liste)
  - Exposer uniquement après achat réussi dans `/api/tickets/purchase`

### Validation

- **Username** : Unique, format valide (alphanumérique, tirets, underscores)
- **Password** : Minimum 4 caractères
- **Phone Number** : Format congolais (`+243900000000` ou `0900000000`)
- **Price** : Doit être positif

---

## 📝 Modifications à Apporter au Modèle Payment

Ajouter un champ `ticketId` au modèle `Payment` :

```typescript
interface Payment {
  // ... champs existants
  ticketId?: string        // ID du ticket associé
  ticket?: Ticket         // Relation (optionnel)
}
```

---

## 🧪 Tests à Prévoir

1. **Import CSV** : Tester avec un fichier CSV valide
2. **Achat de ticket** : Vérifier que le ticket passe de `available` à `reserved` puis `sold`
3. **Paiement échoué** : Vérifier que le ticket redevient `available`
4. **Concurrence** : Deux utilisateurs tentent d'acheter le même ticket simultanément
5. **Validation** : Tester les formats de numéro de téléphone

---

## 🚀 Endpoints Admin (optionnels)

### GET /api/admin/tickets/stats

Statistiques sur les tickets :
```json
{
  "total": 100,
  "available": 50,
  "sold": 45,
  "reserved": 5,
  "revenue": 225000
}
```

### PUT /api/admin/tickets/:id/price

Modifier le prix d'un ticket.

### DELETE /api/admin/tickets/:id

Supprimer un ticket (si jamais nécessaire).

---

## 📌 Notes Importantes

1. **Pas de contact direct avec MikroTik** : Les tickets sont déjà créés dans Mikhmon, donc pas besoin de créer des utilisateurs MikroTik depuis le backend.

2. **Prix par défaut** : Définir des prix par défaut selon le profil :
   - `TEST` : 5000 CDF
   - `BASIC` : 10000 CDF
   - `PREMIUM` : 20000 CDF
   (À adapter selon vos besoins)

3. **Expiration** : Si un ticket a une `timeLimit`, vérifier périodiquement et marquer comme `expired` si nécessaire.

4. **Logs** : Logger toutes les transactions de vente pour audit.

---

## ✅ Checklist d'Implémentation

- [ ] Créer le modèle `Ticket` dans la base de données
- [ ] Créer les migrations nécessaires
- [ ] Implémenter `GET /api/tickets`
- [ ] Implémenter `GET /api/tickets/available`
- [ ] Implémenter `GET /api/tickets/:id`
- [ ] Implémenter `POST /api/tickets/purchase`
- [ ] Implémenter `POST /api/tickets/:id/reserve`
- [ ] Implémenter `POST /api/tickets/:id/release`
- [ ] Créer l'endpoint d'import CSV (`POST /api/admin/tickets/import`)
- [ ] Modifier le modèle `Payment` pour ajouter `ticketId`
- [ ] Intégrer avec le webhook Mobile Money
- [ ] Ajouter la validation des données
- [ ] Chiffrer les mots de passe dans la DB
- [ ] Créer les tests unitaires
- [ ] Créer les tests d'intégration
- [ ] Documenter l'API (Swagger/OpenAPI)

---

## 📞 Support

Pour toute question, référez-vous à ce document ou contactez l'équipe de développement.
