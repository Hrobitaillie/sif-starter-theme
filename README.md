# Sif Starter Theme

Thème WordPress moderne avec Vite, Tailwind CSS 4 et support complet des blocs Gutenberg personnalisés SiteForge.

## Caractéristiques

- ✅ **Vite** - Build ultra-rapide avec Hot Module Replacement (HMR)
- ✅ **Tailwind CSS 4** - Dernière version avec configuration `@theme`
- ✅ **Full Site Editing (FSE)** - Support complet avec `theme.json`
- ✅ **SiteForge Integration** - Scan automatique des blocs dans `/blocks`
- ✅ **Production Ready** - Assets minifiés et optimisés

## Installation

### 1. Activer le thème

Dans WordPress Admin:
1. Allez dans **Apparence → Thèmes**
2. Activez **Sif Starter Theme**

### 2. Vérifier que le plugin SiteForge est activé

Le thème nécessite le plugin **SiteForge** pour fonctionner correctement avec les blocs personnalisés.

## Développement

### Structure des fichiers

```
sif-starter-theme/
├── style.css              # Header WordPress (requis)
├── functions.php          # Point d'entrée principal
├── theme.json             # Configuration FSE (couleurs, fonts, etc.)
├── inc/
│   ├── theme-setup.php    # Configuration du thème
│   └── vite-integration.php # Gestion des assets
├── assets/
│   ├── src/
│   │   ├── main.js        # Entry point JavaScript
│   │   └── main.css       # Tailwind CSS + styles custom
│   └── dist/              # Assets compilés (généré)
├── templates/             # Templates FSE
│   ├── index.html
│   └── page.html
├── parts/                 # Template parts
│   ├── header.html
│   └── footer.html
└── blocks/                # Blocs spécifiques au thème
```

### Commandes npm

```bash
# Installer les dépendances
npm install

# Mode développement avec HMR
npm run dev

# Build pour production
npm run build
```

### Mode développement

Quand vous lancez `npm run dev`, le serveur Vite démarre sur `http://localhost:5173`.

Le thème détecte automatiquement si le serveur est actif et charge:
- En **dev**: Assets depuis `localhost:5173` (HMR activé)
- En **prod**: Assets depuis `assets/dist/` (versions compilées)

### Créer des blocs custom

Créez un dossier dans `/blocks` avec la structure SiteForge:

```
blocks/
└── mon-bloc/
    ├── block.json      # Métadonnées
    ├── fields.php      # Champs custom
    ├── render.php      # Template de rendu
    └── style.css       # Styles (optionnel)
```

Le plugin SiteForge scannera automatiquement ce dossier grâce au filtre dans `functions.php`.

## Tailwind CSS 4

Le thème utilise Tailwind CSS 4 avec la nouvelle syntaxe `@theme`:

### Configuration des couleurs

Éditez `assets/src/main.css`:

```css
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}
```

Ces couleurs sont disponibles comme classes:
- `bg-primary`
- `text-secondary`
- etc.

### Synchronisation avec theme.json

Les couleurs dans `theme.json` sont également disponibles dans Gutenberg:

```json
{
  "settings": {
    "color": {
      "palette": [
        {
          "slug": "primary",
          "color": "#3b82f6",
          "name": "Primary"
        }
      ]
    }
  }
}
```

## Composants utilitaires

Le thème inclut des composants prêts à l'emploi:

### Boutons

```html
<button class="btn-primary">Bouton primaire</button>
<button class="btn-secondary">Bouton secondaire</button>
<button class="btn-outline">Bouton outline</button>
```

### Card

```html
<div class="card">
  <h3>Titre de la card</h3>
  <p>Contenu...</p>
</div>
```

### Section

```html
<section class="section">
  <div class="container">
    <!-- Contenu -->
  </div>
</section>
```

### Effets visuels

```html
<!-- Texte gradient -->
<h1 class="text-gradient">Titre avec gradient</h1>

<!-- Glass effect -->
<div class="glass p-8">
  <!-- Contenu avec effet verre -->
</div>
```

## Personnalisation du theme.json

Le fichier `theme.json` contrôle l'interface Gutenberg:

- **Couleurs**: `settings.color.palette`
- **Typographie**: `settings.typography.fontFamilies`
- **Espacements**: `settings.spacing.spacingSizes`
- **Layout**: `settings.layout.contentSize` (1200px) et `wideSize` (1400px)

Modifiez ces valeurs pour personnaliser l'éditeur.

## Production

### Build

```bash
npm run build
```

Génère les fichiers dans `assets/dist/`:
- `main.[hash].css` - Styles compilés (18 KB gzippé)
- `main.[hash].js` - JavaScript
- `.vite/manifest.json` - Mapping pour WordPress

### Déploiement

1. Commitez les fichiers buildés (`assets/dist/`)
2. Uploadez le thème sur votre serveur
3. WordPress chargera automatiquement les assets depuis `dist/`

**Note**: Le serveur de dev Vite n'est pas nécessaire en production.

## Compatibilité

- **WordPress**: 6.4+
- **PHP**: 8.0+
- **Navigateurs modernes**: Chrome, Firefox, Safari, Edge (dernières versions)

## Support

Pour les problèmes liés au thème, vérifiez:

1. Le plugin **SiteForge** est activé
2. Les assets sont buildés (`npm run build`)
3. Le fichier `assets/dist/.vite/manifest.json` existe

## Licence

MIT
