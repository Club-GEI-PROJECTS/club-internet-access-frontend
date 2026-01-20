# Script de configuration MikroTik - Base réseau
# À exécuter via Winbox ou Terminal

# ========================================
# 1. RENOMMER LES INTERFACES
# ========================================
/interface ethernet set [find default-name=ether1] name=WAN
/interface ethernet set [find default-name=ether2] name=LAN

# ========================================
# 2. CONFIGURATION WAN (Internet Starlink)
# ========================================
/ip dhcp-client add interface=WAN disabled=no

# ========================================
# 3. CONFIGURATION LAN
# ========================================
/ip address add address=192.168.10.1/24 interface=LAN

# Pool DHCP
/ip pool add name=lan-pool ranges=192.168.10.50-192.168.10.250

# Serveur DHCP
/ip dhcp-server add name=lan-dhcp interface=LAN address-pool=lan-pool disabled=no

# Réseau DHCP
/ip dhcp-server network add address=192.168.10.0/24 gateway=192.168.10.1 dns-server=8.8.8.8,1.1.1.1

# ========================================
# 4. NAT (Masquerade)
# ========================================
/ip firewall nat add chain=srcnat out-interface=WAN action=masquerade

# ========================================
# 5. HOTSPOT SETUP (configuration manuelle nécessaire)
# ========================================
# Exécuter: /ip hotspot setup
# Interface: LAN
# Address: 192.168.10.1
# Pool: hotspot-pool (créé automatiquement)
# DNS: 8.8.8.8
# DNS name: wifi.faculte.local
# User test: test / 123

# ========================================
# 6. PROFILS UTILISATEUR HOTSPOT
# ========================================
/ip hotspot user profile add name=1h rate-limit=2M/2M session-timeout=1h
/ip hotspot user profile add name=24h rate-limit=3M/3M session-timeout=24h
/ip hotspot user profile add name=7j rate-limit=5M/5M session-timeout=7d
/ip hotspot user profile add name=30j rate-limit=10M/10M session-timeout=30d

# ========================================
# 7. WALLED GARDEN (Autoriser portail externe)
# ========================================
# DNS toujours autorisé
/ip hotspot walled-garden add dst-port=53 protocol=udp action=allow
/ip hotspot walled-garden add dst-port=53 protocol=tcp action=allow

# IMPORTANT: Remplacer IP_DU_VPS par l'IP réelle du serveur
# /ip hotspot walled-garden add dst-address=IP_DU_VPS protocol=tcp dst-port=443 action=allow
# /ip hotspot walled-garden add dst-address=IP_DU_VPS protocol=tcp dst-port=80 action=allow

# ========================================
# 8. SÉCURITÉ ADMIN
# ========================================
# Changer le mot de passe admin
# /user set admin password=VOTRE_MOT_DE_PASSE_FORT

# ========================================
# 9. API (pour intégration backend)
# ========================================
/ip service enable api
/ip service set api address=192.168.10.0/24

# ========================================
# 10. SAUVEGARDE
# ========================================
/export file=backup_gei

# ========================================
# NOTES IMPORTANTES
# ========================================
# 1. Exécuter /ip hotspot setup manuellement après ce script
# 2. Configurer la redirection dans login.html (voir documentation)
# 3. Adapter les IP selon votre environnement
# 4. Tester chaque étape avant de passer à la suivante
