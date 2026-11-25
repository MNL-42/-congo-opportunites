# Congo Opportunités

PWA mobile-first pour centraliser les opportunités destinées aux jeunes de la RDC.

## État de cette livraison

Cette première livraison contient l'interface frontend, la navigation, les écrans vides honnêtes, le thème, le manifeste PWA et le service worker.

**Ce n'est pas encore une application connectée à une base de données.** Les annonces et les profils réels ne sont pas encore chargés. L'authentification Google nécessite une configuration Supabase.

## Déployer depuis Android

1. Télécharge et décompresse `congo-opportunites.zip`.
2. Sur GitHub, crée un dépôt public nommé `congo-opportunites`.
3. Dans le dépôt, choisis **Add file > Upload files**.
4. Envoie le contenu du dossier (pas uniquement le ZIP).
5. Valide avec **Commit changes**.
6. Va dans **Settings > Pages**.
7. Choisis **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
8. Attends la fin du déploiement. L'adresse sera de la forme `https://TON-PSEUDO.github.io/congo-opportunites/`.

## Configurer Google avec Supabase — après le déploiement

1. Crée un projet sur https://supabase.com.
2. Dans **Project Settings > API**, récupère le Project URL et la clé `anon`/`publishable`.
3. Colle-les dans `js/config.js`. N'utilise jamais la clé `service_role`.
4. Dans Supabase, ouvre **Authentication > Providers > Google** et active Google.
5. Configure un client OAuth Google dans Google Cloud Console. Ajoute l'URL de rappel Supabase affichée dans la page du fournisseur Google.
6. Dans Supabase **Authentication > URL Configuration**, ajoute l'URL exacte de ton site GitHub Pages dans les Redirect URLs.
7. Teste la connexion Google sur le site publié.

La configuration OAuth Google exige des identifiants créés dans Google Cloud. Les écrans et libellés peuvent évoluer : suis les URLs de rappel affichées par Supabase.

## Tester localement

Un simple aperçu de fichiers peut fonctionner pour le design, mais l'authentification et le service worker exigent un site servi en HTTPS ou localhost. GitHub Pages fournit HTTPS.

## Prochaines étapes techniques

- Créer les tables PostgreSQL.
- Activer et tester les politiques RLS.
- Ajouter les rôles équipe via une procédure sécurisée.
- Connecter le catalogue d'opportunités à la base.
- Ajouter la modération et les journaux d'audit.
- Ajouter les parcours de l'Académie.

## Sécurité

- Ne jamais publier une clé `service_role`.
- Ne jamais donner un rôle administrateur en se basant sur une valeur contrôlée par le navigateur.
- Toutes les tables exposées doivent avoir des politiques RLS testées.
- Les annonces doivent conserver leur source et leur date de vérification.
