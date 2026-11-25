# V2.1-B — Référentiel de composition décorative (proposition v0.1)

**Statut : règles de conception proposées, à valider par recette visuelle.** Ce document remplace la stratégie « remplir les espaces libres » comme source de décision du futur moteur. Il ne constitue ni une norme de décoration ni une recommandation de pose certifiée.

## Promesse produit
L'utilisateur renseigne le mur et ses obstacles, choisit une typologie, puis obtient **une proposition exploitable sans régler de colonnes ni de marges**. Les réglages avancés ne sont proposés qu'ensuite. Un échec de la grille initiale déclenche une recherche de variantes, pas une demande de « bidouiller » les dimensions.

## Parcours
1. Définir le mur : largeur, hauteur, plinthes, corniche, porte(s), fenêtre(s), radiateur(s). Déplacement tactile et saisie précise.
2. Choisir **cadres décoratifs**, **soubassement** ou **mixte** (et rectangles/carrés si pertinent).
3. Afficher immédiatement une **proposition recommandée** et, si elles sont pertinentes, deux alternatives : « classique » et « adaptée aux ouvertures ». Ne pas afficher une alternative invalide juste pour atteindre trois options.
4. « Ajuster la composition » révèle les paramètres avancés (marges, nombre de panneaux, espaces, hauteur de soubassement, dégagement). Toute modification recalcule la note et les métrés.
5. Afficher plan de pose, cotes, coupes, métrés, avertissements et limites de l'estimation.

## Contraintes éliminatoires (hard constraints)
- Aucun cadre ne dépasse de la surface utile ni ne coupe une porte, une fenêtre ou un radiateur augmenté du dégagement configurable.
- Largeur et hauteur strictement positives ; taille minimale de cadre configurable (valeur initiale indicative : max(12 cm, 2 × largeur du profil + 8 cm)).
- Ne pas déplacer ou redimensionner les obstacles pour améliorer la note décorative.
- Les métrés correspondent **uniquement aux cadres réellement affichés** ; ne jamais inclure un panneau rejeté.
- Si aucune composition faisable n'existe, afficher la cause concrète et proposer une solution (changer de typologie, diminuer le nombre de cadres, ajuster une marge) ; ne jamais masquer le conflit.

## Préférences esthétiques (soft constraints)
Chaque critère retourne une note normalisée de 0 à 1 ; pondérations **provisoires**, à calibrer sur les murs de recette.

| Critère | Poids initial | Définition testable |
|---|---:|---|
| Alignement et rythme | 30 % | Part des cadres partageant une ligne haute/basse ou un axe justifié |
| Équilibre visuel | 25 % | Écart de surfaces et de masses visuelles entre zones gauche/droite, sans imposer une symétrie impossible |
| Proportions | 20 % | Pénaliser les panneaux très étroits ou excessivement allongés ; favoriser des familles de proportions cohérentes |
| Marges et espacements | 15 % | Dispersion des espacements entre cadres et aux bords ; éviter les intervalles accidentellement très petits |
| Simplicité de pose | 10 % | Limiter le nombre de formats différents, de coupes et de petits éléments |

Score = somme(poids × note), uniquement pour les candidats **faisables**. Ces poids sont une hypothèse produit, pas des « bonnes pratiques » universelles.

## Génération des candidats (sans IA)
1. Construire les zones physiques utilisables et les axes architecturaux (bords du mur, centres et côtés des ouvertures, ligne de plinthe, sous-corniche, hauteur de soubassement).
2. Générer des **familles de compositions** adaptées à la typologie : une ou deux rangées de cadres rectangulaires/carrés ; panneaux bas ; panneaux bas + hauts sur axes communs.
3. Essayer plusieurs nombres de panneaux, positions d'axes et espacements **autour de valeurs préférées**. Le nombre de colonnes saisi, s'il existe, est une préférence et non une obligation.
4. Autoriser un cadre sous une fenêtre quand il respecte les dégagements et que ses proportions sont acceptables ; autoriser des cadres latéraux de largeur différente si l'équilibre global y gagne.
5. Éliminer les candidats qui violent une contrainte dure. Noter et classer les autres. Dédupliquer les variantes visuellement presque identiques.
6. Expliquer la recommandation en langage simple (« alignement supérieur conservé », « cadre sous fenêtre », « 3 panneaux au lieu de 4 pour éviter la porte »).
7. Conserver les paramètres précis en mode avancé et ne jamais écraser les coordonnées d'obstacles enregistrées.

## Règles spécifiques
**Cadres décoratifs** : privilégier des lignes hautes/basses communes ; les rectangles et carrés sont des variantes de forme, pas un algorithme de remplissage. Un cadre sous une fenêtre peut créer une deuxième rangée localisée.

**Soubassement** : hauteur commune de référence depuis le sol, interrompue par les portes ; les fenêtres hautes ne doivent pas créer de faux conflits. La cimaise est une option future et ne doit pas être comptée dans les métrés tant qu'elle n'est pas dessinée.

**Mixte** : panneaux hauts et bas partagent, autant que possible, les axes verticaux. La hauteur de séparation est cohérente et ne traverse pas les ouvertures.

## Contrat d'interface du moteur
Entrée : `wall`, `obstacles[]`, `typology`, `shape`, `preferences` (facultatives).
Sortie : `candidates[]` contenant `panels[]`, `score`, `scoreBreakdown`, `explanations[]`, `warnings[]`, `metrics` ; `recommendedCandidateId` ou `null` avec raison.

Le moteur de proposition doit être **pur et déterministe**, testable sans navigateur. Les calculs de métrés sont dérivés des panneaux retenus, non des préférences de l'utilisateur.

## Recette obligatoire avant fusion de PR #2
- Mur sans obstacle : proposition équilibrée et cohérente avec la typologie.
- Mur 435 × 247 cm, plinthes 12, corniche 5, porte 83 × 204 à X=100/Y=0, fenêtre 110 × 120 à X=277,1/Y=104 : proposition non vide et explicable, sans « colonne 2 insuffisante » si une alternative faisable existe.
- Fenêtre avec radiateur centré : aucune collision, cadre sous fenêtre seulement si le dégagement le permet.
- Soubassement avec porte : interruption propre, ligne de hauteur commune.
- Mixte avec fenêtre : axes hauts/bas cohérents.
- Mur étroit, fenêtres multiples, paramètres impossibles : aucun panneau invalide, message de diagnostic utile.
- Changement de typologie, déplacement tactile, sauvegarde/restauration : résultat et métrés synchronisés.
- Comparer au moins trois propositions sur les murs de référence ; inspecter visuellement sur iPhone avant fusion.

## Hors périmètre
IA générative, reconnaissance photographique, rendu photoréaliste, optimisation exacte des chutes et éditeur libre de chaque panneau. Ces fonctions ne sont pas nécessaires pour démontrer la valeur du moteur de règles.
