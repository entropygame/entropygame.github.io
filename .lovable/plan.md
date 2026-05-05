## Diagnostic

J'ai inspecté les assets servis par `cdn.digivadz.com`. Deux problèmes majeurs expliquent la lenteur du **premier** chargement (le 2ᵉ est rapide car tout est en cache navigateur) :

### 1. Le CDN ne met **rien** en cache (cause principale)
Toutes les requêtes vers `cdn.digivadz.com` renvoient :
```
cf-cache-status: DYNAMIC
```
Ça veut dire que Cloudflare **ne sert pas** les fichiers depuis son edge — chaque visiteur tape l'origine, ce qui est lent. Aucun header `Cache-Control` n'est non plus envoyé au navigateur.

### 2. Trop d'assets lourds téléchargés en parallèle dès le 1er paint
Au premier chargement, le navigateur tire ~**17 Mo** de médias :

| Asset | Taille |
|---|---|
| Vidéo Hero `.webm` | 2.5 Mo |
| Hero poster `.webp` | 780 Ko |
| Background fixe `.webp` | 535 Ko |
| Logo + Go section | ~560 Ko |
| 5 vidéos slides | ~3.8 Mo (807, 615, 755, 691, 899 Ko) |
| 4 vidéos opérateurs | ~6.8 Mo (1.7, 1.2, 2.3, 1.5 Mo) |
| 4 images opérateurs | ~380 Ko |

Les vidéos des slides et des opérateurs sont **mountées immédiatement** dans le DOM (même si `preload="metadata"`, beaucoup de navigateurs téléchargent quand même 200-500 Ko par vidéo pour récupérer les métadonnées et la 1ʳᵉ frame).

---

## Plan de correction

### A. Configurer le cache CDN (le plus impactant — à faire côté Cloudflare)
À faire **manuellement** dans le dashboard Cloudflare de `digivadz.com` :

1. Rules → **Cache Rules** : créer une règle "Cache CDN assets" qui matche `Hostname = cdn.digivadz.com` → action **Cache eligible** + Edge TTL `1 month` + Browser TTL `1 month`.
2. Ou plus simple : Page Rules → `cdn.digivadz.com/*` → Cache Level: Cache Everything, Edge Cache TTL: 1 month.

Résultat attendu : `cf-cache-status: HIT` après le premier visiteur, et les navigateurs garderont les fichiers ~30 jours sans re-téléchargement.

> Si tu n'as pas accès au Cloudflare de `digivadz.com`, dis-le moi : on peut basculer les assets sur le storage Lovable Cloud (qui sert avec de bons cache headers par défaut).

### B. Optimisations dans le code (je ferai ces changements)

1. **Preload des assets critiques au-dessus du fold** dans `index.html` :
   ```html
   <link rel="preload" as="image" href=".../BackGround Hero Section.webp" fetchpriority="high">
   <link rel="preload" as="image" href=".../Logo Entropy.webp">
   ```
   → le poster apparaît immédiatement, pas après le parse de React.

2. **Différer le téléchargement des vidéos hors-écran** :
   - `CarouselSection` et `OperatorsSection` : ne **monter** les `<video>` qu'après `IntersectionObserver` détecte que la section approche du viewport (rootMargin: 200px). Tant qu'on n'est pas proche, on rend juste le poster image.
   - Sur les vidéos non-actives du carousel : passer à `preload="none"` au lieu de `metadata`.
   - Sur les cartes opérateurs : `preload="none"` (la vidéo ne sert qu'au hover).

3. **Vidéo Hero** : ajouter `fetchpriority="high"` sur `<video>` et garantir que le `<picture>` poster s'affiche instantanément pendant que la vidéo charge (déjà presque le cas, juste affiner).

4. **Skeleton/poster pour le carousel** pendant que la 1ʳᵉ vidéo charge (au lieu d'un trou noir).

### C. Vérification
Après déploiement, je revérifierai les headers (`cf-cache-status: HIT`) et mesurerai le poids transféré au 1er paint (objectif : passer de ~17 Mo à <2 Mo sur le viewport initial).

---

## Fichiers modifiés
- `index.html` — ajout des `<link rel="preload">`
- `src/components/landing/CarouselSection.tsx` — montage différé des `<video>`
- `src/components/landing/OperatorsSection.tsx` — `preload="none"` + montage différé
- `src/components/landing/HeroSection.tsx` — `fetchpriority="high"` sur la vidéo

## À ta charge
- Activer le cache sur `cdn.digivadz.com` dans Cloudflare (point A) — sans ça, les gains code seront limités à ~40%. Avec le cache CDN, le 1er chargement devient quasi aussi rapide que le 2ᵉ.