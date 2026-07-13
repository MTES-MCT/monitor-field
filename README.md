# monitorfield

Application React Native (Expo) pour monitorfield.

## Prerequis

- Node.js 24+
- npm
- Un compte Expo/EAS (pour les builds Android de production)

## Installation et commandes locales

```bash
npm install
npm run start
```

Commandes utiles:

- `npm run lint`
- `npm run test`
- `npm run test:coverage`

## Build Android de production (Expo EAS)

Le projet utilise EAS Build avec le profil `production` défini dans `eas.json`.

### Build manuel

```bash
npx eas login
npm run build:android:production
```

Ce build produit un Android App Bundle (`.aab`) prêt pour le Play Store.

### Build CI GitHub Actions

Workflow: `.github/workflows/android-production-build.yml`

Déclenchement:

- manuel (`workflow_dispatch`)
- push d'un tag `v*` (ex: `v1.0.0`)

Secret GitHub requis:

- `EXPO_TOKEN`: token Expo avec accès au projet EAS

## Couverture et CodeQL

La couverture est produite par Jest en `coverage/lcov.info`.

Workflow: `.github/workflows/quality.yml`

Le dépôt utilise aussi un workflow CodeQL pour l'analyse de sécurité JavaScript/TypeScript:

- workflow: `.github/workflows/codeql.yml`
- déclenchement: push, pull request, planification hebdomadaire, manuel
- aucun secret n'est requis

## SonarCloud (MTE)

Le projet est prévu pour l'analyse SonarCloud via le bot de l'organisation (GitHub App), sans workflow GitHub dédié.

Configuration du projet:

- `sonar-project.properties`

Fonctionnement attendu:

1. le repository est importé dans SonarCloud (organisation `mtes-mct`),
2. l'analyse automatique SonarCloud est activée,
3. chaque push/PR déclenche l'analyse côté SonarCloud.

Il n'y a pas de secrets Sonar à configurer dans GitHub Actions pour ce mode.

## Notes importantes

- Avant le premier build EAS, initialiser les credentials Android (keystore) via `eas credentials`.
- Le package Android est actuellement `com.anonymous.monitorfield` (à remplacer avant publication officielle).
