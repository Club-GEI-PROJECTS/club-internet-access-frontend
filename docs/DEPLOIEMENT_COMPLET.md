# 🅰️ → 🆉 DÉPLOIEMENT COMPLET DU PROJET (RÉSEAU RÉEL)

---

## 🅰️ PHASE 0 — MATÉRIEL & PRÉREQUIS

### Matériel minimum

* 1× **Antenne Starlink** (kit complet)
* 1× **Routeur MikroTik** (RB951 pour pilote)
* 1× **Switch** (non manageable suffit au début)
* N× **AP Cisco** (mode bridge)
* Câbles Ethernet CAT6
* 1 PC avec **Winbox** installé

### Règles de base (à respecter)

* ❌ **Un seul DHCP : MikroTik**
* ❌ **Pas de NAT ailleurs**
* ❌ **AP Cisco = bridge uniquement**
* ✅ **MikroTik = point de contrôle**

---

## 🅱️ PHASE 1 — INSTALLATION STARLINK

### 1. Installation physique

* Place l'antenne **à ciel ouvert** (aucun obstacle)
* Fixation stable (toit/mât)
* Alimentation via le routeur Starlink

### 2. Test Starlink

* Connecte un téléphone au Wi-Fi Starlink
* Vérifie :

  * Internet OK
  * Débit stable

👉 **À ce stade : Starlink fonctionne seul**

---

## 🅲 PHASE 2 — BRANCHEMENT RÉSEAU (CRITIQUE)

### Câblage final

```
Starlink (LAN)
     │
     │
MikroTik RB951
  ether1 = WAN
  ether2 = LAN
     │
     │
   Switch
     │
 ┌───┼──────────────┐
 │   │              │
AP  AP           Serveur (optionnel)
Cisco Cisco
```

⚠️ **Aucun AP sur ether1**

---

## 🅳 PHASE 3 — CONFIGURATION DE BASE DU MIKROTIK

### 1. Connexion

* PC → ether2
* Ouvre **Winbox**
* Login : `admin` / mot de passe vide

---

### 2. Renommer les interfaces

```mikrotik
/interface ethernet set [find default-name=ether1] name=WAN
/interface ethernet set [find default-name=ether2] name=LAN
```

---

### 3. Internet (WAN)

```mikrotik
/ip dhcp-client add interface=WAN disabled=no
```

✔️ Vérifie :

```mikrotik
/ip dhcp-client print
```

→ `status=bound`

---

### 4. LAN + DHCP

```mikrotik
/ip address add address=192.168.10.1/24 interface=LAN

/ip pool add name=lan-pool ranges=192.168.10.50-192.168.10.250
/ip dhcp-server add name=lan-dhcp interface=LAN address-pool=lan-pool disabled=no
/ip dhcp-server network add address=192.168.10.0/24 gateway=192.168.10.1 dns-server=8.8.8.8
```

---

### 5. NAT (OBLIGATOIRE)

```mikrotik
/ip firewall nat add chain=srcnat out-interface=WAN action=masquerade
```

---

### 6. Test Internet

```mikrotik
/ping 8.8.8.8
```

✔️ Si ça ping → base réseau OK

---

## 🅴 PHASE 4 — CONFIGURATION DES AP CISCO

Sur **chaque AP Cisco** :

* Mode : **Access Point / Bridge**
* ❌ DHCP : **désactivé**
* ❌ NAT : **désactivé**
* SSID : ex `GEI-WIFI`
* Sécurité : **Open** (pour Hotspot)
* VLAN : aucun (au début)

👉 Les AP **ne contrôlent rien**, ils diffusent.

---

## 🅵 PHASE 5 — HOTSPOT MIKROTIK (CAPTIVE PORTAL)

### 1. Lancer le Hotspot

```mikrotik
/ip hotspot setup
```

Choix :

* Interface : `LAN`
* Address : `192.168.10.1`
* Pool : auto
* DNS : `8.8.8.8`
* DNS name : `wifi.faculte.local`
* User test : `test / 123`

---

### 2. Test immédiat

* Connecte un téléphone au Wi-Fi
* Ouvre un site
* Page de login apparaît
* Test : `test / 123`

✔️ Si Internet passe → Hotspot OK

---

## 🅶 PHASE 6 — PORTAIL EXTERNE (DOMAINE INTERNET)

### Principe

* Le Hotspot **redirige**
* Le portail est sur :
  `https://wifi.clubgei.org`

### 1. Walled Garden (autoriser avant login)

```mikrotik
/ip hotspot walled-garden add dst-port=53 protocol=udp action=allow
/ip hotspot walled-garden add dst-port=53 protocol=tcp action=allow
/ip hotspot walled-garden add dst-address=IP_DU_VPS protocol=tcp dst-port=443 action=allow
```

---

### 2. Redirection Hotspot → Portail

Dans `Files → hotspot → login.html` :

```html
<meta http-equiv="refresh" content="0; url=https://wifi.clubgei.org/captive?mac=$(mac)&ip=$(ip)&orig=$(link-orig-esc)">
```

---

## 🅷 PHASE 7 — LOGIQUE D'ACCÈS (APRÈS PAIEMENT)

### Côté serveur (NestJS)

* Paiement Mobile Money
* Confirmation webhook
* Création accès MikroTik via API

### Activation équivalente :

```mikrotik
/ip hotspot user add name=U123 password=P456 profile=1h
```

### Connexion finale

Redirection vers :

```
http://192.168.10.1/login?username=U123&password=P456
```

---

## 🅸 PHASE 8 — PROFILS & LIMITES

```mikrotik
/ip hotspot user profile add name=1h rate-limit=2M/2M session-timeout=1h
/ip hotspot user profile add name=1j rate-limit=3M/3M session-timeout=1d
```

---

## 🅹 PHASE 9 — SÉCURITÉ MINIMALE

* API MikroTik limitée au LAN
* Accès admin protégé
* Sauvegarde config :

```mikrotik
/export file=backup_gei
```

---

## 🅺 PHASE 10 — VALIDATION TERRAIN

Checklist :

* ✅ Wi-Fi visible
* ✅ Redirection captive
* ✅ Portail externe accessible
* ✅ Paiement OK
* ✅ Internet après paiement
* ✅ Déconnexion automatique à expiration

---

# 🎯 CONCLUSION TECHNIQUE

✔ Architecture **fonctionnelle**
✔ Compatible matériel existant
✔ Adaptée à un **pilote réel**
✔ Évolutive (RADIUS, VLAN, upgrade MikroTik)

---

## Prochaines étapes

1. **Checklist d'installation sur site (jour J)**
2. **Script MikroTik complet prêt à importer**
3. **Schéma réseau PDF niveau ingénieur**
4. **Plan d'évolution (RB951 → RB4011)**
