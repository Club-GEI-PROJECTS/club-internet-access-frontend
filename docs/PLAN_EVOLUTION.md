# 🚀 PLAN D'ÉVOLUTION - RB951 → RB4011

## Phase actuelle : Pilote (RB951)

### Configuration actuelle
- **Routeur** : MikroTik RB951Ui-2HnD
- **Ports** : 5x Ethernet (1 WAN + 4 LAN)
- **Wi-Fi** : Intégré (non utilisé, on utilise AP Cisco)
- **Débit max** : ~100 Mbps
- **Utilisateurs** : 10-20 simultanés

### Limitations
- Nombre de ports limité
- Débit limité pour croissance
- Pas de VLAN natifs
- CPU limité pour règles firewall complexes

---

## Phase 2 : Migration RB4011

### Nouveau matériel
- **Routeur** : MikroTik RB4011iGS+5HacQ2HnD-IN
- **Ports** : 10x Gigabit Ethernet
- **Wi-Fi** : Dual-band (5 GHz + 2.4 GHz)
- **Débit max** : 1 Gbps
- **Utilisateurs** : 100+ simultanés

### Avantages
- ✅ Ports supplémentaires
- ✅ Débit Gigabit
- ✅ Processeur plus puissant
- ✅ Wi-Fi intégré haute performance
- ✅ Gestion VLAN native
- ✅ QoS avancée

---

## Étapes de migration

### 1. Préparation

#### Sauvegarde RB951
```mikrotik
/export file=config_rb951_backup
/system backup save name=rb951_backup
```

#### Export configuration
- Export complet de la config actuelle
- Documenter toutes les IP
- Noter tous les profils utilisateurs

### 2. Configuration RB4011

#### Import de base
```mikrotik
/import file-name=config_rb951_backup
```

#### Adaptation interfaces
```mikrotik
/interface ethernet set [find name=ether1] name=WAN
/interface ethernet set [find name=ether2] name=LAN-1
/interface ethernet set [find name=ether3] name=LAN-2
/interface ethernet set [find name=ether4] name=LAN-3
/interface ethernet set [find name=ether5] name=LAN-4
```

#### Configuration VLAN (optionnel)
```mikrotik
# Interface VLAN pour Hotspot
/interface vlan add name=vlan-hotspot vlan-id=10 interface=LAN-1

# Interface VLAN pour Staff
/interface vlan add name=vlan-staff vlan-id=20 interface=LAN-2
```

### 3. Test en parallèle

#### Configuration temporaire
- Garder RB951 actif
- Configurer RB4011 avec IP différente (192.168.11.1)
- Tester toutes les fonctionnalités
- Valider les performances

### 4. Bascule

#### Plan de bascule
1. **Maintenance annoncée** : 30 minutes
2. **Dernière sauvegarde RB951**
3. **Déconnexion clients Wi-Fi** (notification)
4. **Remplacement physique** du routeur
5. **Réconfiguration finale** (si nécessaire)
6. **Tests immédiats**
7. **Réouverture du service**

### 5. Post-migration

#### Vérifications
- ✅ Tous les utilisateurs peuvent se connecter
- ✅ Paiements fonctionnent
- ✅ Portail captive accessible
- ✅ Internet accessible après paiement
- ✅ Déconnexion automatique OK
- ✅ Limites de bande passante respectées

---

## Configuration avancée RB4011

### VLAN Management

```mikrotik
# Bridge pour VLAN
/interface bridge add name=bridge-vlan protocol-mode=none

# Ajouter interfaces au bridge
/interface bridge port add bridge=bridge-vlan interface=LAN-1
/interface bridge port add bridge=bridge-vlan interface=LAN-2

# VLAN pour Hotspot
/interface vlan add name=vlan-hotspot vlan-id=10 interface=bridge-vlan
/ip address add address=192.168.10.1/24 interface=vlan-hotspot

# VLAN pour Staff
/interface vlan add name=vlan-staff vlan-id=20 interface=bridge-vlan
/ip address add address=192.168.20.1/24 interface=vlan-staff
```

### QoS Avancée

```mikrotik
# Queue pour prioriser certains utilisateurs
/queue simple add name=priority-traffic target=192.168.10.0/24 max-limit=50M/50M priority=1

# Queue pour limiter utilisateurs normaux
/queue simple add name=normal-traffic target=192.168.10.0/24 max-limit=10M/10M priority=8
```

### Load Balancing (si plusieurs connexions)

```mikrotik
# Si 2 connexions Starlink disponibles
/ip route add dst-address=0.0.0.0/0 gateway=192.168.1.1,192.168.1.2 check-gateway=ping
```

---

## Évolution future

### Phase 3 : Multi-site
- VPN entre sites
- Gestion centralisée des utilisateurs
- Synchronisation des configurations

### Phase 4 : Radius Server
- Authentification centralisée
- Base de données unifiée
- Gestion des droits avancée

### Phase 5 : Monitoring avancé
- The Dude (MikroTik)
- Monitoring bande passante par utilisateur
- Alertes automatiques
- Rapports détaillés

### Phase 6 : HA (High Availability)
- 2x RB4011 en failover
- Bascule automatique
- Service 24/7 garanti

---

## Coûts estimés

| Phase | Matériel | Coût estimé | Durée |
|-------|----------|-------------|-------|
| Phase 1 (Actuelle) | RB951 | ~100€ | - |
| Phase 2 | RB4011 | ~400€ | 1 jour |
| Phase 3 | VPN setup | ~200€ | 2 jours |
| Phase 4 | Radius Server | ~500€ | 3 jours |
| Phase 5 | Monitoring | ~300€ | 2 jours |
| Phase 6 | HA Setup | ~800€ | 3 jours |

---

## ROI (Return on Investment)

### Avant migration (RB951)
- Utilisateurs max : 20
- Revenu mensuel estimé : ~500€
- Limitations : Débit, nombre d'utilisateurs

### Après migration (RB4011)
- Utilisateurs max : 100+
- Revenu mensuel estimé : ~2500€
- ROI estimé : 2-3 mois

---

## Décision

**Critères de migration vers RB4011 :**

1. ✅ Nombre d'utilisateurs > 30 simultanés
2. ✅ Demande de bande passante > 50 Mbps
3. ✅ Besoin de séparation réseau (VLAN)
4. ✅ Croissance prévue importante
5. ✅ Budget disponible

**Recommandation :** 
Migrer vers RB4011 quand le pilote atteint 70% de capacité.
