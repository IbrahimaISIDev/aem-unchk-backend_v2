# 🚀 Système Email Hybride avec Fallback Automatique

## Vue d'ensemble

Le système d'envoi d'emails a été amélioré avec un **mécanisme de fallback automatique** pour garantir que les emails sont toujours envoyés, peu importe l'environnement (local ou production).

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Email Service                             │
│                                                              │
│  ┌─────────────┐                    ┌──────────────┐       │
│  │   Request   │                    │   Response   │       │
│  │  Send Email │──────►             │  { sent, id, │       │
│  └─────────────┘      │             │    method }  │       │
│                       │             └──────────────┘       │
│                       ▼                                     │
│          ┌─────────────────────┐                           │
│          │  Try SMTP (Gmail)   │                           │
│          │   Port 465/587      │                           │
│          └─────────────────────┘                           │
│                   │                                         │
│         ┌─────────┴────────┐                               │
│         │                  │                                │
│      SUCCESS            FAIL                                │
│         │                  │                                │
│         ▼                  ▼                                │
│   ┌──────────┐    ┌──────────────────┐                    │
│   │  Return  │    │ Fallback Resend  │                    │
│   │  Result  │    │    (HTTP API)     │                    │
│   └──────────┘    └──────────────────┘                    │
│                            │                                │
│                   ┌────────┴────────┐                      │
│                   │                 │                       │
│                SUCCESS           FAIL                       │
│                   │                 │                       │
│                   ▼                 ▼                       │
│             ┌──────────┐    ┌──────────┐                  │
│             │  Return  │    │  Return  │                  │
│             │  Result  │    │  Error   │                  │
│             └──────────┘    └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Avantages

| Caractéristique | Description |
|----------------|-------------|
| 🔄 **Résilience** | Si SMTP échoue, Resend prend le relais automatiquement |
| 🌍 **Universel** | Fonctionne partout : local, production, Render, Vercel, etc. |
| 💰 **Économique** | Utilise SMTP gratuit en premier, Resend en secours (3000 emails/mois gratuits) |
| 📊 **Transparent** | Les logs indiquent quelle méthode a été utilisée (`[SMTP]` ou `[Resend]`) |
| ⚡ **Zero Config** | Fonctionne sans Resend (SMTP uniquement), mais mieux avec les deux |
| 🔐 **Sécurisé** | Pas de problèmes de firewall avec Resend (API HTTP) |

---

## 📋 Configuration

### Configuration Locale (Développement)

Dans votre `.env` local :

```env
# SMTP Gmail (Primary) - Fonctionne en local
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=aem.unchk7@gmail.com
EMAIL_PASS=iofiatvybyfodhcf
EMAIL_FROM="AEM UNCHK" <aem.unchk7@gmail.com>

# Resend (Fallback) - Optionnel en local
# RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

✅ En **local**, SMTP fonctionnera parfaitement sans Resend.

---

### Configuration Production (Render/Vercel)

Dans vos variables d'environnement Render :

```env
# SMTP Gmail (Primary) - Peut être bloqué par le firewall
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=aem.unchk7@gmail.com
EMAIL_PASS=iofiatvybyfodhcf
EMAIL_FROM="AEM UNCHK" <aem.unchk7@gmail.com>

# Resend (Fallback) - REQUIS pour la production
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

✅ En **production**, si SMTP échoue (firewall), Resend prend le relais automatiquement.

---

## 🔑 Obtenir une Clé API Resend

### Étape 1 : Créer un compte Resend (Gratuit)

1. Allez sur [https://resend.com/signup](https://resend.com/signup)
2. Créez un compte gratuit
3. **Plan gratuit** : 3000 emails/mois, 100 emails/jour

### Étape 2 : Obtenir votre clé API

1. Allez dans [https://resend.com/api-keys](https://resend.com/api-keys)
2. Cliquez sur **Create API Key**
3. Nom : `AEM UNCHK Backend`
4. Permission : **Sending access**
5. Copiez la clé (format : `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Étape 3 : Vérifier votre domaine (Optionnel mais recommandé)

Pour envoyer depuis `@votre-domaine.com` :

1. Allez dans [https://resend.com/domains](https://resend.com/domains)
2. Cliquez sur **Add Domain**
3. Entrez votre domaine (ex: `aem-unchk.com`)
4. Ajoutez les enregistrements DNS fournis
5. Attendez la vérification (quelques minutes)

Sans domaine vérifié, vous ne pouvez envoyer que depuis `onboarding@resend.dev`.

---

## 📊 Logs et Monitoring

### Logs au Démarrage

#### Avec SMTP + Resend (Optimal)
```
[MailService] ✅ SMTP verified successfully: smtp.gmail.com:465 as aem.unchk7@gmail.com
[MailService] ✅ Resend API configured as fallback email service
```

#### Avec SMTP uniquement
```
[MailService] ✅ SMTP verified successfully: smtp.gmail.com:465 as aem.unchk7@gmail.com
[MailService] ⚠️  Resend not configured (missing RESEND_API_KEY). Email fallback disabled.
```

#### Avec Resend uniquement
```
[MailService] ⚠️  SMTP not configured (missing host, port, user, or pass)
[MailService] ✅ Resend API configured as fallback email service
```

---

### Logs lors de l'Envoi

#### Succès via SMTP
```
[MailService] 📧 [SMTP] Attempting to send email to: user@example.com | subject: "Test"
[MailService] ✅ [SMTP] Email sent successfully: <message-id> | to=user@example.com
```

#### SMTP échoue → Fallback Resend réussit
```
[MailService] 📧 [SMTP] Attempting to send email to: user@example.com | subject: "Test"
[MailService] ⚠️  [SMTP] Failed to send email: Connection timeout | code: ETIMEDOUT
[MailService] 🔄 [FALLBACK] Attempting to send via Resend...
[MailService] ✅ [Resend] Email sent successfully: re_abc123 | to=user@example.com
```

#### Succès via Resend uniquement (SMTP non configuré)
```
[MailService] 📧 [Resend] Sending email (SMTP not configured) to: user@example.com
[MailService] ✅ [Resend] Email sent successfully: re_abc123 | to=user@example.com
```

---

## 🧪 Tests

### Test en Local (SMTP)

```bash
node test-email.js votre-email@example.com
```

**Résultat attendu :**
```
✅ Email envoyé avec succès !
   Message ID: <...@gmail.com>
   Response: 250 2.0.0 OK
```

---

### Test en Production (Avec Fallback)

#### Option 1 : Via l'endpoint de test

```bash
POST https://votre-api.com/api/auth/test-email
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email Production",
  "message": "Test du système hybride"
}
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Email de test envoyé avec succès à test@example.com",
  "details": {
    "messageId": "re_abc123",
    "method": "Resend"
  }
}
```

---

### Test du Fallback

Pour forcer le fallback Resend, commentez temporairement les variables SMTP :

```env
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=465
# EMAIL_USER=aem.unchk7@gmail.com
# EMAIL_PASS=iofiatvybyfodhcf
EMAIL_FROM="AEM UNCHK" <aem.unchk7@gmail.com>

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Redémarrez et testez. L'email doit passer par Resend.

---

## 📈 Limites et Quotas

### SMTP Gmail (Gratuit)

| Limite | Valeur |
|--------|--------|
| Emails/jour | 500 |
| Limite par envoi | 1 destinataire |
| Coût | Gratuit |

### Resend (Plan Gratuit)

| Limite | Valeur |
|--------|--------|
| Emails/mois | 3 000 |
| Emails/jour | 100 |
| Destinataires/envoi | 50 |
| Coût | Gratuit |

### Resend (Plan Pro)

| Limite | Valeur |
|--------|--------|
| Emails/mois | 50 000 |
| Emails/jour | Illimité |
| Coût | $20/mois |

---

## 🔧 Configuration Render (Production)

### Ajouter les Variables d'Environnement

1. Allez sur votre dashboard Render
2. Sélectionnez votre service `islamic-platform-backend`
3. Allez dans **Environment** → **Environment Variables**
4. Ajoutez ces variables :

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=aem.unchk7@gmail.com
EMAIL_PASS=iofiatvybyfodhcf
EMAIL_FROM="AEM UNCHK" <aem.unchk7@gmail.com>
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

5. Cliquez sur **Save Changes**
6. Le service redémarrera automatiquement

---

## 🐛 Dépannage

### Problème : Emails ne partent pas

#### Vérification 1 : Logs au démarrage
```bash
# Vérifier les logs Render
# Rechercher "[MailService]" dans les logs
```

**Attendu :**
```
[MailService] ✅ SMTP verified successfully...
[MailService] ✅ Resend API configured...
```

#### Vérification 2 : Variables d'environnement
```bash
# Sur Render, vérifier que toutes les variables sont définies
EMAIL_HOST ✅
EMAIL_PORT ✅
EMAIL_USER ✅
EMAIL_PASS ✅
EMAIL_FROM ✅
RESEND_API_KEY ✅
```

#### Vérification 3 : Test d'envoi
```bash
# Essayer d'envoyer un email de test via l'API
POST /api/auth/test-email
```

---

### Problème : SMTP timeout en production

**Cause :** Render bloque les ports SMTP sortants

**Solution :** Le fallback Resend prendra le relais automatiquement

**Vérification dans les logs :**
```
[MailService] ⚠️  [SMTP] Failed to send email: Connection timeout
[MailService] 🔄 [FALLBACK] Attempting to send via Resend...
[MailService] ✅ [Resend] Email sent successfully
```

---

### Problème : Resend retourne 403 Forbidden

**Cause 1 :** Clé API invalide

**Solution :** Vérifier que `RESEND_API_KEY` commence par `re_`

**Cause 2 :** Domaine non vérifié

**Solution :** Utiliser `EMAIL_FROM="AEM UNCHK" <onboarding@resend.dev>` temporairement

---

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Dashboard Resend](https://resend.com/overview)
- [Limites Resend](https://resend.com/docs/introduction#limits)
- [Vérification de domaine](https://resend.com/docs/dashboard/domains/introduction)

---

## ✅ Checklist de Déploiement

- [ ] Compte Resend créé
- [ ] Clé API Resend générée
- [ ] Variable `RESEND_API_KEY` ajoutée sur Render
- [ ] Variables SMTP configurées sur Render
- [ ] Backend redémarré sur Render
- [ ] Logs vérifiés (SMTP + Resend configurés)
- [ ] Test d'envoi d'email réussi
- [ ] Email reçu avec succès

---

**Dernière mise à jour :** 2025-11-20
**Version :** 2.0 - Système Hybride avec Fallback
