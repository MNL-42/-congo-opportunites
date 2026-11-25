# Congo Opportunités

**Congo Opportunités** est une plateforme destinée aux jeunes de la République démocratique du Congo : opportunités de formation, bourses, stages, emplois, concours, projets numériques et ressources d'apprentissage.

## État réel du dépôt

Cette version corrige les chemins des ressources frontend, le responsive mobile, la navigation, le thème clair/sombre et le cache PWA.

Les écrans sont prêts côté interface, mais les fonctions qui dépendent d'un serveur ne doivent pas être présentées comme actives tant que le backend n'est pas configuré :
- Connexion Google : nécessite un projet Supabase et Google OAuth.
- Catalogue réel : nécessite les tables Supabase, des annonces vérifiées et les politiques RLS.
- Favoris et profil modifiables : nécessitent une session et des tables protégées.
- Administration : doit être réservée à des comptes d'équipe autorisés côté serveur.

Aucune fausse annonce ni fausse connexion n'est affichée.

## Déploiement

Le dépôt est servi par GitHub Pages depuis la branche `main`. Après chaque commit, attendre la fin du déploiement puis recharger le site. Si l'ancienne version reste visible, vider les données du site dans le navigateur ou patienter le temps que le cache se renouvelle.

## Configurer Supabase

1. Créer un projet sur https://supabase.com.
2. Dans Project Settings > API, récupérer le Project URL et la clé publique `anon`/publishable.
3. Ajouter ces valeurs dans `config.js` (`SUPABASE_URL` et `SUPABASE_ANON_KEY`).
4. Activer Google dans Authentication > Providers.
5. Configurer le client OAuth Google et les URL de rappel indiquées par Supabase.
6. Ajouter l'URL GitHub Pages dans Authentication > URL Configuration > Redirect URLs.

**Ne jamais mettre la clé `service_role` dans le dépôt ou dans le navigateur.**

## Étape backend indispensable

Avant d'ouvrir les inscriptions au public, créer et tester les tables PostgreSQL, les politiques RLS et les rôles d'équipe. Un compte ne doit jamais pouvoir devenir administrateur en modifiant son profil depuis le navigateur.

Chaque opportunité doit contenir sa source officielle, sa date de vérification, sa date limite et ses conditions. L'équipe doit retirer ou marquer les annonces expirées.

## Structure actuelle

- `index.html` : interface principale
- `style.css`, `responsive.css` : design et adaptation mobile
- `app.js` : navigation, thème, interactions d'interface
- `auth.js`, `config.js` : base de l'authentification Supabase
- `manifest.json`, `sw.js`, `icon.svg` : PWA

## Sécurité et protection des utilisateurs

- Ne jamais publier de données personnelles inutiles.
- Activer RLS sur toutes les tables exposées.
- Protéger les comptes d'administration côté serveur.
- Modérer les contenus soumis par les membres.
- Vérifier les liens et l'identité des organismes avant toute publication.
