# AEM_UNCHK Backend API (NestJS)

Plateforme API monolithique pour la communauté AEM UNCHK. Fournit l’authentification JWT, la gestion des utilisateurs, des médias, des événements, marketplace, notifications, analytics, annonces et services religieux.

## Sommaire
- Présentation et stack
- Architecture et conventions
- Démarrage rapide (dev)
- Configuration (.env)
- Base de données (PostgreSQL)
- Commandes utiles (build, run, migrations, lint, tests)
- Documentation API (Swagger)
- Principaux modules et endpoints
- Authentification (JWT) — exemples cURL
- SSE Annonces
- Fichiers et uploads
- Observabilité (logs, format des réponses, erreurs)
- Sécurité, CORS et rate limiting
- Déploiement (prod)
- Dépannage (FAQ)

---

## Présentation et stack
- Langage/Framework: Node.js 20+, NestJS 10
- ORM: TypeORM 0.3 (PostgreSQL)
- Auth: JWT (passport-jwt), rôles/guards
- Validation: class-validator/class-transformer
- Docs: Swagger (OpenAPI) — /docs
- Sécurité: helmet, throttler (rate limiting)
- Cache/Jobs (optionnels): cache-manager (+ Redis)

## Architecture et conventions
- Monorepo backend Nest standard par modules métier:
  - src/auth: contrôleur, service, DTO, guards (JWT/Rôles), stratégies
  - src/users: entité User, service, contrôleur
  - src/media, src/events, src/marketplace, src/notifications, src/analytics, src/prayer, src/announcements
  - src/common: filtres, interceptors, décorateurs utilitaires
  - src/config: configuration centralisée (env → objet)
  - src/database: module et data-source TypeORM
- Préfixe global API: /api (configurable)
- Interceptors globaux:
  - TransformInterceptor: uniformise la réponse { success, data, timestamp, path }
  - LoggingInterceptor: requêtes/réponses et latences
- Filtre global: AllExceptionsFilter (format d’erreur cohérent)

## Démarrage rapide (dev)
1) Prérequis
- Node.js 20+ et npm
- PostgreSQL 14+ disponible localement

2) Installer dépendances
```
npm install
```

3) Créer le fichier .env (voir section Configuration)

4) Lancer en développement (watch)
```
npm run start:dev
```
- API: http://localhost:3000/api
- Docs: http://localhost:3000/docs

## Configuration (.env)
Le projet charge .env.local puis .env. Paramètres principaux:
```
# Serveur
PORT=3000
NODE_ENV=development
API_PREFIX=api
# Pour CORS (main.ts lit directement CORS_ORIGIN)
CORS_ORIGIN=http://localhost:5173

# Base de données
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=islamic_platform
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
# En dev vous pouvez laisser true, en prod mettez false et utilisez des migrations
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=false

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# SMTP (optionnel)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@islamic-platform.com

# Redis (optionnel)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Logs
LOG_LEVEL=info
```

## Base de données (PostgreSQL)
- Créez la base `islamic_platform` (ou ajustez `DATABASE_NAME`).
- Par défaut `DATABASE_SYNCHRONIZE=true` (utile en dev). En prod, mettez `false` et utilisez des migrations.

Option Docker (PostgreSQL + Adminer) rapide:
```
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: islamic_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
  adminer:
    image: adminer
    ports:
      - "8081:8080"
volumes:
  pgdata:
```

## Commandes utiles
- Développement: `npm run start:dev`
- Production: `npm run build && npm run start:prod`
- Lint/Format: `npm run lint`, `npm run format`
- Tests unitaires: `npm test`
- Tests e2e: `npm run test:e2e` (scaffold prêt)
- Migrations TypeORM:
  - Générer: `npm run migration:generate -- src/database/migrations/<NomMigration>`
  - Exécuter: `npm run migration:run`
  - Annuler: `npm run migration:revert`
  - Drop schéma: `npm run schema:drop`

Notes migrations:
- Les fichiers de migrations se trouvent dans `src/database/migrations` (créez le dossier si absent).
- Le data source CLI pointe sur `src/database/data-source.ts`.

## Documentation API (Swagger)
- Disponible en non‑production: http://localhost:3000/docs
- Ajoute automatically le schéma des DTO et le BearerAuth
- Persistance du token possible via l’UI Swagger

## Principaux modules et endpoints
- Auth (`/api/auth`): register, login, profile, change-password, forgot-password, reset-password, refresh, logout
- Users (`/api/users`): gestion de l’utilisateur (profil, statut, points, badges, favoris, activités)
- Media (`/api/media`): CRUD médias, catégories, likes, upload fichier
- Events/Activities (`/api/events`, `/api/activities`): événements, inscriptions, activités
- Marketplace (`/api/marketplace`): produits, commandes, avis, panier
- Notifications (`/api/notifications`): notifications et templates
- Analytics (`/api/analytics`): logs d’événements et sessions
- Prayer (`/api/prayer`): horaires et calendrier
- Announcements (`/api/announcements`): annonces, status et flux SSE `/announcements/stream`

Consultez la documentation Swagger pour les schémas complets.

## Authentification (JWT)
- Login/Registers renvoient `{ user, access_token, token, refreshToken }` dans `data` (réponse enveloppée par l’interceptor).
- Ajoutez `Authorization: Bearer <token>` sur les routes protégées.
- Payload JWT: `{ sub: userId, email, role }`.

Exemples cURL:
```
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom":"Sow","prenom":"Aissatou",
    "email":"aissatou.sow@example.com",
    "password":"Passw0rd!",
    "confirmer_mot_de_passe":"Passw0rd!",
    "telephone":"+221770000000"
  }'

# Login par email
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aissatou.sow@example.com","password":"Passw0rd!"}'

# Profil (protégé)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/auth/profile
```

## SSE Annonces
- Endpoint: `GET /api/announcements/stream`
- Usage front (EventSource):
```
const es = new EventSource('http://localhost:3000/api/announcements/stream');
es.onmessage = (e) => console.log(JSON.parse(e.data));
```
- Assurez‑vous que `CORS_ORIGIN` inclut votre frontend.

## Fichiers et uploads
- Uploads configurés via Multer (disque). Répertoire: `UPLOAD_DIR` (défaut `./uploads`).
- Taille max: `MAX_FILE_SIZE` (10Mo par défaut).

## Observabilité: format des réponses/erreurs et logs
- Réponse standard (TransformInterceptor):
```
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/..."
}
```
- Erreur standard (AllExceptionsFilter):
```
{
  "statusCode": 401,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/...",
  "method": "POST",
  "message": "Identifiants invalides"
}
```
- Logs HTTP (LoggingInterceptor): entrée/sortie, durée, code

## Sécurité, CORS et rate limiting
- CORS: configurez `CORS_ORIGIN` (ex: `http://localhost:5173` pour Vite)
- Helmet: politiques adaptées pour SSE
- Throttler: TTL/limit configurables (429 si dépassement)
- Hash de mot de passe: bcryptjs

## Déploiement (prod)
1) Mettre `NODE_ENV=production`, `DATABASE_SYNCHRONIZE=false`
2) Générer et exécuter les migrations
3) Construire et lancer
```
npm run build
npm run start:prod
```
4) Configurer un proxy/HTTPS (Nginx, Traefik) et les variables du .env (secrets JWT, DB, CORS)

## Dépannage (FAQ)
- 401 "Identifiants invalides":
  - Vérifiez que le compte a bien été créé après l’application du hashing bcrypt actuel.
  - Si vous migrez de données anciennes, réinitialisez les mots de passe concernés.
  - Vérifiez la casse et espaces des emails/téléphones; ils sont normalisés côté serveur.
- CORS en erreur: ajustez `CORS_ORIGIN` pour inclure l’URL du frontend.
- DB connexion refusée: vérifiez `DATABASE_*` et que PostgreSQL écoute sur `DATABASE_HOST:PORT`.
- Swagger indisponible: accessible uniquement hors production (par défaut).

---

## Scripts package.json (rappel)
```
start:dev      # Nest en mode watch
start:prod     # Lance dist/main (après build)
build          # Compilation TypeScript
lint           # ESLint
format         # Prettier
migration:*    # TypeORM CLI (générer/run/revert/drop)
test*          # Jest (unit/e2e)
```

## Licence
UNLICENSED — usage interne AEM UNCHK.

---

## Admin features (RBAC, pagination, exports, soft delete, audit)
- RBAC exposure: `GET /api/auth/me` returns `{ user, role, permissions, allowedCards, routes }` for frontend gating.
- Pagination: All list endpoints accept `page`, `limit` (default 20), optional `search` and `sort`. Normalized response shape:
```
{ data: T[], meta: { page, limit, total, hasNext, hasPrev } }
```
- Exports: `GET /api/admin/{users|media|events|products}/export?format=csv|xlsx&...filters` streams CSV/XLSX with UTF-8 BOM (CSV). Filenames follow `{module}_export_YYYY-MM-DD_HH-mm-SS_[role|statut|date].(csv|xlsx)`.
- Soft delete + Trash:
  - `GET /api/admin/{module}/trash` — list soft-deleted items
  - `POST /api/admin/{module}/:id/restore` — restore
  - `DELETE /api/admin/{module}/:id/purge` — permanent delete (Admin only)
- Audit logs: Admin actions recorded in `audit_logs` with `actorId`, `action`, `entityType`, `entityId`, `before`, `after`, `status`, `ip`, `userAgent`, `context`, `createdAt`. Retention job purges logs older than 24 months daily at 03:00.
- Admin routes for dashboard cards exist and return 200: `/api/admin`, `/api/admin/users`, `/api/admin/media`, `/api/admin/events`, `/api/admin/products`.

Swagger documentation is updated for new endpoints and paginated responses.
