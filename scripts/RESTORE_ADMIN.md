# Restaurer les permissions Admin

## Option 1 : Requête SQL directe (RECOMMANDÉ)

Connectez-vous à votre base de données PostgreSQL et exécutez cette requête :

```sql
UPDATE "User" 
SET role = 'admin', "isActive" = true 
WHERE email = 'clement@clementroy.work';
```

### Vérifier le résultat :

```sql
SELECT id, email, "firstName", "lastName", role, "isActive" 
FROM "User" 
WHERE email = 'clement@clementroy.work';
```

## Option 2 : Via Railway CLI

Si vous avez Railway CLI installé :

```bash
railway run psql
```

Puis exécutez la requête SQL ci-dessus.

## Option 3 : Via l'interface Railway

1. Allez sur votre projet Railway
2. Ouvrez l'onglet "Data" ou "Database"
3. Cliquez sur "Query" ou "Open Database"
4. Exécutez la requête SQL

## Option 4 : Via l'API (une fois déployé)

```bash
curl -X POST https://votre-domaine.com/api/admin/restore-admin \
  -H "Content-Type: application/json" \
  -d '{"secret": "temporary-restore-secret-change-me"}'
```

## Option 5 : Via Prisma Studio (si accessible)

```bash
DATABASE_URL="postgresql://postgres:cNUvlInibCwWkKnKWLiETJnODwqiuasH@mainline.proxy.rlwy.net:27665/railway" npx prisma studio
```

Puis modifiez manuellement le rôle de l'utilisateur.

## Informations de connexion

- **Host**: mainline.proxy.rlwy.net
- **Port**: 27665
- **Database**: railway
- **User**: postgres
- **Password**: cNUvlInibCwWkKnKWLiETJnODwqiuasH
- **Email à restaurer**: clement@clementroy.work

