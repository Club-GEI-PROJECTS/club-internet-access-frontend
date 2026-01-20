# 📐 SCHÉMA RÉSEAU - ARCHITECTURE TECHNIQUE

## Architecture globale

```
                    [Internet]
                       |
                       |
                [Antenne Starlink]
                       |
                       |
              [Routeur Starlink]
                   (Bridge)
                       |
                       |
          ┌────────────┴────────────┐
          │                         │
    [Ether1: WAN]           [Wi-Fi Starlink]
          │                         │
          │                         │
    [MikroTik RB951]          (Non utilisé)
    - DHCP Server                  │
    - NAT Masquerade          [Clients locaux]
    - Hotspot Server              │
    - Captive Portal              │
          │                        │
    [Ether2: LAN]                 │
    IP: 192.168.10.1/24           │
          │                        │
          │                        │
      [Switch]                     │
    (non-manageable)               │
          │                        │
    ┌─────┼─────┬─────────┐       │
    │     │     │         │       │
[AP Cisco] [AP Cisco] [Serveur]  │
Bridge    Bridge    Backend       │
    │         │                    │
    │         │                    │
[Wi-Fi Clients]                   │
SSID: GEI-WIFI                    │
Open Security                     │
    │                             │
    │                             │
[Captive Portal]                  │
→ https://wifi.clubgei.org        │
```

## Sous-réseaux

### Réseau WAN (Starlink)
- **Type** : DHCP Client
- **Interface** : ether1 (WAN)
- **Source** : Routeur Starlink

### Réseau LAN (MikroTik)
- **Réseau** : 192.168.10.0/24
- **Gateway** : 192.168.10.1
- **DHCP Pool** : 192.168.10.50 - 192.168.10.250
- **DNS** : 8.8.8.8, 1.1.1.1

### Hotspot Pool
- **Pool** : Créé automatiquement par Hotspot
- **Plage** : Généralement 192.168.10.2 - 192.168.10.49

## Flux de données

### 1. Connexion Wi-Fi
```
Client → AP Cisco (Bridge) → Switch → MikroTik LAN → DHCP → IP attribuée
```

### 2. Tentative d'accès Internet
```
Client → MikroTik → Firewall → Hotspot → Redirection → Portail Captive
```

### 3. Après authentification
```
Client → MikroTik → NAT → WAN → Starlink → Internet
```

## Configuration IP par équipement

| Équipement | Interface | IP | Masque | Gateway |
|------------|-----------|-----|--------|---------|
| MikroTik | ether1 (WAN) | DHCP | - | Starlink |
| MikroTik | ether2 (LAN) | 192.168.10.1 | /24 | - |
| Switch | - | N/A | - | - |
| AP Cisco | - | DHCP (192.168.10.x) | /24 | 192.168.10.1 |
| Serveur Backend | - | 192.168.10.100 | /24 | 192.168.10.1 |
| Clients Wi-Fi | - | DHCP (192.168.10.50-250) | /24 | 192.168.10.1 |

## Ports et services

### MikroTik RB951

| Service | Port | Accès | Notes |
|---------|------|-------|-------|
| Winbox | 8291 | LAN | Administration |
| API | 8728 | LAN | Intégration backend |
| SSH | 22 | LAN | Terminal (optionnel) |
| HTTP | 80 | LAN | Hotspot captive |
| HTTPS | 443 | LAN | (optionnel) |
| DNS | 53 | UDP/TCP | Walled Garden |

### Backend Server

| Service | Port | Accès | Notes |
|---------|------|-------|-------|
| API | 4000 | Internet | NestJS |
| Frontend | - | Internet | Next.js (Vercel) |
| Webhook | - | Internet | Mobile Money |

## Règles de routage

### NAT (Masquerade)
```
Source: 192.168.10.0/24
Out Interface: WAN
Action: Masquerade
```

### Hotspot Rules
```
Chain: prerouting
In Interface: LAN
Action: Jump to hotspot
```

### Walled Garden
```
DNS (53 UDP/TCP): Allow
Portail (443 TCP): Allow (IP_VPS)
```

## Bande passante

### Limites par profil

| Profil | Download | Upload | Durée |
|--------|----------|--------|-------|
| 1h | 2 Mbps | 2 Mbps | 1 heure |
| 24h | 3 Mbps | 3 Mbps | 24 heures |
| 7j | 5 Mbps | 5 Mbps | 7 jours |
| 30j | 10 Mbps | 10 Mbps | 30 jours |

## Évolutions possibles

### Phase 2 : VLAN
```
LAN → VLAN 10 (Hotspot)
LAN → VLAN 20 (Staff)
LAN → VLAN 30 (AP Guest)
```

### Phase 3 : Router upgrade
```
RB951 → RB4011 (Plus de ports, plus de performance)
```

### Phase 4 : Radius
```
Hotspot → Radius Server → Base de données centralisée
```

### Phase 5 : Multi-site
```
Site A → VPN → Site B
Gestion centralisée
```
