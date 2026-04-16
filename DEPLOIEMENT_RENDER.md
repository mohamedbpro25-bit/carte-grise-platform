# Mise en ligne simple sur Render

Cette version correspond a votre besoin de test: le site est publie sur Render sans Docker a gerer de votre cote.

## Ce que j'ai prepare

- `render.yaml` pour creer automatiquement:
  - `cartegrise-mysql`
  - `cartegrise-backend`
  - `cartegrise-frontend`
- un endpoint backend de sante sur `/api/health`
- un proxy `/api` dans le frontend pour eviter les problemes de CORS
- la persistance des documents uploades via un disque Render cote backend

## Important

Pour les tests, j'ai force `PAYMENTS_MODE=mock` sur Render.

Cela veut dire:

- pas besoin de configurer Stripe tout de suite
- les paiements de test passent sans vrai encaissement

## Mise en ligne

1. Mettez le projet sur GitHub.
2. Ouvrez Render.
3. Cliquez sur `New` puis `Blueprint`.
4. Connectez votre repo GitHub.
5. Render detectera automatiquement `render.yaml`.
6. Au premier import, renseignez les variables demandees:
   - `MYSQL_PASSWORD`
   - `MYSQL_ROOT_PASSWORD`
   - `FRONTEND_URL`
   - `BACKEND_URL`
   - `SIV_API_KEY` si vous utilisez vraiment cette API
   - `PLAQUE_API_KEY` si necessaire

## Valeurs a mettre

Une fois les URLs Render creees:

- `FRONTEND_URL` = URL publique du frontend, par exemple `https://cartegrise-frontend.onrender.com`
- `BACKEND_URL` = URL publique du backend, par exemple `https://cartegrise-backend.onrender.com`

## Resultat

- les visiteurs ouvrent le frontend sur son URL Render
- le frontend appelle l'API via `/api`
- Next.js relaie les appels vers le backend sur le reseau interne Render
- MySQL reste prive dans Render

## Limites de cette mise en ligne test

- les services `free` peuvent etre lents au reveil
- MySQL sur Render utilise un disque, pas une base managée MySQL native
- pour une vraie production, il faudra durcir la config email, paiement, sauvegardes et domaine

## Si vous voulez aller jusqu'au bout maintenant

Je peux vous guider sur l'etape suivante la plus concrete:

1. pousser le projet sur GitHub
2. importer le Blueprint dans Render
3. remplir exactement les variables Render avec vous