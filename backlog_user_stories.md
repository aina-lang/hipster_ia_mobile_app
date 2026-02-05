# Backlog — Onboarding métier & Chat IA

## Epic: Onboarding entreprise et chat IA

**Titre**: Onboarding entreprise et chat IA contextualisé au métier

**En tant que**: propriétaire d’une petite entreprise (TPE/auto‑entrepreneur)

**Je veux**: m’inscrire (avec option d’abonnement), me connecter, déclarer mon métier pendant l’onboarding, et pouvoir discuter avec l’IA (chat) qui utilise mon métier pour personnaliser ses réponses.

**Afin de**: obtenir des contenus marketing pertinents et rapidement, et garder un historique réutilisable.

---

## Stories prioritaires (P0)

### 1) Inscription + Abonnement
- **Résumé**: Permettre à un nouvel utilisateur de créer un compte AI et sélectionner un plan (Curieux / Atelier / Studio / Agence) pendant ou juste après l'inscription.
- **Description**: Le flux doit créer l'utilisateur (endpoint `/ai/auth/register`), renvoyer tokens, et proposer le choix d'un plan. Après paiement (ou en mode démo), persist the selected plan in `user.aiProfile.planType`.
- **Critères d'acceptation**:
  - `aiRegister` renvoie `access_token` et `refresh_token` et hydrate `useAuthStore.user`.
  - L'utilisateur est redirigé vers la vérification e‑mail (`/verify-email`) ou l'écran d'abonnement (`/subscription`) selon le flow.
  - Après souscription, `useAuthStore.updateAiProfile({ planType })` est appelé et la valeur est visible dans `useAuthStore().user.aiProfile.planType`.
- **Composants**: `app/(auth)/register.tsx`, `app/(drawer)/subscription.tsx`, backend subscriptions controller.

### 2) Login
- **Résumé**: Connexion standard et AI distinctes doivent authentifier l'utilisateur et stocker tokens.
- **Description**: Le login doit appeler `/login` ou `/ai/auth/login` et stocker tokens en AsyncStorage; hydrater `useAuthStore`.
- **Critères d'acceptation**:
  - `useAuthStore.login` / `aiLogin` place `accessToken`, `refreshToken` en AsyncStorage.
  - `useAuthStore.user` est défini et `isAuthenticated` true.
  - Redirection post-login respecte `hasFinishedOnboarding`.
- **Composants**: `app/(auth)/login.tsx`, `store/authStore.ts`.

### 3) Choix métier (8 segments)
- **Résumé**: Afficher 8 options métier + option "Autre" ; persister choix localement et côté backend si l'utilisateur est connecté.
- **Description**: Remplacer/mettre à jour la grille métier dans le guided flow; stocker `professionId` stable (ex: `COIFFURE_ESTHETIQUE`) et `label` lisible. Si l'utilisateur est connecté, appeler `PATCH /profiles/ai/:id` pour persister `professionId`.
- **Critères d'acceptation**:
  - `step1-job` affiche les 8 segments avec icône/emoji.
  - La sélection met à jour `creationStore.selectedJob` (label) et `creationStore.selectedJobId` (id stable).
  - Pour utilisateur connecté, `useAuthStore.updateAiProfile({ professionId })` est appelé et la valeur est persistée.
- **Composants**: `app/(guided)/step1-job.tsx`, `store/creationStore.ts`, `store/authStore.ts`.

### 4) Chat IA
- **Résumé**: Écran de chat permettant d'envoyer des messages à l'IA; réponses contextualisées au métier et sauvegardées en historique.
- **Description**: Le front appelle `POST /ai/chat` via `api/ai.service.ts` (méthode `chat(messages)`); backend sauvegarde en `AiGeneration` avec `attributes` incluant `professionId`, `professionLabel`, `workflowAnswers`, `planType`.
- **Critères d'acceptation**:
  - L'écran chat envoie messages et affiche la réponse.
  - Chaque session / message utilisateur peut être sauvegardé côté backend en `AiGeneration`.
  - L'UI affiche états `loading`, `error` et permet retry.
- **Composants**: `app/(tabs)/ai-chat.tsx`, `store/chatStore.ts`, backend `AiController`.

---

## Remarques techniques rapides
- Utiliser `professionId` stable (ex: `COIFFURE_ESTHETIQUE`) pour analytics et stabilité des prompts.
- `AiService.buildPrompt` doit accepter `params.job` contenant soit `professionId` soit label; backend devrait mapper l'ID en label si nécessaire.
- Pour professions réglementées (santé, juridique), injecter disclaimers automatiques dans le prompt.

---

_Fichier généré automatiquement — prêt à importer dans un outil de backlog ou à copier/coller dans Jira._
