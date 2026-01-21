# Feature Specification: Airsoft Operations CMS - Objectifs Spécifiques

**Date**: 2025-10-22
**Author**: Crafted SaaS Team
**Target Level**: Balanced
**Platform**: Web Only (Mobile-First Design)

---

## 📋 User Stories - Objectifs Spécifiques

### US-014: Créer et Gérer des Antennes

**Level**: Balanced
**Platform**: Web Only
**Estimation**: L

#### Context
En tant qu'organisateur, je veux créer des antennes qui peuvent être piratées et récupérées, avec des états dynamiques et une visibilité conditionnelle. Les antennes changent de propriétaire au cours de la partie et ont une interface dédiée pour leur gestion en temps réel.

#### Acceptance Criteria

**Création (Admin):**
- [ ] Formulaire: nom de l'antenne, description, camp propriétaire initial
- [ ] Localisation: texte libre ou coordonnées GPS
- [ ] Choisir méthode de déblocage: énigme, mini-jeu hacking (Simon, séquence, code couleur), code physique à saisir, ou bouton simple
- [ ] Configurer mini-jeu si sélectionné: difficulté (facile/moyen/difficile), nombre d'étapes (3-10)
- [ ] Générer QR code unique pour l'antenne
- [ ] Points attribués au piratage (50-500 points configurables)
- [ ] Temps de cooldown avant re-piratage (5-30 minutes)
- [ ] Option: points récurrents pour possession (ex: +10 points/minute)

**En Jeu (Joueur):**
- [ ] Vue liste des antennes avec filtres: Toutes / Connectées / Piratées / Hors ligne
- [ ] **Antennes connectées** (vertes): celles possédées par mon camp et fonctionnelles
- [ ] **Antennes piratées** (orange): celles que mon camp a piratées (en cours de prise de contrôle)
- [ ] **Antennes hors ligne** (rouges): celles que mon camp possédait et qui ont été piratées
- [ ] **Antennes ennemies**: totalement invisibles jusqu'au premier scan/piratage
- [ ] Scanner QR antenne → Affichage méthode de déblocage → Résolution → Changement de propriétaire
- [ ] Notification push au camp qui perd l'antenne: "Antenne [Nom] piratée !"
- [ ] Timer de cooldown visible: "Antenne protégée pendant 12:34"
- [ ] Historique des propriétaires: "Bleus → Rouges → Bleus"

**États dynamiques:**
- [ ] CONNECTEE: Appartient à mon camp, génère des points
- [ ] EN_PIRATAGE: Quelqu'un résout le mini-jeu (timer visible pour propriétaire actuel)
- [ ] PIRATEE: Changement de propriétaire effectué
- [ ] EN_COOLDOWN: Impossible de re-pirater pendant X minutes (compte à rebours)
- [ ] DESACTIVEE: Organisateur peut désactiver temporairement une antenne

#### UI/UX Notes
- Page admin: `/operations/[id]/objectives/antennas` - Liste avec statuts en temps réel
- Formulaire création avec preview du mini-jeu sélectionné
- Page joueur: `/game/antennas` - Cards colorées par état avec icônes
- Carte interactive montrant position des antennes visibles (masque ennemies)
- Animation de transfert lors du piratage (transition de couleur)
- Son d'alerte différent selon: gain d'antenne (victoire) ou perte (alerte)
- Badge du nombre d'antennes par camp dans le header

---

### US-015: Créer et Gérer des VIP

**Level**: Balanced
**Platform**: Web Only
**Estimation**: M

#### Context
En tant qu'organisateur, je veux créer des VIP qui révèlent des informations secrètes une fois scannés par l'équipe adverse. Les VIP ont un profil public et des données cachées qui se débloquent au scan.

#### Acceptance Criteria

**Création (Admin):**
- [ ] Formulaire: nom du VIP, callsign, camp d'appartenance
- [ ] Photo/avatar du VIP (upload)
- [ ] Informations publiques: grade, fonction (toujours visibles)
- [ ] Informations secrètes: texte libre, images, coordonnées GPS, codes d'accès
- [ ] Assigner QR code VIP à un membre spécifique de l'équipe (liaison)
- [ ] Points attribués au scan du VIP (100-1000 points)
- [ ] Option: le VIP peut être "éliminé" après scan (devient inactif)
- [ ] Option: informations révélées progressivement (scan 1 → infos basiques, scan 2 → infos complètes)

**En Jeu (Joueur):**
- [ ] Vue liste des VIP avec filtres: Tous / Amis / Ennemis / Scannés
- [ ] **VIP amis** (mon camp): toutes infos visibles, QR code affiché
- [ ] **VIP ennemis non scannés**: nom + callsign visibles, infos masquées (icône cadenas)
- [ ] **VIP ennemis scannés**: toutes infos révélées avec badge "SCANNÉ"
- [ ] Scanner QR VIP ennemi → Révélation infos + attribution points + notification camp adverse
- [ ] Détail VIP: photo, grade, fonction, infos secrètes (texte, images, localisation)
- [ ] Historique des scans: "Scanné par Ghost (Team Alpha) à 14:32"
- [ ] Option partage d'infos: envoyer infos VIP scanné aux coéquipiers

**États dynamiques:**
- [ ] ACTIF: VIP en jeu, non scanné
- [ ] SCANNE: VIP repéré, infos révélées
- [ ] ELIMINE: VIP hors jeu (si option activée)

#### UI/UX Notes
- Page admin: `/operations/[id]/objectives/vips` - Galerie avec photos
- Formulaire avec upload photo et éditeur riche pour infos secrètes
- Page joueur: `/game/vips` - Cards avec effet "flip" (recto: infos publiques, verso: infos secrètes si scannées)
- Modal détaillée au clic sur VIP avec toutes les infos
- Badge "SCANNÉ" rouge vif sur la card
- Notification push: "VIP [Nom] scanné par l'ennemi !" (pour camp du VIP)
- Son spécial "mission accomplie" au scan d'un VIP ennemi

---

### US-016: Créer et Gérer des Zones GPS

**Level**: Balanced
**Platform**: Web Only
**Estimation**: L

#### Context
En tant qu'organisateur, je veux créer des zones GPS que les joueurs doivent capturer en restant sur place pendant une durée définie. Les zones ont des états dynamiques et affichent les joueurs présents en temps réel.

#### Acceptance Criteria

**Création (Admin):**
- [ ] Formulaire: nom de la zone, description
- [ ] Définir périmètre: coordonnées GPS centre + rayon en mètres (10-100m)
- [ ] Outil carte interactive: cliquer pour placer zone, ajuster rayon visuellement
- [ ] Durée de capture requise: 1-30 minutes de présence continue
- [ ] Points attribués à la capture (100-500 points)
- [ ] Option: points récurrents pendant contrôle (ex: +5 points/minute)
- [ ] Camp initial propriétaire (ou neutre au départ)
- [ ] Option: zone contestable (adversaire peut voler la zone en y restant plus longtemps)

**En Jeu (Joueur):**
- [ ] Vue liste des zones avec filtres: Toutes / Contrôlées / En capture / Neutres / Ennemies
- [ ] **Zones contrôlées** (vertes): possédées par mon camp
- [ ] **Zones en capture** (orange clignotant): je suis dedans, timer en cours
- [ ] **Zones neutres** (grises): non contrôlées
- [ ] **Zones ennemies** (rouges): possédées par adversaire
- [ ] Carte interactive: cercles colorés montrant zones, ma position en temps réel
- [ ] Entrer dans zone → Notification "Capture en cours" → Timer démarre
- [ ] Barre de progression: "3:45 / 10:00 dans la zone"
- [ ] Sortir de la zone → Timer pause ou reset (configurable par admin)
- [ ] Liste des coéquipiers présents dans la même zone
- [ ] Notification si adversaire entre dans une zone contrôlée (alerte contestation)

**États dynamiques:**
- [ ] NEUTRE: Non contrôlée
- [ ] EN_CAPTURE: Timer en cours pour un camp
- [ ] CONTROLEE: Appartient à un camp
- [ ] CONTESTEE: Deux camps présents simultanément (timer pause ou bataille)

#### UI/UX Notes
- Page admin: `/operations/[id]/objectives/zones` - Carte avec toutes les zones
- Éditeur carte: drag & drop pour placer zone, slider pour rayon
- Page joueur: `/game/zones` - Carte plein écran avec ma position GPS
- Cercles colorés pour zones (transparence pour voir terrain dessous)
- Vibration + son en entrant/sortant de zone
- Timer fixé en haut d'écran avec barre de progression circulaire
- Mode économie batterie: GPS polling toutes les 10s (pas continu)
- Alerte batterie faible: "GPS consomme, 15% restant"

---

### US-017: Créer et Gérer des Collectes d'Items

**Level**: Balanced
**Platform**: Web Only
**Estimation**: M

#### Context
En tant qu'organisateur, je veux créer des objectifs où les joueurs doivent scanner plusieurs QR codes (documents, objets) pour compléter une collection. La progression est visible et partagée dans le camp.

#### Acceptance Criteria

**Création (Admin):**
- [ ] Formulaire: nom de la collection, description
- [ ] Définir nombre d'items requis vs total: "Scanner 3 documents sur 5 disponibles"
- [ ] Créer chaque item: nom, description, localisation indicative
- [ ] Générer QR code unique par item
- [ ] Choisir si items doivent être scannés dans un ordre spécifique ou libre
- [ ] Points attribués: par item (partiel) et/ou à la complétion totale (bonus)
- [ ] Option: items uniques (un seul camp peut les scanner) ou partagés

**En Jeu (Joueur):**
- [ ] Vue collection avec progression: "2/3 documents trouvés"
- [ ] Liste des items: ✅ Scannés (verts) / ❌ Manquants (gris)
- [ ] Items scannés: nom, description complète, qui l'a scanné, quand
- [ ] Items manquants: nom uniquement (description cachée), indices de localisation
- [ ] Scanner QR item → Validation + ajout à la collection + points
- [ ] Notification au camp: "Ghost a trouvé le Document Alpha !"
- [ ] Barre de progression globale de la collection
- [ ] Au dernier item: animation de complétion + bonus de points

**États dynamiques (par item):**
- [ ] NON_TROUVE: Pas encore scanné
- [ ] TROUVE: Scanné par mon camp
- [ ] VERROUILLE: Scanné par camp adverse (si items uniques)

#### UI/UX Notes
- Page admin: `/operations/[id]/objectives/collections` - Liste avec aperçu items
- Page création: ajouter items un par un avec bouton "+ Nouvel item"
- Page joueur: `/game/collections/[id]` - Style checklist avec icônes
- Animation confettis à la complétion de la collection
- Partage dans le chat camp: "2/3 items trouvés, manque le Document Charlie"

---

### US-018: Créer et Gérer des Énigmes Multi-Étapes

**Level**: Balanced
**Platform**: Web Only
**Estimation**: L

#### Context
En tant qu'organisateur, je veux créer des chaînes d'énigmes où chaque bonne réponse débloque l'énigme suivante. Les joueurs progressent étape par étape avec possibilité d'indices.

#### Acceptance Criteria

**Création (Admin):**
- [ ] Formulaire: nom de la chaîne, description globale
- [ ] Définir nombre d'étapes: 2-10 énigmes séquentielles
- [ ] Pour chaque étape: type (QCM, texte, numérique, image), question, réponse(s), médias
- [ ] Configurer indices par étape: texte d'indice, débloqué après X tentatives échouées
- [ ] Pénalité globale: temps d'attente entre tentatives échouées (1-10 min)
- [ ] Points: par étape (progressif) et/ou bonus final à la complétion
- [ ] Option: limite de temps globale (ex: 30 minutes pour tout résoudre)

**En Jeu (Joueur):**
- [ ] Vue progression: "Étape 2/5" avec barre de progression
- [ ] Affichage énigme actuelle uniquement (étapes suivantes masquées)
- [ ] Interface adaptée au type: QCM avec boutons, input texte, zone cliquable sur image
- [ ] Soumettre réponse → Validation serveur → Bonne: étape suivante / Mauvaise: pénalité
- [ ] Compteur tentatives échouées: "2 erreurs, indice disponible"
- [ ] Bouton "Afficher l'indice" (débloqué conditionnellement)
- [ ] Timer global si limite de temps activée (compte à rebours)
- [ ] Historique des étapes complétées avec réponses données

**États dynamiques (par étape):**
- [ ] VERROUILLEE: Pas encore accessible
- [ ] EN_COURS: Étape actuelle
- [ ] COMPLETEE: Bonne réponse donnée
- [ ] ECHOUEE: Trop de tentatives ou temps écoulé

#### UI/UX Notes
- Page admin: `/operations/[id]/objectives/riddle-chains` - Vue en accordéon des étapes
- Éditeur par étape avec preview du rendu mobile
- Page joueur: `/game/riddle-chains/[id]` - Une seule énigme visible à la fois
- Animation de transition entre étapes (slide ou fade)
- Bouton "Indice" pulsant quand disponible
- Feedback immédiat: ✅ vert pour bonne réponse, ❌ rouge pour erreur
- Écran de victoire final avec récapitulatif du temps et des erreurs

---

### US-019: Créer et Gérer des Défenses de Point

**Level**: Balanced
**Platform**: Web Only
**Estimation**: M

#### Context
En tant qu'organisateur, je veux créer des objectifs où un camp doit défendre un point pendant une durée en empêchant l'adversaire de scanner le QR code. Si l'adversaire scanne, le timer reset.

#### Acceptance Criteria

**Création (Admin):**
- [ ] Formulaire: nom du point, description, localisation
- [ ] Camp défenseur initial
- [ ] Durée de défense requise: 10-60 minutes continues
- [ ] Générer QR code du point à défendre
- [ ] Points attribués: au défenseur si succès, à l'attaquant si scan réussi
- [ ] Option: nombre maximum de scans adverses avant échec automatique (ex: 3 scans = perte)

**En Jeu (Joueur - Camp Défenseur):**
- [ ] Vue objectif: "Défendre pendant 30:00"
- [ ] Timer en cours: "18:32 / 30:00 défendues"
- [ ] Alerte si scan ennemi: "ALERTE ! Timer réinitialisé" + son d'alarme
- [ ] Compteur de scans ennemis: "2/3 scans adverses"
- [ ] Barre de progression vers la victoire

**En Jeu (Joueur - Camp Attaquant):**
- [ ] Vue objectif: "Pirater le point défendu"
- [ ] Scanner QR → Reset du timer adverse → Points attribués
- [ ] Voir timer actuel de l'adversaire: "Ils défendent depuis 12:45"
- [ ] Notification après scan: "Timer adverse réinitialisé !"

**États dynamiques:**
- [ ] EN_DEFENSE: Timer en cours, défenseur protège
- [ ] INTERROMPU: Scan ennemi, timer reset
- [ ] COMPLETE: Durée atteinte, défense réussie
- [ ] ECHOUE: Trop de scans ennemis

#### UI/UX Notes
- Page admin: `/operations/[id]/objectives/defenses` - Liste avec durées
- Page joueur: `/game/defenses/[id]` - Grand timer circulaire
- Pour défenseur: écran vert avec timer, pour attaquant: écran rouge avec bouton "Scanner"
- Vibration forte + son alerte au scan ennemi (défenseur)
- Notification push: "Point sous attaque !"

---

### US-020: Créer et Gérer des Sabotages Temporisés

**Level**: Balanced
**Platform**: Web Only
**Estimation**: S

#### Context
En tant qu'organisateur, je veux créer des objectifs où le joueur scanne un QR puis doit attendre un délai avant validation automatique (simulation de bombe, sabotage qui prend du temps).

#### Acceptance Criteria

**Création (Admin):**
- [ ] Formulaire: nom du sabotage, description
- [ ] Générer QR code du point de sabotage
- [ ] Délai avant validation: 5-60 minutes
- [ ] Points attribués à la validation automatique
- [ ] Option: le camp adverse peut "désamorcer" en scannant pendant le délai

**En Jeu (Joueur - Camp Saboteur):**
- [ ] Scanner QR → Message "Sabotage en cours..."
- [ ] Timer compte à rebours: "Validation dans 12:34"
- [ ] Notification à la validation: "Sabotage réussi ! +200 points"
- [ ] Rester sur place optionnel ou pouvoir partir

**En Jeu (Joueur - Camp Défenseur):**
- [ ] Alerte si sabotage déclenché: "Sabotage détecté au Point Alpha !"
- [ ] Possibilité de scanner pour désamorcer (si option activée)
- [ ] Timer visible: "Désamorçage dans 08:12"

**États dynamiques:**
- [ ] INACTIF: Pas encore scanné
- [ ] EN_COURS: Timer en cours après scan
- [ ] VALIDE: Délai écoulé, sabotage réussi
- [ ] DESAMORCE: Adversaire a scanné pendant le délai

#### UI/UX Notes
- Page admin: `/operations/[id]/objectives/sabotages` - Liste avec délais
- Page joueur: `/game/sabotages/[id]` - Timer circulaire rouge style "bombe"
- Animation pulsation du timer (accélère en fin de compte à rebours)
- Son de "tic-tac" optionnel (activable/désactivable)

---

### US-021: Créer et Gérer des Objectifs avec Mini-Jeux de Hacking

**Level**: Balanced
**Platform**: Web Only
**Estimation**: L

#### Context
En tant qu'organisateur, je veux créer des objectifs débloqués via des mini-jeux interactifs (Simon, séquence de codes, puzzle) pour rendre le gameplay plus immersif qu'une simple énigme textuelle.

#### Acceptance Criteria

**Création (Admin):**
- [ ] Formulaire: nom de l'objectif, description
- [ ] Générer QR code
- [ ] Choisir type de mini-jeu: Simon (mémoire), Séquence de codes (suite logique), Code couleur, Puzzle slider
- [ ] Configurer difficulté: facile (3-4 étapes), moyen (5-7), difficile (8-10)
- [ ] Points attribués à la réussite
- [ ] Nombre de tentatives max avant échec (1-5)
- [ ] Pénalité entre tentatives: 1-10 minutes

**En Jeu (Joueur):**
- [ ] Scanner QR → Affichage du mini-jeu en plein écran
- [ ] **Simon**: mémoriser et reproduire séquence de couleurs/sons (longueur croissante)
- [ ] **Séquence**: compléter suite logique de nombres ou symboles
- [ ] **Code couleur**: trouver combinaison de 4 couleurs (style Mastermind)
- [ ] **Puzzle slider**: reconstituer image découpée en 9 cases
- [ ] Timer optionnel par mini-jeu (pression temporelle)
- [ ] Feedback immédiat: vibration + son pour bonne/mauvaise action
- [ ] Écran de réussite avec confettis + attribution points
- [ ] Écran d'échec avec pénalité visible: "Nouvelle tentative dans 05:00"

**États dynamiques:**
- [ ] VERROUILLE: Non encore scanné
- [ ] EN_JEU: Mini-jeu en cours
- [ ] REUSSI: Mini-jeu complété
- [ ] ECHOUE: Trop de tentatives ratées
- [ ] EN_PENALITE: Attente avant nouvelle tentative

#### UI/UX Notes
- Page admin: `/operations/[id]/objectives/minigames` - Galerie avec preview des mini-jeux
- Testeur de mini-jeu en mode admin pour valider difficulté
- Page joueur: `/game/minigames/[id]` - Plein écran, interface tactile optimisée
- Gros boutons colorés pour Simon (min 60x60px)
- Animations fluides et sons immersifs (bips, clics)
- Mode paysage forcé pour meilleure expérience de jeu

---

### US-022: Créer et Gérer des Objectifs avec Code Physique

**Level**: Balanced
**Platform**: Web Only
**Estimation**: S

#### Context
En tant qu'organisateur, je veux créer des objectifs débloqués en saisissant un code alphanumérique imprimé physiquement sur le terrain (panneau, boîte, document). Simple mais efficace pour validation manuelle.

#### Acceptance Criteria

**Création (Admin):**
- [ ] Formulaire: nom de l'objectif, description, localisation indicative
- [ ] Définir code alphanumérique (4-12 caractères): ex "ALPHA-2024", "7463"
- [ ] Option: sensibilité casse (respecter majuscules/minuscules ou non)
- [ ] Générer document imprimable avec le code (QR optionnel pour redirection vers page de saisie)
- [ ] Points attribués à la saisie correcte
- [ ] Nombre de tentatives max: illimité ou limité (3-10)
- [ ] Pénalité entre tentatives: aucune ou 1-10 minutes

**En Jeu (Joueur):**
- [ ] Page de saisie: grand champ input avec clavier optimisé
- [ ] Placeholder: "Saisir le code trouvé sur place"
- [ ] Bouton "Valider" bien visible
- [ ] Feedback immédiat: ✅ code correct → points + animation / ❌ code incorrect → message d'erreur
- [ ] Compteur tentatives restantes si limité: "2/3 tentatives"
- [ ] Historique des codes saisis (masqués: "A***4")

**États dynamiques:**
- [ ] ACTIF: En attente de saisie
- [ ] VALIDE: Code correct saisi
- [ ] ECHOUE: Trop de tentatives incorrectes
- [ ] EN_PENALITE: Attente avant nouvelle tentative

#### UI/UX Notes
- Page admin: `/operations/[id]/objectives/codes` - Liste avec codes masqués (●●●●)
- Générateur de document imprimable: A4 avec code en gros, instructions, logo OP
- Page joueur: `/game/codes/[id]` - Input géant, clavier alphanumérique
- Validation insensible aux espaces (nettoyage auto)
- Animation shake si code incorrect
- Son de "beep" d'erreur vs "ding" de succès

---

### US-023: Créer et Gérer des Objectifs Aléatoires (Pool d'Énigmes)

**Level**: Balanced
**Platform**: Web Only
**Estimation**: M

#### Context
En tant qu'organisateur, je veux créer des objectifs qui tirent une énigme au hasard dans un pool à chaque nouvelle partie, pour éviter que les joueurs connaissent les réponses à l'avance.

#### Acceptance Criteria

**Création (Admin):**
- [ ] Formulaire: nom de l'objectif, description
- [ ] Créer un pool d'énigmes (minimum 3, maximum 20): chaque énigme avec question + réponse
- [ ] Types mixtes: QCM, texte, numérique
- [ ] Option: chaque équipe/joueur reçoit une énigme différente du pool
- [ ] Points attribués identiques quelle que soit l'énigme tirée
- [ ] Configuration pénalité: identique pour toutes les énigmes du pool

**En Jeu (Joueur):**
- [ ] À l'activation de l'objectif: tirage aléatoire d'une énigme du pool
- [ ] Affichage de l'énigme tirée (interface standard énigme)
- [ ] Une fois tirée, l'énigme reste la même pour ce joueur/équipe (pas de re-tirage)
- [ ] Résolution identique aux énigmes classiques

**États dynamiques:**
- [ ] INACTIF: Pool créé, pas encore tiré
- [ ] TIRE: Énigme sélectionnée aléatoirement
- [ ] EN_COURS: Joueur résout l'énigme
- [ ] REUSSI/ECHOUE: États finaux

#### UI/UX Notes
- Page admin: `/operations/[id]/objectives/random-pools` - Liste des énigmes du pool
- Prévisualisation de toutes les énigmes possibles
- Indication du nombre d'énigmes dans le pool: "Pool de 8 énigmes"
- Page joueur: identique aux énigmes classiques (pas de différence visible)

---

### US-024: Créer et Gérer des Objectifs Course Contre la Montre

**Level**: Balanced
**Platform**: Web Only
**Estimation**: S

#### Context
En tant qu'organisateur, je veux créer des objectifs avec bonus de points selon la rapidité d'exécution, pour encourager la vitesse et la compétition.

#### Acceptance Criteria

**Création (Admin):**
- [ ] Formulaire: nom de l'objectif, description
- [ ] Lier à un objectif existant (QR, énigme, zone, etc.)
- [ ] Définir temps de référence: ex 10 minutes
- [ ] Barème de bonus: 
  - < 50% du temps: +50% de points (ex: fait en 5min → +50%)
  - < 75% du temps: +25% de points
  - > 100% du temps: points normaux, pas de bonus
- [ ] Affichage du chrono visible ou caché pour les joueurs

**En Jeu (Joueur):**
- [ ] Chronomètre démarre à l'activation de l'objectif (scan QR, entrée zone, etc.)
- [ ] Timer visible en haut d'écran: "Temps écoulé: 03:24"
- [ ] Indicateur de bonus: pastille verte "Bonus +50% !" si dans les temps
- [ ] À la complétion: message "Objectif complété en 4:12 → Bonus +25% !"
- [ ] Comparaison avec temps de référence: "2 min plus rapide que prévu !"

**États dynamiques:**
- [ ] EN_COURS: Timer en cours
- [ ] COMPLETE_RAPIDE: Fini avant temps de référence (bonus)
- [ ] COMPLETE_NORMAL: Fini dans les temps (pas de bonus)
- [ ] COMPLETE_LENT: Fini après temps de référence (malus optionnel)

#### UI/UX Notes
- Page admin: `/operations/[id]/objectives/time-races` - Configuration barème bonus
- Simulateur: estimer temps de référence réaliste
- Page joueur: timer bien visible, couleur change selon bonus (vert → orange → rouge)
- Son de "tic-tac" accéléré dans les dernières minutes (optionnel)

---

### US-025: Créer et Gérer des Événements Live

**Level**: Balanced
**Platform**: Web Only
**Estimation**: M

#### Context
En tant qu'organisateur, je veux pouvoir déclencher manuellement des objectifs surprises en plein milieu d'une OP pour dynamiser le gameplay et surprendre les joueurs.

#### Acceptance Criteria

**Création (Admin):**
- [ ] Créer des objectifs pré-configurés marqués comme "Événement Live"
- [ ] Ces objectifs ne sont pas visibles initialement pour les joueurs
- [ ] Configurer: type d'objectif (QR, énigme, zone, etc.), points, durée de validité
- [ ] Option: assigner à un camp spécifique ou tous les camps

**En Jeu (Admin - Dashboard Live):**
- [ ] Liste des événements live disponibles (boutons "Déclencher")
- [ ] Cliquer "Déclencher" → Confirmation → Activation immédiate
- [ ] Notification push envoyée à tous les joueurs concernés
- [ ] Option: ajouter un message personnalisé au déclenchement ("Nouvelle mission !")
- [ ] Timer de validité: événement actif pendant X minutes puis désactivation auto

**En Jeu (Joueur):**
- [ ] Notification push: "⚡ ÉVÉNEMENT SURPRISE !" avec vibration
- [ ] Nouvel objectif apparaît en haut de liste avec badge "LIVE"
- [ ] Timer de validité visible: "Disponible pendant 15:00"
- [ ] Traitement identique à un objectif classique selon son type
- [ ] Disparaît de la liste si non complété avant expiration du timer

**États dynamiques:**
- [ ] PREPARE: Créé mais pas encore déclenché
- [ ] ACTIF: Déclenché, visible et jouable
- [ ] EXPIRE: Timer écoulé, plus accessible
- [ ] COMPLETE: Objectif rempli pendant sa validité

#### UI/UX Notes
- Page admin: `/operations/[id]/live-events` - Liste avec bouton "Déclencher" rouge vif
- Modal confirmation avant déclenchement
- Dashboard live: section dédiée "Événements à déclencher"
- Page joueur: badge "⚡ LIVE" rouge clignotant sur la card objectif
- Son dramatique lors de la notification (fanfare)
- Animation d'apparition de la card (slide from top)

---

## Recommended Implementation Order (Objectifs)

1. **US-014** - Antennes (objectif le plus complexe, base pour les autres)
2. **US-022** - Code physique (le plus simple, pour valider l'architecture)
3. **US-015** - VIP (logique intermédiaire)
4. **US-016** - Zones GPS (validation géolocalisation)
5. **US-017** - Collecte d'items (réutilise QR + progression)
6. **US-020** - Sabotage temporisé (timers serveur)
7. **US-021** - Mini-jeux hacking (interface ludique)
8. **US-019** - Défense de point (timers + interaction camps)
9. **US-018** - Énigmes multi-étapes (chaînage logique)
10. **US-024** - Course contre la montre (bonus système)
11. **US-023** - Objectifs aléatoires (pooling)
12. **US-025** - Événements live (déclenchement manuel)