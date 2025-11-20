# Configuration Email - Guide Complet

## 📋 Table des matières
1. [Configuration Gmail](#configuration-gmail)
2. [Variables d'environnement](#variables-denvironnement)
3. [Test de configuration](#test-de-configuration)
4. [Cas d'utilisation](#cas-dutilisation)
5. [Dépannage](#dépannage)

---

## 🔧 Configuration Gmail

### Étape 1 : Activer l'authentification à deux facteurs (2FA)
1. Connectez-vous à votre compte Gmail
2. Allez dans **Paramètres du compte Google** → **Sécurité**
3. Activez **Validation en deux étapes**

### Étape 2 : Créer un mot de passe d'application
1. Dans **Sécurité**, cherchez **Mots de passe des applications**
2. Sélectionnez **Application : Autre (nom personnalisé)**
3. Nommez-le (ex: "AEM UNCHK Backend")
4. Copiez le mot de passe généré (16 caractères sans espaces)

### Étape 3 : Configuration recommandée

**Option 1 : Port 465 (SSL/TLS direct) - RECOMMANDÉ**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-app-password
EMAIL_FROM="Nom d'expéditeur" <votre-email@gmail.com>
```

**Option 2 : Port 587 (STARTTLS)**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-app-password
EMAIL_FROM="Nom d'expéditeur" <votre-email@gmail.com>
```

---

## 📝 Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# ==========================
# Email Configuration
# ==========================

# SMTP Server
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465

# Credentials (utilisez un App Password Gmail)
EMAIL_USER=aem.unchk7@gmail.com
EMAIL_PASS=iofiatvybyfodhcf

# Sender Info
EMAIL_FROM="AEM UNCHK" <aem.unchk7@gmail.com>

# Frontend URL (pour les liens de reset password)
FRONTEND_URL=https://aem-unchk-connect.vercel.app
```

---

## 🧪 Test de configuration

### Via l'endpoint de test (Admin uniquement)

#### 1. Connectez-vous en tant qu'admin
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "votre-mot-de-passe"
}
```

#### 2. Testez l'envoi d'email
```bash
POST http://localhost:3000/api/auth/test-email
Authorization: Bearer VOTRE_TOKEN_JWT
Content-Type: application/json

{
  "to": "destinataire@example.com",
  "subject": "Test Email",
  "message": "Ceci est un message de test"
}
```

### Via les logs au démarrage

Lorsque vous démarrez le backend, vérifiez les logs :

✅ **Configuration correcte :**
```
✅ SMTP verified successfully: smtp.gmail.com:465 as aem.unchk7@gmail.com | from="AEM UNCHK" <aem.unchk7@gmail.com>
```

❌ **Configuration incorrecte :**
```
❌ SMTP verify failed: Invalid login: 535-5.7.8 Username and Password not accepted
⚠️  Assurez-vous d'utiliser un App Password Gmail si vous utilisez Gmail
```

---

## 📨 Cas d'utilisation

### 1. Inscription d'un nouvel utilisateur
**Déclencheur :** POST `/api/auth/register`

**Email envoyé à :** Tous les administrateurs

**Contenu :**
- Notification qu'un nouvel utilisateur s'est inscrit
- Nom et prénom de l'utilisateur
- Statut : EN ATTENTE

**Code dans :** [auth.service.ts:257](src/auth/auth.service.ts#L257)

---

### 2. Mot de passe oublié
**Déclencheur :** POST `/api/auth/forgot-password`

**Email envoyé à :** L'utilisateur qui a demandé la réinitialisation

**Contenu :**
- Lien de réinitialisation du mot de passe
- Expiration : 15 minutes
- URL : `${FRONTEND_URL}/reset-password?token=${token}`

**Code dans :** [auth.service.ts:495](src/auth/auth.service.ts#L495)

---

### 3. Activation de compte par admin
**Déclencheur :** PATCH `/api/admin/users/:id/status`

**Email envoyé à :** L'utilisateur dont le statut change

**Contenu selon le statut :**
- **ACTIVE :** "Votre compte a été activé !"
- **SUSPENDED :** "Votre compte a été suspendu"
- **INACTIVE :** "Votre compte a été désactivé"

**Code dans :** [users.service.ts:199](src/users/users.service.ts#L199)

---

### 4. Rappel de contribution
**Déclencheur :** Automatique via cron job ou manuel

**Email envoyé à :** Membres avec contributions en retard

**Contenu :**
- Rappel de paiement de contribution
- Montant dû
- Instructions de paiement

**Code dans :** [contributions.service.ts:104](src/contributions/contributions.service.ts#L104)

---

## 🔍 Dépannage

### Problème : SMTP verify failed

#### Erreur : "Invalid login: 535-5.7.8"
**Cause :** Mot de passe incorrect ou mot de passe d'application non utilisé

**Solution :**
1. Assurez-vous d'utiliser un **App Password** Gmail, pas votre mot de passe principal
2. Vérifiez que le 2FA est activé sur votre compte Gmail
3. Régénérez un nouveau App Password si nécessaire

---

#### Erreur : "Connection timeout"
**Cause :** Problèmes de connexion réseau ou port bloqué

**Solution :**
1. Vérifiez votre connexion internet
2. Essayez de passer du port 465 au port 587 ou vice-versa
3. Vérifiez que votre firewall n'bloque pas le port SMTP

---

#### Erreur : "self signed certificate"
**Cause :** Problème de certificat SSL

**Solution :**
1. Utilisez le port 465 avec `secure: true`
2. Ou utilisez le port 587 avec `secure: false` et `requireTLS: true`

---

### Problème : Email non reçu

#### Vérifications :
1. ✅ Vérifiez les logs du backend pour confirmer l'envoi
   ```
   ✅ Email sent successfully: <message-id> | to=destinataire@example.com
   ```

2. ✅ Vérifiez le dossier **Spam/Courrier indésirable**

3. ✅ Vérifiez que l'adresse email destinataire est correcte

4. ✅ Vérifiez les limites d'envoi Gmail :
   - 500 emails/jour pour les comptes gratuits
   - 2000 emails/jour pour Google Workspace

---

### Problème : "No transporter configured"

**Cause :** Variables d'environnement manquantes

**Solution :**
Vérifiez que toutes ces variables sont définies dans `.env` :
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`

Redémarrez le backend après modification.

---

## 🚀 Commandes utiles

### Démarrer le backend en mode développement
```bash
cd islamic-platform-backend
npm run start:dev
```

### Tester la configuration avec curl
```bash
# 1. Se connecter en tant qu'admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# 2. Tester l'envoi d'email
curl -X POST http://localhost:3000/api/auth/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{"to":"test@example.com"}'
```

---

## 📚 Ressources supplémentaires

- [Documentation Nodemailer](https://nodemailer.com/)
- [Configuration Gmail SMTP](https://support.google.com/mail/answer/7126229)
- [Mots de passe d'application Gmail](https://support.google.com/accounts/answer/185833)

---

## ✅ Checklist de configuration

- [ ] Compte Gmail avec 2FA activé
- [ ] App Password Gmail généré
- [ ] Variables d'environnement configurées dans `.env`
- [ ] Backend redémarré après configuration
- [ ] Vérification des logs au démarrage (✅ SMTP verified)
- [ ] Test d'envoi d'email réussi
- [ ] Email de test reçu

---

**Dernière mise à jour :** 2025-11-20
