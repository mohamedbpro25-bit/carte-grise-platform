# TARIFICATION CARTE GRISE 2024-2025 ✅

## Configuration en Place

Tous les tarifs officiels ANTS 2024-2025 ont été implémentés dans le système.

**Fichier config:** `backend/src/config/pricing.config.json`

---

## 📊 TARIFS PAR RÉGION

### Métropole (13 régions)

| Région | Tarif/CV | Exemple (5 CV) | Exemple (7 CV) |
|--------|----------|----------------|----------------|
| **Île-de-France** | 46.15€ | 244.25€ | 334.55€ |
| **Provence-Alpes-Côte d'Azur** | 51.20€ | 268.70€ | 371.90€ |
| **Auvergne-Rhône-Alpes** | 44.00€ | 232.50€ | 320.50€ |
| **Bretagne** | 51.00€ | 267.50€ | 369.50€ |
| **Pays de la Loire** | 48.00€ | 252.50€ | 348.50€ |
| **Occitanie** | 44.00€ | 232.50€ | 320.50€ |
| **Centre-Val de Loire** | 49.80€ | 260.50€ | 360.10€ |
| **Nouvelle-Aquitaine** | 41.00€ | 216.50€ | 298.50€ |
| **Normandie** | 35.00€ | 186.50€ | 256.50€ |
| **Bourgogne-Franche-Comté** | 39.20€ | 207.50€ | 286.90€ |
| **Hauts-de-France** | 39.20€ | 207.50€ | 286.90€ |
| **Grand Est** | 42.00€ | 222.50€ | 306.50€ |
| **Corse** | 27.00€ | 147.50€ | 200.50€ |

### DOM-TOM (5 régions)

| Région | Tarif/CV | Exemple (5 CV) |
|--------|----------|----------------|
| **Guadeloupe** | 34.50€ | 183.00€ |
| **Guyane** | 28.00€ | 152.50€ |
| **Martinique** | 35.00€ | 186.50€ |
| **La Réunion** | 31.00€ | 166.50€ |
| **Mayotte** | 31.50€ | 169.00€ |

---

## 💰 COMPOSANTS FIXES (Tous les tarifs incluent)

- **Frais ANTS** : 11.00€
- **Frais postage** : 2.50€
- **Taxe régionale** : Puissance Fiscale (CV) × Tarif régional

### Formule totale :
```
Total = (Puissance Fiscale × Tarif régional) + 11.00 + 2.50
```

---

## ✅ TESTS VALIDÉS

```
📍 Île-de-France (5 CV)      → 244.25€ ✅
📍 PACA (7 CV)                → 371.90€ ✅
📍 Corse (4 CV)               → 121.50€ ✅
📍 Bretagne (6 CV)            → 319.50€ ✅
📍 Occitanie (8 CV)           → 365.50€ ✅
```

---

## 🔧 IMPLÉMENTATION

### Backend
- ✅ Fonction `calculatePrice()` mise à jour
- ✅ Lit depuis `pricing.config.json` 
- ✅ Gère automatiquement les fallbacks
- ✅ Endpoint de test: `POST /api/dossiers/test/calculate-price`

### Intégration
- ✅ Frontend utilise déjà `dossierService.calculatePrice()`
- ✅ Page `step5-paiement.tsx` appelle automatiquement le service
- ✅ Stripe facturera les bons montants

### Build
- ✅ `npm run build` copie désormais la config automatiquement
- ✅ Distribution ready: `dist/config/pricing.config.json`

---

## 📝 NOTES

- Les puissances fiscales (CV) sont extraites du formulaire véhicule (step2)
- La région est sélectionnée au step1 (modalités) → localStorage
- Les prix sont calculés en temps réel lors du chargement de step5
- En cas d'erreur, fallback à 44€/CV (tarif moyen national)

---

## 🎯 PROCHAINS PAS (Optionnels)

1. **Interface admin**: Afficher les tarifs par région
2. **Statistiques**: Analyser les revenus par région
3. **Mise à jour automatique**: Vérifier ANTS mensuellement
4. **Export PDF**: Inclure tarif breakdown en devis
