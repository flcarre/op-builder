# TODO - Objectifs Avancés

**Date**: 2025-10-23
**Statut**: Phase 2 en cours (versions simplifiées)

---

## ✅ Complétés

### US-022: Code Physique (PHYSICAL_CODE)
- ✅ Validation de code avec sensibilité à la casse
- ✅ Limite de tentatives configurable
- ✅ Historique des tentatives
- ✅ Auto-complétion au bon code

---

## 🚧 En Cours - Phase 2

### US-015: VIP (VIP_ELIMINATION) - Version Simplifiée ✅

**Implémenté:**
- ✅ Scan QR révèle les informations secrètes
- ✅ Attribution de points au premier scan
- ✅ Marque le VIP comme "éliminé" (complétion unique)
- ✅ Configuration: points, texte info secrète

**Reste à faire:**
- [ ] **Photos/avatars**: Upload d'image pour le VIP
- [ ] **Informations publiques**: Grade, fonction (visibles avant scan)
- [ ] **Révélation progressive**: Multiple scans pour débloquer plus d'infos
- [ ] **Liaison membre**: Assigner le QR à un membre spécifique de l'équipe
- [ ] **États avancés**: ACTIF, SCANNE, ELIMINE avec transitions
- [ ] **Historique scans**: Tracking de qui a scanné quand
- [ ] **Partage d'infos**: Envoyer les infos révélées aux coéquipiers
- [ ] **Filtres**: Vue liste avec filtres Tous/Amis/Ennemis/Scannés
- [ ] **Visibilité conditionnelle**: VIP ennemis avec infos masquées (cadenas)
- [ ] **Notifications push**: Alerte au camp adverse quand VIP scanné
- [ ] **UI flip cards**: Animation recto-verso pour révélation
- [ ] **Son spécial**: Audio "mission accomplie" au scan

### US-020: Sabotage Temporisé (TIMED_SABOTAGE) - Version Simplifiée ✅

**Implémenté:**
- ✅ Scan QR initie un timer de sabotage
- ✅ Auto-complétion après délai configuré
- ✅ Attribution de points à la validation
- ✅ Configuration: durée délai, points

**Reste à faire:**
- [ ] **Timer côté serveur**: Validation automatique en background (cronjob/worker)
- [ ] **Désamorçage**: Camp adverse peut scanner pour annuler
- [ ] **États avancés**: EN_COURS, COMPLETE, DESAMORCE
- [ ] **Tracking saboteur**: Enregistrer qui a initié le sabotage
- [ ] **Notifications**: Alertes au saboteur et au camp adverse
- [ ] **Timer visible temps réel**: WebSocket pour sync live du compte à rebours
- [ ] **UI timer circulaire**: Animation style "bombe" avec pulsation
- [ ] **Son tic-tac**: Audio optionnel (activable/désactivable)
- [ ] **Historique tentatives**: Log des sabotages réussis/désamorcés
- [ ] **Multi-sabotages**: Gérer plusieurs sabotages simultanés
- [ ] **Cooldown**: Empêcher re-sabotage immédiat

---

## 📋 Phase 3 - Objectifs Restants

### US-014: Antennes (ANTENNA_HACK)
**Complexité**: XL
**Priorité**: Haute (base pour autres objectifs)

**Fonctionnalités:**
- [ ] Création antenne avec propriétaire initial (camp)
- [ ] Méthodes de déblocage multiples: énigme, mini-jeu, code physique, bouton
- [ ] Mini-jeux hacking: Simon, séquence, code couleur
- [ ] Configuration mini-jeu: difficulté, nombre d'étapes (3-10)
- [ ] QR code unique par antenne
- [ ] Points au piratage + points récurrents pour possession
- [ ] Cooldown avant re-piratage (5-30 min)
- [ ] États dynamiques: CONNECTEE, EN_PIRATAGE, PIRATEE, EN_COOLDOWN, DESACTIVEE
- [ ] Visibilité conditionnelle: antennes ennemies invisibles jusqu'au scan
- [ ] Notifications push: perte/gain d'antenne
- [ ] Historique propriétaires
- [ ] Filtres: Toutes/Connectées/Piratées/Hors ligne
- [ ] Carte interactive avec positions
- [ ] Animations transfert de couleur
- [ ] Sons différents: victoire vs alerte
- [ ] Badge compteur antennes par camp

### US-016: Zones GPS (GPS_CAPTURE)
**Complexité**: M
**Priorité**: Moyenne

**Fonctionnalités:**
- [ ] Création zone circulaire: centre GPS + rayon (10-500m)
- [ ] Validation automatique au GPS (background geolocation)
- [ ] Timer présence minimum (30s - 10min)
- [ ] Option: rester jusqu'à fin de partie
- [ ] Points pour capture + bonus durée
- [ ] États: LIBRE, EN_CAPTURE, CAPTUREE
- [ ] Cercle sur carte avec code couleur
- [ ] Vibration à l'entrée/sortie de zone
- [ ] Timer circulaire de présence
- [ ] Challenge mode: capturer toutes les zones
- [ ] Notifications: entrée/sortie/capture

### US-017: Collecte d'Items (ITEM_COLLECTION)
**Complexité**: M
**Priorité**: Moyenne

**Fonctionnalités:**
- [ ] Créer collection de N items à scanner
- [ ] Génération multiple QR codes (1 par item)
- [ ] Ordre libre ou imposé
- [ ] Points par item + bonus complétion
- [ ] Barre de progression (3/5 items)
- [ ] Option: items uniques (1 seul scan possible)
- [ ] Option: items partagés (plusieurs équipes)
- [ ] Checklist visuelle avec icônes
- [ ] Animation collection (checkmark animé)
- [ ] Son de collecte différent par rareté

### US-018: Énigmes Multi-Étapes (MULTI_STEP_ENIGMA)
**Complexité**: L
**Priorité**: Moyenne

**Fonctionnalités:**
- [ ] Création séquence d'énigmes (2-10 étapes)
- [ ] Chaque étape: texte énigme + réponse attendue
- [ ] Étapes débloquées progressivement
- [ ] Indice par étape (coût en points)
- [ ] Limite de tentatives par étape
- [ ] Points dégressifs selon nb tentatives
- [ ] Timer global optionnel
- [ ] Stepper UI (étapes 1→2→3)
- [ ] Confettis à la dernière étape
- [ ] Historique réponses

### US-019: Défense de Point (POINT_DEFENSE)
**Complexité**: L
**Priorité**: Basse

**Fonctionnalités:**
- [ ] QR à scanner pour démarrer défense
- [ ] Timer de défense (10-60 min)
- [ ] Points accumulés par minute
- [ ] Camp adverse peut scanner pour reset
- [ ] Notifications: début/interruption/succès
- [ ] Timer circulaire (vert défenseur, rouge attaquant)
- [ ] Vibration forte au scan ennemi
- [ ] Historique défenses réussies/ratées
- [ ] Leaderboard temps de défense

### US-021: Mini-Jeux Hacking (intégré dans ANTENNA_HACK)
**Complexité**: XL
**Priorité**: Moyenne

**Fonctionnalités:**
- [ ] **Simon**: Mémoriser séquence couleurs (3-10 étapes)
- [ ] **Séquence de codes**: Saisir codes dans l'ordre
- [ ] **Puzzle couleurs**: Aligner pattern
- [ ] Configuration difficulté par mini-jeu
- [ ] Timer par tentative
- [ ] Feedback visuel (succès/échec)
- [ ] Preview mini-jeu en admin
- [ ] Animations/sons par mini-jeu
- [ ] Highscores par mini-jeu

### US-023: Objectifs Aléatoires (RANDOM_POOL)
**Complexité**: M
**Priorité**: Basse

**Fonctionnalités:**
- [ ] Pool de 5-20 objectifs
- [ ] Tirage aléatoire au début de partie
- [ ] Nombre d'objectifs actifs configuré (3-10)
- [ ] Option: régénération après complétion
- [ ] UI "objectifs du jour" style lootbox
- [ ] Animation tirage au sort
- [ ] Indicateur "aléatoire" sur card

### US-024: Course Contre la Montre (TIME_RACE)
**Complexité**: S
**Priorité**: Basse

**Fonctionnalités:**
- [ ] Timer dégressif au scan (10-120 min)
- [ ] Bonus points si complété avant timer
- [ ] Malus si timer expiré
- [ ] Option: objectif disparaît si expiré
- [ ] Chronomètre géant rouge
- [ ] Animation urgence (clignotement)
- [ ] Son alerte 1 minute restante

### US-025: Événements Live (LIVE_EVENT)
**Complexité**: M
**Priorité**: Basse

**Fonctionnalités:**
- [ ] Création objectif "dormant"
- [ ] Bouton "Déclencher" en admin
- [ ] Activation manuelle en temps réel
- [ ] Timer validité après déclenchement
- [ ] Notification push dramatique
- [ ] Badge "⚡ LIVE" clignotant
- [ ] Son fanfare au déclenchement
- [ ] Animation slide from top
- [ ] Tracking déclenchements

### US-026: Codes Morse/Radio (MORSE_RADIO)
**Complexité**: L
**Priorité**: Basse

**Fonctionnalités:**
- [ ] Génération message morse
- [ ] Interface décodage (points/traits)
- [ ] Playback audio morse
- [ ] Hints visuels (alphabet morse)
- [ ] Validation message décodé
- [ ] Timer décodage
- [ ] Multiplicateur vitesse

### US-027: Négociation (NEGOTIATION)
**Complexité**: XL
**Priorité**: Très basse

**Fonctionnalités:**
- [ ] QR déclenche négociation entre camps
- [ ] Chat temps réel camp à camp
- [ ] Propositions/contre-propositions
- [ ] Validation bilatérale
- [ ] Points flexibles selon accord
- [ ] Historique négociations
- [ ] Timer négociation
- [ ] Médiateur (organisateur)

### US-028: Objectifs Conditionnels (CONDITIONAL)
**Complexité**: L
**Priorité**: Basse

**Fonctionnalités:**
- [ ] Condition de déblocage (autre objectif complété)
- [ ] Multiple conditions (ET/OU)
- [ ] Chaînes de dépendances
- [ ] Graphe de dépendances en UI
- [ ] Indicateur "verrouillé" avec raison
- [ ] Auto-déblocage à la complétion parent

---

## 🎨 Améliorations Transversales

### Notifications & Real-Time
- [ ] WebSocket pour updates temps réel
- [ ] Push notifications natives (Web Push API)
- [ ] Sons personnalisables par type d'événement
- [ ] Vibrations haptiques (mobile)
- [ ] Historique notifications in-app

### Médias & UI
- [ ] Upload images pour objectifs
- [ ] Galerie photos par opération
- [ ] Carte interactive (Mapbox/Leaflet)
- [ ] Animations avancées (Framer Motion)
- [ ] Thème sombre/clair
- [ ] Mode daltonien

### Analytics & Reporting
- [ ] Dashboard statistiques par objectif
- [ ] Graphes progression en temps réel
- [ ] Export CSV/PDF rapports
- [ ] Heatmaps captures GPS
- [ ] Timeline événements partie

### Performance & Scale
- [ ] Cache Redis pour leaderboards
- [ ] Pagination objectifs (>100 items)
- [ ] Lazy loading images
- [ ] Service workers (offline mode)
- [ ] Optimistic updates

### Admin Tools
- [ ] Duplication objectifs en masse
- [ ] Templates d'objectifs pré-configurés
- [ ] Import/export configuration JSON
- [ ] Preview mode (test sans affecter scores)
- [ ] Logs d'audit (qui a modifié quoi)

---

## 📊 Metrics de Complétion

**Phase 1**: ✅ 1/12 types (8%)
- PHYSICAL_CODE

**Phase 2**: 🚧 2/12 types supplémentaires (17% total)
- VIP_ELIMINATION (simplifié)
- TIMED_SABOTAGE (simplifié)

**Phase 3**: ⏳ 9/12 types restants (75% à faire)
- ANTENNA_HACK
- GPS_CAPTURE
- ITEM_COLLECTION
- MULTI_STEP_ENIGMA
- POINT_DEFENSE
- MORSE_RADIO
- NEGOTIATION
- RANDOM_POOL
- TIME_RACE
- LIVE_EVENT
- CONDITIONAL

**Total**: 12 types d'objectifs dans les specs

---

## 🎯 Prochaines Étapes Recommandées

1. **Court terme** (Sprint actuel):
   - ✅ Finaliser VIP_ELIMINATION simplifié
   - ✅ Finaliser TIMED_SABOTAGE simplifié
   - [ ] Tests E2E pour les 3 types implémentés

2. **Moyen terme** (Prochain sprint):
   - [ ] GPS_CAPTURE (valide la géolocalisation)
   - [ ] ITEM_COLLECTION (réutilise logique QR + progression)
   - [ ] Améliorer VIP avec photos/états avancés
   - [ ] Améliorer SABOTAGE avec timer serveur

3. **Long terme** (Backlog):
   - [ ] ANTENNA_HACK (le plus complexe, nécessite mini-jeux)
   - [ ] Mini-jeux hacking (Simon, séquences)
   - [ ] WebSocket pour real-time
   - [ ] Push notifications

---

**Note**: Ce document est vivant et sera mis à jour au fur et à mesure de l'avancement.
