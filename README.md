# Plateforme Carte Grise en ligne

## Installation

Backend:
  cd backend
  npm install
  npm run start:dev

Frontend:
  cd frontend
  npm install
  npm run dev

Base de donnees avec Docker:
  docker-compose up -d

## Configuration API SIV

Fichier: backend/src/modules/vehicules/vehicules.service.ts
Recherchez le commentaire "ICI - METTEZ VOTRE API SIV"

## URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- MySQL: localhost:3306

## Mise en ligne test

Une configuration Docker complete pour publier le site sur un serveur de test est disponible dans [DEPLOIEMENT_TEST.md](DEPLOIEMENT_TEST.md).

Pour une mise en ligne simple sur Render, voir aussi [DEPLOIEMENT_RENDER.md](DEPLOIEMENT_RENDER.md).

Fichiers ajoutes pour cela:
- `docker-compose.online-test.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `deploy/nginx/default.conf`

## Variables d'environnement importantes

Backend (.env):
- JWT_SECRET=une_cle_longue_et_secrete
- PAYMENTS_MODE=stripe
- STRIPE_SECRET_KEY=sk_live_...
- STRIPE_WEBHOOK_SECRET=whsec_...
- FRONTEND_URL=https://votre-frontend
- BACKEND_URL=https://votre-backend
- API immatriculation: PLAQUE_API_URL/PLAQUE_API_KEY ou SIV_API_URL/SIV_API_KEY

Frontend (frontend/.env.local):
- NEXT_PUBLIC_API_URL=https://votre-backend/api
- NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...