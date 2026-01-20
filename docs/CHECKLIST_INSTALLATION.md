# ✅ CHECKLIST D'INSTALLATION SUR SITE (JOUR J)

## 📋 Avant le déploiement

### Matériel à vérifier
- [ ] Antenne Starlink complète (antenne + routeur + câbles)
- [ ] Routeur MikroTik RB951 (ou équivalent)
- [ ] Switch Ethernet (nombre de ports suffisant)
- [ ] Points d'accès Cisco (nombre selon zone à couvrir)
- [ ] Câbles Ethernet CAT6 (longueurs nécessaires)
- [ ] Source d'alimentation pour tous les équipements
- [ ] PC portable avec Winbox installé
- [ ] Câbles Ethernet de test
- [ ] Multimètre (optionnel, pour vérifier alimentation)

### Préparation réseau
- [ ] Script MikroTik préconfiguré prêt
- [ ] Accès au backend API configuré
- [ ] URL du portail captive vérifiée
- [ ] Tests de paiement Mobile Money effectués
- [ ] Liste des SSID à configurer

---

## 📍 Sur site - Installation physique

### 1. Installation Starlink
- [ ] Antenne placée à ciel ouvert
- [ ] Aucun obstacle dans le champ de vision
- [ ] Fixation stable et sécurisée
- [ ] Câble vers routeur Starlink connecté
- [ ] Alimentation routeur Starlink OK
- [ ] Test connexion Wi-Fi Starlink OK
- [ ] Test Internet depuis téléphone OK

### 2. Câblage réseau
- [ ] Routeur Starlink → MikroTik ether1 (WAN)
- [ ] MikroTik ether2 (LAN) → Switch
- [ ] Switch → AP Cisco (chaque AP)
- [ ] Pas d'AP directement sur ether1
- [ ] Tous les câbles bien fixés
- [ ] Marquage des câbles si nécessaire

### 3. Alimentation
- [ ] Tous les équipements branchés
- [ ] Alimentations stabilisées (si nécessaire)
- [ ] Onduleur pour coupure courant (recommandé)

---

## 💻 Configuration logicielle

### 4. Configuration MikroTik de base
- [ ] PC connecté sur ether2 (LAN)
- [ ] Winbox ouvert et connecté
- [ ] Interfaces renommées (WAN/LAN)
- [ ] DHCP client WAN actif et bound
- [ ] Adresse LAN configurée (192.168.10.1/24)
- [ ] Pool DHCP créé
- [ ] Serveur DHCP actif
- [ ] NAT masquerade configuré
- [ ] Test ping Internet (8.8.8.8) OK

### 5. Configuration Hotspot
- [ ] Hotspot setup exécuté
- [ ] Interface LAN sélectionnée
- [ ] Pool hotspot créé
- [ ] User test créé (test/123)
- [ ] DNS configuré (8.8.8.8)
- [ ] Test page captive OK

### 6. Configuration AP Cisco
- [ ] Mode Access Point/Bridge activé
- [ ] DHCP désactivé sur chaque AP
- [ ] NAT désactivé sur chaque AP
- [ ] SSID configuré (ex: GEI-WIFI)
- [ ] Sécurité Open (pour Hotspot)
- [ ] Test connexion Wi-Fi OK
- [ ] Test redirection captive OK

### 7. Intégration portail externe
- [ ] IP du VPS notée
- [ ] Walled Garden configuré (DNS + VPS)
- [ ] Fichier login.html modifié
- [ ] Test redirection vers portail OK
- [ ] Test accès portail sans login OK

### 8. Configuration backend
- [ ] API MikroTik activée (LAN uniquement)
- [ ] Connexion backend → MikroTik testée
- [ ] Test création utilisateur via API OK
- [ ] Webhook paiement Mobile Money configuré
- [ ] Test paiement end-to-end OK

---

## ✅ Tests finaux

### 9. Validation complète
- [ ] Wi-Fi visible sur tous les appareils
- [ ] Connexion au Wi-Fi (sans mot de passe)
- [ ] Redirection captive fonctionne
- [ ] Portail externe accessible
- [ ] Formulaire de paiement accessible
- [ ] Paiement Mobile Money testé
- [ ] Accès Internet après paiement OK
- [ ] Déconnexion automatique à expiration
- [ ] Limite de bande passante respectée
- [ ] Re-connexion avec même compte fonctionne

### 10. Documentation
- [ ] Topologie réseau documentée
- [ ] IP de tous les équipements notées
- [ ] Configuration MikroTik exportée et sauvegardée
- [ ] Contacts support notés
- [ ] Checklist complétée et archivée

---

## 🚨 Points critiques à vérifier

⚠️ **Un seul DHCP** : Vérifier qu'aucun autre équipement ne fait DHCP  
⚠️ **NAT unique** : Seul le MikroTik fait NAT  
⚠️ **Pas de double NAT** : Starlink doit être en bridge ou mode bypass  
⚠️ **AP en bridge** : Les AP Cisco ne font pas de routage  
⚠️ **Walled Garden** : DNS et portail doivent être accessibles avant login  

---

## 📞 Support d'urgence

En cas de problème :
1. Vérifier les LED sur tous les équipements
2. Tester chaque segment réseau individuellement
3. Vérifier les logs MikroTik : `/log print`
4. Exporter la configuration actuelle : `/export`
5. Contact support technique

---

## 📝 Notes sur site

Date d'installation : _________________  
Installateur : _________________  
Topologie réseau : _________________  
Remarques : _________________  
