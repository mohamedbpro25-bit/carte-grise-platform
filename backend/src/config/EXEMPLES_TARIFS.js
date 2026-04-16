/**
 * EXEMPLES DE CALCUL DES TARIFS CARTE GRISE 2024-2025
 * ======================================================
 * 
 * Formule: Total = (Puissance Fiscale × Tarif Régional) + Frais ANTS (11€) + Frais Postage (2.50€)
 */

const exemples = [
  {
    region: "Île-de-France",
    regionKey: "ile-de-france",
    cv: 5,
    calc: "5 × 46.15 + 11.00 + 2.50 = 242.25€",
    expected: 242.25
  },
  {
    region: "Provence-Alpes-Côte d'Azur",
    regionKey: "provence-alpes-cote-d-azur",
    cv: 7,
    calc: "7 × 51.20 + 11.00 + 2.50 = 371.90€",
    expected: 371.90
  },
  {
    region: "Corse",
    regionKey: "corse",
    cv: 4,
    calc: "4 × 27.00 + 11.00 + 2.50 = 120.50€",
    expected: 120.50
  },
  {
    region: "Bretagne",
    regionKey: "bretagne",
    cv: 6,
    calc: "6 × 51.00 + 11.00 + 2.50 = 318.50€",
    expected: 318.50
  },
  {
    region: "Occitanie",
    regionKey: "occitanie",
    cv: 8,
    calc: "8 × 44.00 + 11.00 + 2.50 = 365.50€",
    expected: 365.50
  }
];

console.log("=== TARIFS CARTE GRISE 2024-2025 ===\n");

exemples.forEach(eg => {
  console.log(`📍 ${eg.region} (${eg.cv} CV)`);
  console.log(`   Calcul: ${eg.calc}`);
  console.log(`   ✅ Résultat attendu: ${eg.expected}€\n`);
});

/**
 * RÉGIONS INCLUSES:
 * 1. Île-de-France: 46.15€/CV
 * 2. PACA: 51.20€/CV
 * 3. Auvergne-Rhône-Alpes: 44.00€/CV
 * 4. Bretagne: 51.00€/CV
 * 5. Normandie: 35.00€/CV
 * 6. Corse: 27.00€/CV
 * 7. Pays de la Loire: 48.00€/CV
 * 8. Occitanie: 44.00€/CV
 * 9. Nouvelle-Aquitaine: 41.00€/CV
 * 10. Centre-Val de Loire: 49.80€/CV
 * 11. Bourgogne-Franche-Comté: 39.20€/CV
 * 12. Hauts-de-France: 39.20€/CV
 * 13. Grand Est: 42.00€/CV
 * + 5 DOM-TOM (Guadeloupe, Martinique, Guyane, La Réunion, Mayotte)
 */
