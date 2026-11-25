# V2.1-B — Règles de composition par typologie

Statut : prototype de recette, non validé pour pose.

## Principe
Les axes de colonnes sont calculés une seule fois sur la largeur utile du mur. Les ouvertures ne doivent jamais provoquer un recalcul indépendant des axes. Les marges, espacements et dimensions sont exprimés en cm. Origine du repère : coin inférieur gauche.

## Typologies
1. **Cadres décoratifs** : une rangée de rectangles ou de carrés. Pour les carrés, le côté est le minimum de la largeur de colonne et de la hauteur disponible, avec centrage dans la zone nominale.
2. **Soubassement** : panneaux bas sous une hauteur de référence (depuis le sol) ; chaque panneau conserve l'axe de sa colonne.
3. **Mixte** : panneaux bas et hauts, séparés par un espace vertical paramétrable ; mêmes axes verticaux.

## Contraintes et priorités
- Calculer d'abord la grille et les lignes de référence ; adapter ensuite aux obstacles.
- Interdire toute intersection d'un cadre avec le rectangle d'un obstacle augmenté du dégagement configuré.
- Si une colonne est obstruée, conserver sa largeur et son axe ; tenter un seul panneau sur la portion verticale libre la plus haute en surface. Ne pas fabriquer des cadres latéraux étroits sans choix explicite de l'utilisateur.
- Ne pas créer de panneau si largeur ou hauteur < max(12 cm, deux largeurs de profil + 8 cm).
- Conserver la liberté de déplacer les obstacles au doigt et d'affiner les coordonnées X/Y.
- Calculer les longueurs de baguettes et les coupes à partir des **seuls cadres effectivement affichés**.
- Afficher des avertissements explicites si une zone ne permet pas de panneau ; ne pas inventer de panneau qui chevauche une ouverture.

## Limites du prototype
- L'éditeur de cadres individuels, les compositions à plusieurs panneaux par colonne, les cimaises horizontales et le calepinage réel des barres ne sont pas implémentés.
- Les proportions sont indicatives et doivent être validées visuellement avant achat.
- Cas de recette prioritaires : mur libre, porte + fenêtre, fenêtre + radiateur centré, soubassement, mixte et contraintes extrêmes.
