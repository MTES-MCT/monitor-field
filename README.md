# monitor-field

Application React Native (Expo) pour monitor-field.

## Prerequis

- Node.js 20+
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

## SonarQube (MTE)

Configuration de base dans `sonar-project.properties`.

Workflow: `.github/workflows/sonarqube.yml`

Secrets GitHub requis:

- `SONAR_HOST_URL`: URL de l'instance SonarQube
- `SONAR_TOKEN`: token SonarQube
- `SONAR_PROJECT_KEY`: clé du projet SonarQube

Le workflow:

1. installe les dépendances,
2. génère la couverture Jest,
3. exécute le scan SonarQube,
4. vérifie la Quality Gate.

## Notes importantes

- Avant le premier build EAS, initialiser les credentials Android (keystore) via `eas credentials`.
- Le package Android est actuellement `com.anonymous.monitorfield` (à remplacer avant publication officielle).
