# Variables d'environnement pour Railway

## Configuration du projet ARISE sur Railway

### Étape 1 : Créer le projet Railway

1. Allez sur [Railway](https://railway.app)
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Connectez votre compte GitHub si ce n'est pas déjà fait
5. Sélectionnez le repository **ARISE**

### Étape 2 : Ajouter PostgreSQL

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"Add PostgreSQL"**
3. Railway créera automatiquement la variable `DATABASE_URL`

### Étape 3 : Variables d'environnement requises

Allez dans **Settings** → **Variables** de votre service et ajoutez :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `DATABASE_URL` | *(automatique)* | Fournie par Railway PostgreSQL |
| `NEXT_PUBLIC_APP_URL` | `https://votre-app.up.railway.app` | URL de production |

### Étape 4 : Variables optionnelles

Si vous ajoutez l'authentification (NextAuth.js) :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NEXTAUTH_SECRET` | *(générer avec `openssl rand -base64 32`)* | Secret pour les sessions |
| `NEXTAUTH_URL` | `https://votre-app.up.railway.app` | URL de callback |

### Étape 5 : Vérifier le déploiement

1. Railway détectera automatiquement Next.js
2. Le build utilisera `pnpm build` (qui inclut `prisma generate`)
3. Le démarrage exécutera `prisma migrate deploy && pnpm start`

### Fichiers de configuration Railway inclus

- `railway.toml` - Configuration principale Railway
- `nixpacks.toml` - Configuration de build Nixpacks
- `Procfile` - Commande de démarrage

### Commandes utiles

```bash
# Développement local
pnpm dev

# Build production
pnpm build

# Appliquer les migrations
pnpm db:migrate

# Synchroniser le schéma (dev)
pnpm db:push

# Ouvrir Prisma Studio
pnpm db:studio
```

---

**Repository GitHub** : https://github.com/clement893/ARISE
