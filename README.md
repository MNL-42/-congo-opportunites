# Congo Opportunités

**Congo Opportunités** est une plateforme destinée aux jeunes de la République démocratique du Congo : opportunités de formation, bourses, stages, emplois, concours, projets numériques et ressources d’apprentissage.

## Arborescence réelle

```text
.
├── index.html
├── manifest.json
├── sw.js
├── README.md
├── LICENSE
├── css/
│   ├── style.css
│   └── responsive.css
├── js/
│   ├── config.js
│   ├── auth.js
│   ├── app.js
│   ├── academy.js
│   ├── course-content.js
│   ├── pwa-install.js
│   └── courses/
│       └── catalogue.js
└── assets/
    ├── icons/
    │   ├── icon.svg
    │   └── icon-180.png
    ├── og-cover.svg
    └── og-cover.png
```

## Fonctionnalités présentes

- Interface responsive avec navigation, thème clair/sombre et pages d’information (Conditions, Confidentialité, À propos, Contact et FAQ).
- Académie avec catalogue de cours, fiches pédagogiques et progression enregistrée localement.
- Atelier de code : aperçu isolé pour HTML, CSS et JavaScript. Python, PHP, SQL et Dart/Flutter sont proposés dans l’éditeur, mais nécessitent encore un moteur d’exécution dédié.
- Installation PWA avec prise en charge des consignes Android et iOS.
- Service worker avec cache des ressources locales et mise en cache à la demande des polices Google.
- Métadonnées SEO, Open Graph, icône Apple et icônes PWA.

## État des services connectés

Les écrans sont prêts côté interface, mais les fonctions qui dépendent d’un serveur ne doivent pas être présentées comme actives tant que le backend n’est pas configuré :
- Connexion Google : nécessite un projet Supabase et Google OAuth.
- Catalogue réel d’opportunités : nécessite les tables Supabase, des annonces vérifiées et les politiques RLS.
- Favoris et profil modifiables : nécessitent une session et des tables protégées.
- Administration : doit être réservée à des comptes d’équipe autorisés côté serveur.

Aucune fausse annonce ni fausse connexion n’est affichée.

## Déploiement

Le dépôt est servi par GitHub Pages depuis la branche `main`. Après chaque commit, attendre la fin du déploiement puis recharger le site. Si une ancienne version reste visible, ferme puis rouvre l’application installée ou vide les données du site dans le navigateur.

## Configurer Supabase

1. Créer un projet sur https://supabase.com.
2. Dans Project Settings > API, récupérer le Project URL et la clé publique `anon`/publishable.
3. Ajouter ces valeurs dans `js/config.js` (`SUPABASE_URL` et `SUPABASE_ANON_KEY`).
4. Activer Google dans Authentication > Providers.
5. Configurer le client OAuth Google et les URL de rappel indiquées par Supabase.
6. Ajouter l’URL GitHub Pages dans Authentication > URL Configuration > Redirect URLs.

**Ne jamais mettre la clé `service_role` dans le dépôt ou dans le navigateur.**

## Sécurité et protection des utilisateurs

- Ne jamais publier de données personnelles inutiles.
- Activer RLS sur toutes les tables exposées.
- Protéger les comptes d’administration côté serveur.
- Modérer les contenus soumis par les membres.
- Vérifier les liens et l’identité des organismes avant toute publication.

## Licence

Le projet est distribué sous licence MIT. Voir le fichier `LICENSE`.
