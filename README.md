# الموقع : المنظمة الشبابية لإنماء قرية اسبيخات

Site statique en arabe (RTL), même structure que le site de référence : accueil,
الأنشطة, الداعمون, ادعم, الأعصار, استمارة الانضمام.
Aucune donnée reprise du site d'origine : listes vides, compteurs à zéro.

## 1. Contenu du dossier

```
index.html          الرئيسية (logo + boutons)
ages.html           الأعصار (classement)
activities.html     الأنشطة
supporters.html     الداعمون
donate.html         ادعم
form.html           استمارة الانضمام
login.html          تسجيل الدخول (placeholder, voir §5)
assets/config.js    ← LE SEUL FICHIER À MODIFIER
apps-script/Code.gs backend Google Sheets (§4)
assets/app.js       rendu des pages
assets/styles.css   styles
assets/logo.svg     logo (vectoriel)
assets/logo-512.png logo (partage, icône)
assets/logo-192.png logo (icône)
```

## 2. Changer les noms des أعصار

Ouvrir `assets/config.js`, section `ages`, et enlever les `//` :

```js
ages: [
  { name: "العصر الأول",  target: 40, members: 0, accounts: 0 },
  { name: "العصر الثاني", target: 30, members: 0, accounts: 0 },
],
```

- `name` : nom du عصر
- `target` : nombre total de personnes du عصر
- `members` : nombre d'inscrits
- `accounts` : nombre de comptes sur l'application

Le classement, les pourcentages, le total en haut de page et la liste déroulante
de l'استمارة se recalculent seuls. Aucune autre ligne à toucher.

## 3. Changer le reste

Tout est dans le même fichier `assets/config.js` :

| Section | Ce qu'elle contrôle |
|---|---|
| `org` | nom de l'organisation, titre d'accueil, pays |
| `theme` | les 4 couleurs du site |
| `contact` | WhatsApp, e-mail, Facebook |
| `registration` | où arrivent les demandes d'adhésion |
| `ages` | les أعصار |
| `activities` | les أنشطة |
| `supporters` | les داعمون |
| `donation` | objectif, moyens de paiement |
| `nav` | libellés du menu du bas |

Le nom est répété une seule fois hors config, dans la balise `<title>` et les
balises `og:` en haut de chaque fichier `.html`. C'est ce qui s'affiche dans
l'aperçu WhatsApp. Un chercher/remplacer suffit si tu changes le nom.

## 4. Base de données Google Sheets (compteur automatique)

Une fois branché, chaque inscription s'ajoute au tableur et le compteur des
أعصار monte tout seul pour tous les visiteurs. Compte Google suffisant, pas de
serveur, pas de carte bancaire.

### Mise en place, une seule fois

1. Créer un tableur vide sur https://sheets.new et le nommer, par exemple
   `قاعدة بيانات اسبيخات`.
2. Menu **Extensions → Apps Script**. Effacer le contenu de `Code.gs` et coller
   tout le fichier `apps-script/Code.gs` de ce dossier. Enregistrer.
3. Dans la liste des fonctions en haut, choisir `setup` et cliquer **Exécuter**.
   Autoriser l'accès quand Google le demande (écran *Cette application n'est pas
   validée* → *Paramètres avancés* → *Accéder à ...*). Les 4 onglets sont créés :
   `الأعصار`, `الانتسابات`, `الأنشطة`, `الداعمون`.
4. Bouton **Déployer → Nouveau déploiement**. Type = **Application Web**.
   *Exécuter en tant que* = **moi**. *Qui a accès* = **Tout le monde**.
   Déployer, puis copier l'adresse qui finit par `/exec`.
5. Coller cette adresse dans `assets/config.js` :

```js
api: { url: "https://script.google.com/macros/s/AKfy.../exec" },
```

6. Redéployer le site (voir §6). C'est la dernière fois que tu touches au code.

### Ensuite, tout se gère depuis le tableur

| Onglet | Ce que tu écris | Effet sur le site |
|---|---|---|
| `الأعصار` | nom du عصر + عدد إجمالي | la liste et le classement |
| `الانتسابات` | rempli automatiquement par le formulaire | fait monter le compteur |
| `الأنشطة` | titre, date, حالة, description, image, lien | la page الأنشطة |
| `الداعمون` | nom, montant, note | la page الداعمون |

Dans `الأنشطة`, la colonne حالة accepte `قادم`, `جارٍ` ou `انتهى`.

Le site met les données en cache 30 secondes côté Google. Une inscription
apparaît donc pour les autres visiteurs après une demi-minute au plus.

### Valider les inscriptions à la main

Par défaut chaque inscription est comptée tout de suite. Pour les valider une
par une, ouvrir `Code.gs` et mettre `var AUTO_APPROVE = false;`. Les nouvelles
lignes arrivent alors avec la mention `معلق` et ne sont pas comptées. Il suffit
de remplacer `معلق` par `مقبول` dans la colonne الحالة pour les valider.
Après toute modification du code, refaire **Déployer → Gérer les déploiements →
modifier → Nouvelle version**.

### Le numéro de téléphone sert de garde-fou

Un numéro déjà présent dans `الانتسابات` est refusé, ce qui évite qu'une même
personne gonfle le compteur.

### Sans base de données

Si tu laisses `api.url` vide, le site retombe sur les listes de `config.js` et
le formulaire peut envoyer les demandes sur WhatsApp (`registration.mode` =
`"whatsapp"` + `contact.whatsapp`) ou par e-mail via Formspree
(`"formspree"` + `registration.formspreeEndpoint`).

## 5. Ce que le site ne fait pas

Il n'y a pas de comptes membres ni de cartes numériques : le tableur enregistre
les inscriptions et les compteurs, rien de plus. `login.html` affiche donc un
message tant qu'aucun service de comptes n'est branché. Si tu en ajoutes un plus
tard, mets son adresse dans `auth.loginUrl` et le bouton pointera dessus.

Le tableur est privé, seul toi le vois. Le site ne lit que les totaux, jamais
les noms ni les numéros des inscrits.

## 6. Déploiement

### Option A : Netlify (le plus rapide, sans compte technique)

1. Aller sur https://app.netlify.com/drop
2. Glisser le dossier entier dans la page.
3. Le site est en ligne en 20 secondes, adresse en `.netlify.app`.
4. Pour mettre à jour : re-glisser le dossier modifié.

### Option B : GitHub Pages (gratuit, avec historique)

1. Créer un dépôt sur github.com, par exemple `sbikhat-site`.
2. Uploader tous les fichiers à la racine du dépôt (bouton *Add file → Upload files*).
3. Onglet **Settings → Pages**, section *Build and deployment* :
   Source = `Deploy from a branch`, Branch = `main`, dossier = `/ (root)`, *Save*.
4. Adresse : `https://<utilisateur>.github.io/sbikhat-site/`

### Option C : Vercel

1. Importer le dépôt GitHub sur vercel.com.
2. Framework preset = `Other`, aucune commande de build.
3. *Deploy*.

### Nom de domaine

Sur Netlify comme sur Vercel : *Domain settings → Add custom domain*, puis créer
chez le registrar un enregistrement CNAME vers l'adresse indiquée. La propagation
prend de quelques minutes à quelques heures.

## 7. Test en local

Ouvrir `index.html` directement dans le navigateur suffit. Pour être au plus
près du serveur :

```bash
cd sbikhat-site
python3 -m http.server 8000
# puis http://localhost:8000
```
