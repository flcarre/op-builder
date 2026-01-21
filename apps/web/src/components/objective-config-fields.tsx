'use client';

import { Input, Label, Textarea } from '@crafted/ui';

interface ObjectiveConfigFieldsProps {
  type: string;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export function ObjectiveConfigFields({ type, config, onChange }: ObjectiveConfigFieldsProps) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  switch (type) {
    case 'PHYSICAL_CODE':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration du Code Physique
          </h4>

          <div className="space-y-3">
            <Label htmlFor="secret-code" className="text-sm font-medium text-gray-300">
              Code Secret *
            </Label>
            <Input
              id="secret-code"
              value={config.secretCode || ''}
              onChange={(e) => updateConfig('secretCode', e.target.value)}
              placeholder="Ex: ALPHA-2024"
              maxLength={100}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="max-attempts" className="text-sm font-medium text-gray-300">
                Tentatives Max
              </Label>
              <Input
                id="max-attempts"
                type="number"
                value={config.maxAttempts || 3}
                onChange={(e) => updateConfig('maxAttempts', parseInt(e.target.value) || 3)}
                min={1}
                max={10}
                className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">
                Sensible à la casse
              </Label>
              <div className="flex items-center space-x-2 h-[42px]">
                <input
                  type="checkbox"
                  id="case-sensitive"
                  checked={config.caseSensitive || false}
                  onChange={(e) => updateConfig('caseSensitive', e.target.checked)}
                  className="w-4 h-4 text-cyber-500 bg-white/5 border-white/10 rounded focus:ring-cyber-400/20 focus:ring-2"
                />
                <label htmlFor="case-sensitive" className="text-sm text-gray-400">
                  Activer
                </label>
              </div>
            </div>
          </div>
        </div>
      );

    case 'GPS_CAPTURE':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration de la Zone GPS
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="latitude" className="text-sm font-medium text-gray-300">
                Latitude *
              </Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={config.latitude || ''}
                onChange={(e) => updateConfig('latitude', parseFloat(e.target.value))}
                placeholder="48.8566"
                min={-90}
                max={90}
                className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="longitude" className="text-sm font-medium text-gray-300">
                Longitude *
              </Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={config.longitude || ''}
                onChange={(e) => updateConfig('longitude', parseFloat(e.target.value))}
                placeholder="2.3522"
                min={-180}
                max={180}
                className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="radius" className="text-sm font-medium text-gray-300">
                Rayon (mètres) *
              </Label>
              <Input
                id="radius"
                type="number"
                value={config.radiusMeters || 50}
                onChange={(e) => updateConfig('radiusMeters', parseInt(e.target.value) || 50)}
                min={10}
                max={1000}
                className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="duration" className="text-sm font-medium text-gray-300">
                Durée (minutes) *
              </Label>
              <Input
                id="duration"
                type="number"
                value={config.durationMinutes || 10}
                onChange={(e) => updateConfig('durationMinutes', parseInt(e.target.value) || 10)}
                min={1}
                max={120}
                className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
              />
            </div>
          </div>
        </div>
      );

    case 'VIP_ELIMINATION':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration VIP
          </h4>

          <div className="space-y-3">
            <Label htmlFor="secret-info" className="text-sm font-medium text-gray-300">
              Information Secrète *
            </Label>
            <Textarea
              id="secret-info"
              value={config.secretInfo || ''}
              onChange={(e) => updateConfig('secretInfo', e.target.value)}
              placeholder="Information révélée après scan du VIP..."
              rows={4}
              maxLength={2000}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Cette information sera révélée à l'équipe qui scanne le QR code du VIP
            </p>
          </div>
        </div>
      );

    case 'TIMED_SABOTAGE':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration du Sabotage
          </h4>

          <div className="space-y-3">
            <Label htmlFor="delay" className="text-sm font-medium text-gray-300">
              Délai (minutes) *
            </Label>
            <Input
              id="delay"
              type="number"
              value={config.delayMinutes || 5}
              onChange={(e) => updateConfig('delayMinutes', parseInt(e.target.value) || 5)}
              min={1}
              max={120}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Temps avant que le sabotage ne se complète automatiquement
            </p>
          </div>
        </div>
      );

    case 'QR_ENIGMA':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration de l'Énigme
          </h4>

          <div className="space-y-3">
            <Label htmlFor="enigma" className="text-sm font-medium text-gray-300">
              Texte de l'Énigme *
            </Label>
            <Textarea
              id="enigma"
              value={config.enigma || ''}
              onChange={(e) => updateConfig('enigma', e.target.value)}
              placeholder="Posez votre énigme ici..."
              rows={4}
              maxLength={2000}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="answer" className="text-sm font-medium text-gray-300">
              Réponse Attendue *
            </Label>
            <Input
              id="answer"
              value={config.answer || ''}
              onChange={(e) => updateConfig('answer', e.target.value)}
              placeholder="La réponse correcte"
              maxLength={200}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              Sensible à la casse
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enigma-case-sensitive"
                checked={config.caseSensitive || false}
                onChange={(e) => updateConfig('caseSensitive', e.target.checked)}
                className="w-4 h-4 text-cyber-500 bg-white/5 border-white/10 rounded focus:ring-cyber-400/20 focus:ring-2"
              />
              <label htmlFor="enigma-case-sensitive" className="text-sm text-gray-400">
                La réponse doit respecter majuscules/minuscules
              </label>
            </div>
          </div>
        </div>
      );

    case 'ITEM_COLLECTION':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration de la Collecte
          </h4>

          <div className="space-y-3">
            <Label htmlFor="items-required" className="text-sm font-medium text-gray-300">
              Nombre d'Items à Collecter *
            </Label>
            <Input
              id="items-required"
              type="number"
              value={config.itemsRequired || 3}
              onChange={(e) => updateConfig('itemsRequired', parseInt(e.target.value) || 3)}
              min={1}
              max={20}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Nombre d'items différents que l'équipe doit scanner/collecter
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="items-list" className="text-sm font-medium text-gray-300">
              Liste des Items (optionnel)
            </Label>
            <Textarea
              id="items-list"
              value={config.itemsList || ''}
              onChange={(e) => updateConfig('itemsList', e.target.value)}
              placeholder="Un item par ligne&#10;Ex: Batterie&#10;Carte SD&#10;Antenne"
              rows={5}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Liste indicative des items. Les QR codes seront générés pour chaque item.
            </p>
          </div>
        </div>
      );

    case 'MULTI_STEP_ENIGMA':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration des Énigmes
          </h4>

          <div className="space-y-3">
            <Label htmlFor="steps-count" className="text-sm font-medium text-gray-300">
              Nombre d'Étapes *
            </Label>
            <Input
              id="steps-count"
              type="number"
              value={config.stepsCount || 3}
              onChange={(e) => updateConfig('stepsCount', parseInt(e.target.value) || 3)}
              min={2}
              max={10}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Nombre d'énigmes à résoudre dans l'ordre
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="enigmas" className="text-sm font-medium text-gray-300">
              Énigmes et Réponses
            </Label>
            <Textarea
              id="enigmas"
              value={config.enigmasData || ''}
              onChange={(e) => updateConfig('enigmasData', e.target.value)}
              placeholder="Format: Énigme 1 | Réponse 1&#10;Énigme 2 | Réponse 2&#10;..."
              rows={6}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Une énigme par ligne, format: "Question | Réponse"
            </p>
          </div>
        </div>
      );

    case 'POINT_DEFENSE':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration de la Défense
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="defense-duration" className="text-sm font-medium text-gray-300">
                Durée (minutes) *
              </Label>
              <Input
                id="defense-duration"
                type="number"
                value={config.durationMinutes || 15}
                onChange={(e) => updateConfig('durationMinutes', parseInt(e.target.value) || 15)}
                min={1}
                max={120}
                className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="defense-radius" className="text-sm font-medium text-gray-300">
                Rayon (mètres)
              </Label>
              <Input
                id="defense-radius"
                type="number"
                value={config.radiusMeters || 50}
                onChange={(e) => updateConfig('radiusMeters', parseInt(e.target.value) || 50)}
                min={10}
                max={500}
                className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="defense-rules" className="text-sm font-medium text-gray-300">
              Règles de Défense
            </Label>
            <Textarea
              id="defense-rules"
              value={config.defenseRules || ''}
              onChange={(e) => updateConfig('defenseRules', e.target.value)}
              placeholder="Expliquez les règles de défense du point..."
              rows={3}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>
        </div>
      );

    case 'MORSE_RADIO':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration Morse/Radio
          </h4>

          <div className="space-y-3">
            <Label htmlFor="morse-message" className="text-sm font-medium text-gray-300">
              Message à Décoder *
            </Label>
            <Input
              id="morse-message"
              value={config.message || ''}
              onChange={(e) => updateConfig('message', e.target.value)}
              placeholder="Le message en clair"
              maxLength={200}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="morse-encoded" className="text-sm font-medium text-gray-300">
              Message Encodé (Morse)
            </Label>
            <Textarea
              id="morse-encoded"
              value={config.encodedMessage || ''}
              onChange={(e) => updateConfig('encodedMessage', e.target.value)}
              placeholder=".... . .-.. .-.. ---"
              rows={3}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Le message en morse que les joueurs devront décoder
            </p>
          </div>
        </div>
      );

    case 'TIME_RACE':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration Course Contre la Montre
          </h4>

          <div className="space-y-3">
            <Label htmlFor="time-limit" className="text-sm font-medium text-gray-300">
              Temps Maximum (minutes) *
            </Label>
            <Input
              id="time-limit"
              type="number"
              value={config.timeLimit || 30}
              onChange={(e) => updateConfig('timeLimit', parseInt(e.target.value) || 30)}
              min={1}
              max={180}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="checkpoints" className="text-sm font-medium text-gray-300">
              Nombre de Checkpoints *
            </Label>
            <Input
              id="checkpoints"
              type="number"
              value={config.checkpointsCount || 5}
              onChange={(e) => updateConfig('checkpointsCount', parseInt(e.target.value) || 5)}
              min={2}
              max={20}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Points de passage à valider dans l'ordre
            </p>
          </div>
        </div>
      );

    case 'ANTENNA_HACK':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration Piratage d'Antenne
          </h4>

          <div className="space-y-3">
            <Label htmlFor="hack-difficulty" className="text-sm font-medium text-gray-300">
              Difficulté du Puzzle *
            </Label>
            <select
              id="hack-difficulty"
              value={config.difficulty || 'medium'}
              onChange={(e) => updateConfig('difficulty', e.target.value)}
              className="w-full p-3 border-2 rounded-lg bg-white/5 border-white/10 rounded-xl text-white focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20 focus:outline-none"
            >
              <option value="easy">Facile (3 étapes)</option>
              <option value="medium">Moyen (5 étapes)</option>
              <option value="hard">Difficile (7 étapes)</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="hack-time-limit" className="text-sm font-medium text-gray-300">
              Temps Maximum (secondes)
            </Label>
            <Input
              id="hack-time-limit"
              type="number"
              value={config.timeLimitSeconds || 120}
              onChange={(e) => updateConfig('timeLimitSeconds', parseInt(e.target.value) || 120)}
              min={30}
              max={600}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Temps pour compléter le mini-jeu (0 = illimité)
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="hack-instructions" className="text-sm font-medium text-gray-300">
              Instructions
            </Label>
            <Textarea
              id="hack-instructions"
              value={config.instructions || ''}
              onChange={(e) => updateConfig('instructions', e.target.value)}
              placeholder="Instructions pour le joueur..."
              rows={3}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>
        </div>
      );

    case 'NEGOTIATION':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration Négociation
          </h4>

          <div className="space-y-3">
            <Label htmlFor="negotiation-type" className="text-sm font-medium text-gray-300">
              Type de Négociation *
            </Label>
            <select
              id="negotiation-type"
              value={config.negotiationType || 'resources'}
              onChange={(e) => updateConfig('negotiationType', e.target.value)}
              className="w-full p-3 border-2 rounded-lg bg-white/5 border-white/10 rounded-xl text-white focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20 focus:outline-none"
            >
              <option value="resources">Échange de Ressources</option>
              <option value="information">Information Secrète</option>
              <option value="alliance">Alliance Temporaire</option>
              <option value="custom">Personnalisé</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="arbitrator-info" className="text-sm font-medium text-gray-300">
              Informations pour l'Arbitre *
            </Label>
            <Textarea
              id="arbitrator-info"
              value={config.arbitratorInfo || ''}
              onChange={(e) => updateConfig('arbitratorInfo', e.target.value)}
              placeholder="Détails de la négociation, ressources disponibles, limites..."
              rows={5}
              maxLength={2000}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Ces informations seront visibles uniquement par l'arbitre
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              Validation Manuelle
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="manual-validation"
                checked={config.requiresManualValidation !== false}
                onChange={(e) => updateConfig('requiresManualValidation', e.target.checked)}
                className="w-4 h-4 text-cyber-500 bg-white/5 border-white/10 rounded focus:ring-cyber-400/20 focus:ring-2"
              />
              <label htmlFor="manual-validation" className="text-sm text-gray-400">
                L'arbitre doit valider manuellement la négociation
              </label>
            </div>
          </div>
        </div>
      );

    case 'CONDITIONAL':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration Objectif Conditionnel
          </h4>

          <div className="space-y-3">
            <Label htmlFor="condition-type" className="text-sm font-medium text-gray-300">
              Type de Condition *
            </Label>
            <select
              id="condition-type"
              value={config.conditionType || 'time'}
              onChange={(e) => updateConfig('conditionType', e.target.value)}
              className="w-full p-3 border-2 rounded-lg bg-white/5 border-white/10 rounded-xl text-white focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20 focus:outline-none"
            >
              <option value="time">Basé sur le Temps</option>
              <option value="score">Basé sur le Score</option>
              <option value="objectives">Objectifs Complétés</option>
              <option value="team">Statut d'Équipe</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="condition-value" className="text-sm font-medium text-gray-300">
              Valeur de la Condition *
            </Label>
            <Input
              id="condition-value"
              value={config.conditionValue || ''}
              onChange={(e) => updateConfig('conditionValue', e.target.value)}
              placeholder="Ex: 15 (minutes), 500 (points), obj-id-1,obj-id-2"
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="condition-description" className="text-sm font-medium text-gray-300">
              Description de la Condition
            </Label>
            <Textarea
              id="condition-description"
              value={config.conditionDescription || ''}
              onChange={(e) => updateConfig('conditionDescription', e.target.value)}
              placeholder="Expliquez comment cet objectif se débloque..."
              rows={3}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              Visible Avant Débloquage
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="visible-before"
                checked={config.visibleBeforeUnlock !== false}
                onChange={(e) => updateConfig('visibleBeforeUnlock', e.target.checked)}
                className="w-4 h-4 text-cyber-500 bg-white/5 border-white/10 rounded focus:ring-cyber-400/20 focus:ring-2"
              />
              <label htmlFor="visible-before" className="text-sm text-gray-400">
                L'objectif est visible mais grisé avant d'être débloqué
              </label>
            </div>
          </div>
        </div>
      );

    case 'RANDOM_POOL':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration Pool Aléatoire
          </h4>

          <div className="space-y-3">
            <Label htmlFor="pool-size" className="text-sm font-medium text-gray-300">
              Nombre d'Objectifs dans le Pool *
            </Label>
            <Input
              id="pool-size"
              type="number"
              value={config.poolSize || 3}
              onChange={(e) => updateConfig('poolSize', parseInt(e.target.value) || 3)}
              min={2}
              max={10}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Un objectif sera choisi aléatoirement parmi ce pool
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="pool-objectives" className="text-sm font-medium text-gray-300">
              Objectifs Possibles *
            </Label>
            <Textarea
              id="pool-objectives"
              value={config.poolObjectives || ''}
              onChange={(e) => updateConfig('poolObjectives', e.target.value)}
              placeholder="Un objectif par ligne:&#10;Titre 1 | Description 1 | Points 1&#10;Titre 2 | Description 2 | Points 2&#10;..."
              rows={6}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Format: "Titre | Description | Points" (un par ligne)
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="selection-timing" className="text-sm font-medium text-gray-300">
              Moment de Sélection
            </Label>
            <select
              id="selection-timing"
              value={config.selectionTiming || 'on_start'}
              onChange={(e) => updateConfig('selectionTiming', e.target.value)}
              className="w-full p-3 border-2 rounded-lg bg-white/5 border-white/10 rounded-xl text-white focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20 focus:outline-none"
            >
              <option value="on_start">Au Démarrage de l'Opération</option>
              <option value="on_access">Quand l'Équipe Accède à l'Objectif</option>
              <option value="manual">Sélection Manuelle (Arbitre)</option>
            </select>
          </div>
        </div>
      );

    case 'LIVE_EVENT':
      return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
            Configuration Événement Live
          </h4>

          <div className="space-y-3">
            <Label htmlFor="event-type" className="text-sm font-medium text-gray-300">
              Type d'Événement *
            </Label>
            <select
              id="event-type"
              value={config.eventType || 'announcement'}
              onChange={(e) => updateConfig('eventType', e.target.value)}
              className="w-full p-3 border-2 rounded-lg bg-white/5 border-white/10 rounded-xl text-white focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20 focus:outline-none"
            >
              <option value="announcement">Annonce Simple</option>
              <option value="challenge">Défi Spontané</option>
              <option value="bonus">Mission Bonus</option>
              <option value="emergency">Événement d'Urgence</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="event-duration" className="text-sm font-medium text-gray-300">
              Durée de l'Événement (minutes)
            </Label>
            <Input
              id="event-duration"
              type="number"
              value={config.eventDuration || 10}
              onChange={(e) => updateConfig('eventDuration', parseInt(e.target.value) || 10)}
              min={1}
              max={60}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Durée pendant laquelle l'événement est actif (0 = illimité)
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="event-instructions" className="text-sm font-medium text-gray-300">
              Instructions pour l'Arbitre *
            </Label>
            <Textarea
              id="event-instructions"
              value={config.arbitratorInstructions || ''}
              onChange={(e) => updateConfig('arbitratorInstructions', e.target.value)}
              placeholder="Comment et quand déclencher cet événement..."
              rows={4}
              maxLength={2000}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="event-message" className="text-sm font-medium text-gray-300">
              Message aux Joueurs
            </Label>
            <Textarea
              id="event-message"
              value={config.playerMessage || ''}
              onChange={(e) => updateConfig('playerMessage', e.target.value)}
              placeholder="Message qui sera diffusé aux équipes..."
              rows={3}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              Notification Push
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="push-notification"
                checked={config.sendPushNotification !== false}
                onChange={(e) => updateConfig('sendPushNotification', e.target.checked)}
                className="w-4 h-4 text-cyber-500 bg-white/5 border-white/10 rounded focus:ring-cyber-400/20 focus:ring-2"
              />
              <label htmlFor="push-notification" className="text-sm text-gray-400">
                Envoyer une notification push lors du déclenchement
              </label>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
