# Atelier Moulures — Spécification V2.1 / V2.2

Statut : **Draft — à valider avant implémentation**  
Référence : application actuelle sur `main` (calepinage d'un mur rectangulaire, plinthes, corniche, cadres réguliers, SVG, métrés et coupes à 45°).

## 1. Objectif

Préparer des calepinages de moulures **réellement posables** dans des pièces comportant des portes, fenêtres, radiateurs et escaliers. L'utilisateur reste responsable des choix décoratifs : l'application calcule, représente et signale les conflits sans imposer une composition.

Cas de référence : entrée et cage d'escalier d'une maison, puis salon et salle à manger ; cas complémentaire : bureau avec trois panneaux symétriques, un grand au centre et deux étroits latéraux.

## 2. Principes

1. Toutes les dimensions sont en **cm** dans le modèle et les calculs ; profils et précision de coupe peuvent être présentés en mm.
2. Origine `(0,0)` au **coin inférieur gauche du mur vu de face** ; `x` vers la droite et `y` vers le haut. Un objet a `x,y,width,height`.
3. Les objets physiques et les éléments décoratifs sont deux couches distinctes.
4. Ne jamais ajuster silencieusement un panneau pour masquer une collision : afficher un avertissement localisé.
5. Conserver le fonctionnement de la V1 pour les murs sans obstacles et la sauvegarde existante. Prévoir versionnage et migration des données locales.
6. Les métrés sont des estimations ; les découpes, chutes et conditions réelles de pose nécessitent validation.

## 3. V2.1 — Ouvertures et obstacles

### 3.1 Modèle minimal

```json
{
  "schemaVersion": 2,
  "project": { "name": "Rez-de-chaussée", "walls": [] },
  "wall": {
    "id": "wall-1", "name": "Entrée - mur A",
    "width": 287, "height": 252,
    "baseboardHeight": 12, "corniceDrop": 5,
    "obstacles": [],
    "panels": []
  },
  "obstacle": {
    "id": "ob-1", "type": "door",
    "x": 40, "y": 0, "width": 83, "height": 204,
    "clearance": { "left": 5, "right": 5, "top": 5, "bottom": 0 }
  },
  "panel": {
    "id": "panel-1", "x": 140, "y": 35,
    "width": 85, "height": 170, "profileWidthMm": 23
  }
}
```

Les valeurs ci-dessus sont **illustratives**, non des relevés de la maison.

### 3.2 Objets

- **Porte** : rectangle d'ouverture ; position, largeur, hauteur ; dégagement autour de l'huisserie. L'ouverture peut commencer à `y=0`. La représentation du sens d'ouverture est facultative en V2.1.
- **Fenêtre** : rectangle ; position, largeur, hauteur ; `y` correspond à la hauteur d'allège. Dégagement autour de l'encadrement.
- **Radiateur** : rectangle d'encombrement projeté sur le mur ; dégagements configurables, sans prétendre fixer les prescriptions du fabricant. Autoriser radiateur sous fenêtre et chevauchement physique *entre objets* de types différents lorsque pertinent.
- Chaque objet est modifiable, supprimable et identifié ; les coordonnées et dimensions sont éditables numériquement. Validation des valeurs positives et du maintien dans les limites du mur.

### 3.3 Calepinage

- Conserver le mode **grille régulière V1**.
- Ajouter un mode **panneaux libres** avec `x,y,width,height` par panneau.
- Ajouter une action **trois panneaux symétriques** : largeur centrale paramétrable, deux panneaux latéraux de même largeur, marges extérieures et intervalles paramétrables. Recalculer les largeurs latérales, sans valeurs négatives.
- Possibilité de créer plusieurs zones de panneaux autour d'une ouverture ; l'alignement est une aide visuelle, pas une contrainte forcée.
- Calculer les collisions entre le **contour extérieur du profil** et les rectangles d'obstacle augmentés de leur dégagement. Classer : erreur (géométrie impossible) / avertissement (conflit de pose ou dégagement).
- Afficher les dégagements et avertissements dans l'aperçu SVG, avec identification des objets concernés.

### 3.4 Quantités

- Calcul des quatre longueurs extérieures par panneau rectangulaire, deux pièces horizontales et deux verticales, onglets à 45°.
- Total par mur et par projet ; estimation du nombre de barres avec perte paramétrable ; ne pas annoncer d'optimisation réelle des chutes.
- Plinthes et corniches : ne pas déduire automatiquement les ouvertures avant de définir une règle explicite (une porte interrompt généralement une plinthe ; une fenêtre non). En V2.1, proposer une option d'interruption manuelle et afficher l'hypothèse retenue.

### 3.5 Interface et persistance

- Sélecteur de mur et nom du projet ; ajout d'obstacle par type ; tableau d'objets éditables ; vue SVG à l'échelle.
- Sauvegarde locale versionnée ; import/export JSON conseillé pour partager les relevés et éviter la dépendance à un seul appareil.
- La migration des anciennes données V1 doit préserver leurs dimensions, marges, grilles et profils.

## 4. V2.2 — Escaliers

### 4.1 Modèle

- Un segment de pente défini par deux points mesurés `(x1,y1)`, `(x2,y2)` sur l'élévation du mur.
- Possibilité de plusieurs segments (palier, changement de pente) ; ne pas déduire une pente des seules dimensions de la pièce.
- Zone de sécurité / retrait au-dessus de la ligne de pente, paramétrable.
- Panneaux polygonaux (au minimum parallélogrammes et trapèzes) décrits par leurs sommets dans l'ordre.

### 4.2 Calcul et dessin

- Dessiner la ligne de pente, les segments et les panneaux en SVG à l'échelle.
- Contrôler qu'aucun panneau ne franchit la zone interdite sous la pente.
- Pour chaque segment de moulure : longueur extérieure et angle géométrique de jonction ; les **angles de coupe** doivent être calculés à partir des directions adjacentes, avec convention explicitée et testée.
- Signaler les configurations ambiguës (angles rentrants, retours, irrégularités du support) ; ne pas promettre des coupes prêtes à poser sans validation sur chantier.

### 4.3 Limites assumées

- V2.2 modélise l'**élévation du mur**, pas un escalier 3D.
- Pas de compensation automatique des défauts d'aplomb ou de niveau.
- Les plinthes rampantes et mains courantes ne sont pas assimilées aux moulures décoratives ; prévoir un traitement distinct si nécessaire.

## 5. Projet multi-murs

Un projet regroupe plusieurs murs nommés, avec profils, références et paramètres communs. Les dimensions, obstacles et panneaux restent propres à chaque mur. Les métrés s'agrègent par référence de profil, sans fusionner abusivement des longueurs de coupe différentes.

## 6. Critères d'acceptation

### V2.1
- [ ] Un mur sans obstacle produit les mêmes dimensions, coupes et métrés que V1.
- [ ] Ajouter une porte, une fenêtre et un radiateur ; chacun est visible à la bonne position et modifiable.
- [ ] Une fenêtre et un radiateur dessous sont représentables sans fausse erreur de chevauchement entre obstacles.
- [ ] Un panneau recouvrant le dégagement d'une porte déclenche un avertissement localisé.
- [ ] Trois panneaux symétriques avec grand panneau central sont calculés exactement, y compris après changement de largeur du mur.
- [ ] Les panneaux libres ont des coupes et métrés cohérents.
- [ ] Sauvegarde, rechargement et migration V1 fonctionnent ; aucune donnée V1 perdue.
- [ ] Interface utilisable sur iPhone.

### V2.2
- [ ] La pente entre deux points correspond aux mesures et à l'aperçu SVG.
- [ ] Un panneau incliné conserve ses dimensions et angles après sauvegarde/rechargement.
- [ ] Les longueurs et angles d'un parallélogramme de référence sont vérifiés par calcul indépendant.
- [ ] Un panneau qui traverse la zone sous pente déclenche un conflit.
- [ ] Un palier ou changement de pente est représentable avec plusieurs segments.

## 7. Ordre d'exécution proposé

1. **Gate A — Spécification** : valider conventions de mesure, règles de dégagement et comportements plinthes/corniches.
2. **V2.1-A** : modèle versionné, objets et SVG, tests de non-régression V1.
3. **V2.1-B** : panneaux libres / symétriques, collisions, métrés, import/export.
4. **V2.1-C** : recette sur relevés réels entrée/salon/salle à manger.
5. **V2.2-A** : géométrie de pente et panneaux polygonaux.
6. **V2.2-B** : calcul des angles et métrés, recette escalier réel.

## 8. Décisions à confirmer

- Les dégagements autour des radiateurs doivent-ils être seulement indicatifs ou bloquants ?
- Les ouvertures de porte doivent-elles interrompre automatiquement les plinthes ?
- Faut-il un dessin des encadrements (chambranles) dès V2.1 ?
- Quels relevés de l'entrée et de l'escalier seront utilisés pour la recette ?
