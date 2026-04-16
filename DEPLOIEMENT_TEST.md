# Mise en ligne pour tests

Cette configuration permet de publier la plateforme sur un serveur Linux ou une VM accessible depuis Internet avec Docker Compose.

## Ce qui est fourni

- `docker-compose.online-test.yml` pour lancer MySQL, le backend NestJS, le frontend Next.js et Nginx
- `backend/Dockerfile` et `frontend/Dockerfile` pour construire les images applicatives
- `deploy/nginx/default.conf` pour exposer le site sur le port `80`
- un volume persistant pour la base MySQL et un autre pour les uploads utilisateurs

## Pré-requis

- un VPS ou serveur avec Docker et Docker Compose installes
- le port `80` ouvert dans le pare-feu
- idealement un nom de domaine, mais une IP publique suffit pour les tests

## 1. Copier le projet sur le serveur

Exemple:

```bash
git clone <votre-repo>
cd carte-grise-platform
```

## 2. Creer le fichier d'environnement

Sur le serveur:

```bash
cp .env.online-test.example .env
```

Puis adaptez au minimum:

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `FRONTEND_URL`
- `BACKEND_URL`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`

Pour un test simple par IP publique:

```env
FRONTEND_URL=http://123.123.123.123
BACKEND_URL=http://123.123.123.123/api
NEXT_PUBLIC_API_URL=/api
```

## 3. Lancer la plateforme

```bash
docker compose -f docker-compose.online-test.yml up -d --build
```

## 4. Verifier l'etat des services

```bash
docker compose -f docker-compose.online-test.yml ps
docker compose -f docker-compose.online-test.yml logs -f backend
docker compose -f docker-compose.online-test.yml logs -f frontend
```

Le site sera accessible sur:

- `http://VOTRE_IP_OU_DOMAINE`

## 5. Mettre a jour apres modification

```bash
git pull
docker compose -f docker-compose.online-test.yml up -d --build
```

## Points d'attention

- le frontend est publie derriere Nginx et appelle l'API via `/api`
- le backend n'est pas expose directement sur Internet, seul Nginx publie le port `80`
- si vous changez `NEXT_PUBLIC_API_URL`, il faut reconstruire le frontend
- les documents uploades restent persistants grace au volume `uploads_data`
- pour Stripe en conditions de test, utilisez les cles `test`, pas les cles `live`

## HTTPS

Cette configuration est volontairement simple pour des tests rapides. Si vous voulez du HTTPS:

- soit vous placez le serveur derriere Cloudflare
- soit vous ajoutez un reverse proxy TLS comme Caddy ou Traefik

Si vous voulez, je peux aussi vous preparer la version HTTPS automatique avec domaine.