# Feature: Airsoft Operations CMS

**Target Level**: Balanced
**Platform**: Web Only (Mobile-First Design)

---

## User Stories

### US-001: Créer et Gérer une Équipe

**Level**: Balanced
**Platform**: Web Only
**Estimation**: M

#### Context
En tant qu'admin, je veux créer mon équipe airsoft et gérer mes membres pour organiser notre participation aux OPs. Les équipes sont l'entité principale du système, chaque équipe a des admins qui gèrent les membres.

#### Acceptance Criteria
- [ ] Formulaire de création d'équipe: nom, slug unique, description, logo, couleur
- [ ] Ajouter des membres: nom, callsign, email (optionnel), téléphone, rôle (Admin/Captain/Player)
- [ ] Générer QR code unique par membre pour check-in
- [ ] Modifier/supprimer des membres
- [ ] Transférer ownership de l'équipe
- [ ] Dashboard équipe avec stats (OPs jouées, objectifs complétés, MVPs)
- [ ] Design responsive mobile-first avec boutons tactiles (min 44x44px)

#### UI/UX Notes
- Page `/teams/new` - Wizard création équipe
- Page `/teams/[slug]` - Dashboard équipe avec onglets (Membres, Stats, OPs)
- Import CSV pour ajout en masse de membres
- Cartes membres avec QR code visible
- Mode sombre par défaut pour utilisation terrain

---

### US-002: Créer une Opération Multi-Équipes

**Level**: Balanced
**Platform**: Web Only
**Estimation**: L

#### Context
En tant qu'admin d'équipe, je veux créer une OP et inviter d'autres équipes en co-admin pour organiser ensemble. Une OP peut avoir plusieurs équipes propriétaires avec différents niveaux de permissions.

#### Acceptance Criteria
- [ ] Formulaire de création avec: nom, description, date/heure, localisation GPS, durée (minutes)
- [ ] Upload d'image de couverture optionnel
- [ ] Inviter d'autres équipes comme co-admin (recherche par slug ou nom)
- [ ] Définir les rôles: Creator (tous droits), Co-admin (modifier), Viewer (lecture seule)
- [ ] Liste des équipes propriétaires avec gestion des permissions
- [ ] Sauvegarde en brouillon avant publication
- [ ] Notifications aux équipes invitées par email

#### UI/UX Notes
- Wizard en 4 étapes: Infos générales → Camps → Équipes → Objectifs
- Recherche d'équipes avec autocomplete
- Prévisualisation de la carte avec localisation GPS (Leaflet)
- Badge de rôle visible sur chaque équipe propriétaire
- Bouton "Publier" désactivé tant que configuration incomplète

---

### US-003: Définir les Camps et Assigner les Équipes

**Level**: Balanced
**Platform**: Web Only
**Estimation**: M

#### Context
En tant qu'organisateur, je veux créer plusieurs camps (factions) dans mon OP et y assigner les équipes participantes. Chaque OP a entre 2 et 4 camps, et chaque équipe ne peut être assignée qu'à un seul camp.

#### Acceptance Criteria
- [ ] Créer 2-4 camps par OP: nom (ex: OTAN, OPFOR, Rebelles), couleur, description
- [ ] Assigner une ou plusieurs équipes à chaque camp
- [ ] Une équipe ne peut être assignée qu'à un seul camp par OP
- [ ] Réorganiser l'ordre des camps par drag & drop
- [ ] Voir le score global du camp (somme des scores des équipes)
- [ ] Prévisualisation visuelle de la répartition équipes/camps
- [ ] Validation: chaque camp doit avoir au moins 1 équipe

#### UI/UX Notes
- Interface visuelle avec cartes de camps colorées
- Drag & drop des équipes vers les camps
- Couleurs prédéfinies: Bleu (#3b82f6), Rouge (#ef4444), Vert (#10b981), Jaune (#f59e0b)
- Indicateur du nombre d'équipes par camp
- Message d'erreur si tentative d'assigner une équipe déjà assignée

---

### US-004: Builder d'Objectifs par Blocs

**Level**: Balanced
**Platform**: Web Only
**Estimation**: XL

#### Context
En tant qu'organisateur, je veux assembler des objectifs comme des briques Lego et les assigner à des camps spécifiques pour créer mon scénario étape par étape.

#### Acceptance Criteria
- [ ] Interface drag & drop pour organiser les objectifs
- [ ] Bibliothèque de 15 types d'objectifs pré-configurés (sidebar)
- [ ] Configuration de chaque bloc: titre, description, points, camp assigné
- [ ] Définir des dépendances: objectif B débloqué après objectif A
- [ ] Timeline visuelle pour voir l'enchaînement des objectifs
- [ ] Duplication d'objectifs existants
- [ ] Assigner un objectif à un camp spécifique ou "Tous les camps"
- [ ] Templates d'objectifs réutilisables

#### UI/UX Notes
- Style "Notion-like" avec blocs déplaçables
- Sidebar avec catégories: Scan, Énigme, GPS, Combat, Stealth, Dynamique
- Prévisualisation mobile pour voir le rendu joueur
- Validation des dépendances circulaires (alerte si détectée)
- Filtrage des objectifs par camp (code couleur)
- Icônes distinctes par type d'objectif

---

### US-005: Générateur de QR Codes

**Level**: Balanced
**Platform**: Web Only
**Estimation**: M

#### Context
En tant qu'organisateur, je veux générer et imprimer des QR codes liés à mes objectifs et à mes membres pour le déploiement sur le terrain.

#### Acceptance Criteria
- [ ] Génération automatique de QR code unique par objectif avec token sécurisé
- [ ] Génération de QR code par membre pour check-in
- [ ] Page d'impression avec multiple QR codes par page (layouts: 1, 4, 9, 16 QR/page)
- [ ] Export PDF avec instructions textuelles par QR
- [ ] Identification visuelle du type de QR: objectif (avec camp) vs membre (avec équipe)
- [ ] QR codes avec couleur du camp/équipe assigné
- [ ] Régénération possible si QR compromis
- [ ] Instructions pour plastification/protection étanche

#### UI/UX Notes
- Prévisualisation avant impression
- Layout personnalisable selon format étiquettes
- Texte descriptif sous chaque QR: "Objectif: Pirater l'antenne" ou "Membre: Ghost (Team Alpha)"
- Option "Imprimer tout" vs sélection individuelle
- Suggestion de matériel: étiquettes autocollantes, pochettes plastifiées

---

### US-006: Configuration des 15 Types d'Objectifs

**Level**: Balanced
**Platform**: Web Only
**Estimation**: XL

#### Context
En tant qu'organisateur, je veux configurer chacun des 15 types d'objectifs avec leurs paramètres spécifiques pour créer des scénarios variés et immersifs.

#### Acceptance Criteria

**Objectifs Basiques:**
- [ ] **QR Simple**: Scanner pour valider immédiatement
- [ ] **QR + Énigme**: Scanner puis résoudre énigme (QCM, texte, nombre, image, audio)
- [ ] **Capture de Zone GPS**: Rester X minutes dans périmètre (rayon configurable)
- [ ] **Élimination VIP**: Scanner QR d'un membre adverse désigné
- [ ] **Collecte d'Items**: Scanner X QR codes sur Y requis (ex: 3 sur 5 documents)

**Objectifs Avancés:**
- [ ] **Énigme Multi-Étapes**: Chaîne d'énigmes séquentielles (2-5 étapes)
- [ ] **Défense de Point**: Empêcher adversaires de scanner pendant X minutes
- [ ] **Sabotage Temporisé**: Scanner puis attendre délai avant validation automatique
- [ ] **Objectif Conditionnel**: Débloqué uniquement si objectif parent complété
- [ ] **Morse/Radio**: Décoder message audio en morse ou code radio
- [ ] **Piratage d'Antenne**: Mini-jeu de hacking (Simon, séquence de codes)
- [ ] **Négociation**: QCM diplomatique avec conséquences sur score

**Objectifs Dynamiques:**
- [ ] **Aléatoire**: Pool d'énigmes, différent à chaque partie
- [ ] **Course Contre la Montre**: Bonus de points selon rapidité d'exécution
- [ ] **Évènement Live**: Organisateur déclenche objectif surprise en direct pendant l'OP

#### UI/UX Notes
- Formulaire adaptatif: champs différents selon type sélectionné
- Preview du rendu mobile par type avant publication
- Templates pré-configurés: "Pirater antenne standard", "Escorte VIP classique"
- Aide contextuelle avec exemples pour chaque type
- Validation des paramètres obligatoires selon le type

---

### US-007: Configuration d'Énigmes avec Pénalités

**Level**: Balanced
**Platform**: Web Only
**Estimation**: L

#### Context
En tant qu'organisateur, je veux créer des énigmes avec système de pénalité en cas d'échec pour challenger les joueurs sans les bloquer définitivement.

#### Acceptance Criteria
- [ ] Types d'énigmes: QCM (choix unique/multiple), texte libre, numérique, image cliquable, audio à décoder
- [ ] Upload de médias: images (JPEG, PNG), audio (MP3, WAV)
- [ ] Définir réponse(s) correcte(s) et variantes acceptables (insensible casse/accents)
- [ ] Configuration de pénalité: temps d'attente (1-30 minutes) avant nouvelle tentative
- [ ] Nombre de tentatives max avant échec définitif (1-10)
- [ ] Indices déblocables progressivement après X tentatives échouées
- [ ] Preview du rendu mobile avec simulation de réponse

#### UI/UX Notes
- Éditeur WYSIWYG pour texte énigme avec mise en forme basique
- Banque d'énigmes communautaires réutilisables (marketplace)
- Bouton "Tester l'énigme" pour vérifier avant publication
- Gestion des variantes de réponses: "42", "quarante-deux", "quarante deux"
- Upload drag & drop pour médias
- Limite taille: 5MB pour images, 10MB pour audio

---

### US-008: Application Web Mobile - Check-in et Gameplay

**Level**: Balanced
**Platform**: Web Only
**Estimation**: XL

#### Context
En tant que membre d'équipe, je veux une interface web mobile-first pour check-in, scanner les QR codes et accomplir les objectifs pendant l'OP. L'interface doit être utilisable avec des gants et en conditions extérieures.

#### Acceptance Criteria
- [ ] Scan QR code membre pour check-in à l'OP (accès caméra)
- [ ] Liste des objectifs actifs/complétés/échoués pour mon camp
- [ ] Scan QR code objectif avec vibration de confirmation
- [ ] Interface de résolution d'énigmes intuitive et tactile
- [ ] Carte interactive avec zones GPS d'objectifs (Leaflet)
- [ ] Timer visible en permanence pour objectifs temporisés
- [ ] Notifications visuelles pour nouveaux objectifs débloqués
- [ ] Scoreboard en temps réel: score du camp et de l'équipe
- [ ] Mode offline pour zones sans réseau (sync automatique au retour)
- [ ] Validation GPS continue pour objectifs "Capture de Zone"

#### UI/UX Notes
- Design tactique/militaire avec mode sombre par défaut
- Gros boutons (min 44x44px) pour utilisation avec gants
- Contraste élevé pour lisibilité en plein soleil
- Sons et vibrations personnalisables (on/off)
- Indicateur de connexion réseau clair (vert/rouge)
- Message de confirmation visuel après chaque action
- Scanner QR en plein écran avec guide de cadrage
- Batterie GPS optimisée (polling toutes les 10s, pas continu)

---

### US-009: Dashboard Organisateur Temps Réel

**Level**: Balanced
**Platform**: Web Only
**Estimation**: L

#### Context
En tant qu'organisateur, je veux suivre la progression de tous les camps en temps réel et intervenir manuellement si besoin pendant le déroulement de l'OP.

#### Acceptance Criteria
- [ ] Vue globale: scores par camp, objectifs complétés/actifs, membres check-in
- [ ] Timeline des actions récentes: scans, validations, échecs, avec horodatage
- [ ] Carte interactive avec positions GPS des membres (si autorisé)
- [ ] Liste des membres check-in par équipe/camp avec statut en ligne
- [ ] Validation manuelle d'objectifs (ex: mission photo, cas particuliers)
- [ ] Déclencher évènements live: ajouter objectif surprise en cours de partie
- [ ] Chat/messages avec les camps pour clarifications
- [ ] Export rapport post-OP: statistiques, MVP, durées objectifs, timeline complète

#### UI/UX Notes
- Dashboard style "centre de commandement" avec widgets repositionnables
- Graphiques de progression en temps réel (bar charts, line charts)
- Alertes visuelles pour anomalies: QR scanné hors zone, tentatives suspectes
- Filtres: par camp, par équipe, par type d'objectif
- Rafraîchissement automatique toutes les 5 secondes (websockets)
- Bouton d'urgence "Pause OP" pour suspendre temporairement
- Mode spectateur public (optionnel): affichage scores sans contrôles

---

### US-010: Système de Scoring par Camp et Équipe

**Level**: Balanced
**Platform**: Web Only
**Estimation**: M

#### Context
En tant qu'organisateur, je veux configurer un système de points flexible qui se cumule par équipe et par camp pour déterminer le vainqueur.

#### Acceptance Criteria
- [ ] Points de base par type d'objectif (configurable: 50-500 points)
- [ ] Multiplicateurs: vitesse d'exécution (x1.5 si < 50% temps limite), difficulté (x1.2 pour énigmes multi-étapes)
- [ ] Pénalités: échec énigme (-10 points), détection (-20 points), temps dépassé (-5 points/minute)
- [ ] Score équipe = somme des objectifs complétés par ses membres
- [ ] Score camp = somme des scores de toutes les équipes du camp
- [ ] Règles de victoire: premier camp à X points OU meilleur score à fin de temps limite
- [ ] Preview/simulation de scoring avant publication

#### UI/UX Notes
- Templates de scoring: CTF (capture), Domination (zones), Accumulation (points purs)
- Graphique de balance camps en temps réel (courbes évolutives)
- Historique des variations de score avec événements associés
- Calculateur de points: simuler score selon actions
- Export CSV des scores finaux

---

### US-011: Gestion des Participations et Check-in

**Level**: Balanced
**Platform**: Web Only
**Estimation**: M

#### Context
En tant qu'organisateur, je veux gérer les participations des membres et orchestrer le check-in le jour J pour savoir qui est présent avant de démarrer l'OP.

#### Acceptance Criteria
- [ ] Voir liste de tous les membres des équipes assignées aux camps
- [ ] Scanner QR code membre pour check-in rapide (accès caméra)
- [ ] Vue des présents/absents en temps réel par équipe et par camp
- [ ] Envoi email/SMS de rappel 24h avant OP aux équipes
- [ ] Statistiques de présence: taux de check-in par équipe
- [ ] Export liste des présents (CSV, PDF)
- [ ] Désactiver check-in une fois OP démarrée

#### UI/UX Notes
- Page `/operations/[id]/checkin` avec scanner QR
- Filtres: par équipe, par camp, par statut (présent/absent)
- Indicateur visuel: pastille verte = présent, grise = absent
- Son de confirmation au check-in réussi
- Vue en grille avec photos/avatars des membres
- Compteur global: "32/45 membres présents"

---

### US-012: Objectifs Conditionnels et Chaînés

**Level**: Balanced
**Platform**: Web Only
**Estimation**: L

#### Context
En tant qu'organisateur, je veux créer des scénarios avec objectifs qui se débloquent dynamiquement selon des conditions pour créer des narrations complexes et des branches de décision.

#### Acceptance Criteria
- [ ] Définir conditions de déblocage: après objectif X complété, après Y minutes écoulées, si camp possède Z points
- [ ] Chaînage d'objectifs: arbre de décision avec branches alternatives
- [ ] Objectifs mutuellement exclusifs: choisir A ou B (pas les deux)
- [ ] Objectifs secrets révélés uniquement à un camp spécifique
- [ ] Vue graphique des dépendances: flowchart interactif (React Flow)
- [ ] Validation du scénario: détection de deadlocks (objectif impossible à débloquer)
- [ ] Simulation du déroulement avant publication

#### UI/UX Notes
- Éditeur visuel style "graph node" avec connexions
- Drag & drop des objectifs pour créer liens de dépendance
- Alerte rouge si deadlock détecté avec explication
- Mode simulation: "play" le scénario virtuellement étape par étape
- Couleurs des nœuds selon type et camp assigné
- Zoom/pan sur le graphe pour grandes OPs

---

### US-013: Bibliothèque de Templates

**Level**: Balanced
**Platform**: Web Only
**Estimation**: M

#### Context
En tant qu'organisateur, je veux accéder à des templates d'OPs populaires pour démarrer rapidement et partager mes propres créations avec la communauté.

#### Acceptance Criteria
- [ ] 10+ templates pré-faits: CTF, Escorte VIP, Domination, Infiltration, Défense de Base, etc.
- [ ] Prévisualisation du template: objectifs inclus, durée suggérée, nb joueurs recommandé
- [ ] Duplication et personnalisation du template (devient une copie modifiable)
- [ ] Partager mes OPs custom en templates publics (avec modération)
- [ ] Système de tags/recherche: type de jeu, durée (30min-3h), difficulté (1-5 étoiles), nb joueurs (10-100+)
- [ ] Notation et commentaires sur templates communautaires
- [ ] Badge "Officiel" vs "Communauté"

#### UI/UX Notes
- Galerie visuelle style "Netflix" avec grandes cards
- Filtres multiples: durée, joueurs, difficulté, type, tags
- Preview détaillée au survol: image, description, stats d'utilisation
- Bouton "Utiliser ce template" → wizard avec template pré-rempli
- Section "Mes templates" vs "Bibliothèque communautaire"
- Icônes pour type de jeu: 🎯 CTF, 🛡️ Défense, 🔍 Infiltration, etc.

---

## Recommended Implementation Order

1. **US-001** - Créer et gérer équipe (Foundation)
2. **US-002** - Créer opération multi-équipes
3. **US-003** - Définir camps et assigner équipes
4. **US-005** - Générateur QR codes (membres + objectifs)
5. **US-011** - Check-in et participations
6. **US-004** - Builder d'objectifs
7. **US-006** - Configuration types d'objectifs
8. **US-007** - Configuration énigmes
9. **US-008** - Interface mobile gameplay
10. **US-009** - Dashboard temps réel
11. **US-010** - Système scoring
12. **US-012** - Objectifs conditionnels
13. **US-013** - Bibliothèque templates

---

## Startup Commands

```bash
cd /path/to/project

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run dev server
pnpm dev

# Run tests
pnpm test
```

---

## Required Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend (emails)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```