# Project Entropy — Admin Panel

## 🔐 Comment se connecter à l'admin

1. Aller sur `/admin/login`
2. Créer un compte (onglet "Créer un compte") avec votre email + mot de passe
3. **Important** : votre nouveau compte n'a PAS le rôle admin par défaut. Vous devez l'ajouter manuellement dans Supabase :

### Promouvoir un utilisateur en admin

Dans le SQL Editor de Supabase, exécuter :

```sql
-- Remplacez 'votre@email.com' par l'email du compte créé
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'votre@email.com';
```

Lien direct : https://supabase.com/dashboard/project/oivstbvuyzyewxfcmyze/sql/new

> 💡 **Conseil** : désactivez la confirmation email dans Supabase Auth settings pour pouvoir vous connecter immédiatement après inscription pendant le développement.

---

## 📊 Fonctionnalités du panneau admin

`/admin` contient 4 onglets :

| Onglet | Fonction |
|---|---|
| **1 · Textes** | Réservé pour édition future (non activé) |
| **2 · Liens CTA** | Modifier l'URL des 3 boutons (Hero, Floating, GO) |
| **3 · Tracking** | Configurer GA4, Meta Pixel et token API Conversions Meta |
| **4 · Analytics** | Graphes : visites, clics, sources de trafic, durée |

---

## 🚀 Déploiement sur GitHub (et hébergement externe)

Le projet est compatible avec n'importe quel hébergeur supportant Vite + TanStack Start :
**Vercel, Netlify, Cloudflare Pages, ou auto-hébergement**.

### Variables d'environnement requises

Sur votre plateforme d'hébergement, configurer :

```bash
# Build-time (exposées au browser)
VITE_SUPABASE_URL=https://oivstbvuyzyewxfcmyze.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIs... (la même qu'en local)
VITE_SUPABASE_PROJECT_ID=oivstbvuyzyewxfcmyze

# Runtime (server-side, optionnel pour SSR)
SUPABASE_URL=https://oivstbvuyzyewxfcmyze.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

Ces clés sont **publiques** (anon/publishable key Supabase). La sécurité est assurée par les politiques **Row Level Security (RLS)** déjà en place.

### Build

```bash
bun install   # ou npm install
bun run build # ou npm run build
```

Le résultat va dans `dist/`. Servez-le via votre plateforme.

### Vercel / Netlify

Le préset Cloudflare est utilisé par défaut. Pour déployer ailleurs, modifiez `vite.config.ts` (preset → `node`, `vercel`, `netlify`, etc. selon `nitropack`).

---

## 🛡 Sécurité

- **L'auth admin est gérée 100% par Supabase Auth** (email/password). Pas de secret hardcodé.
- **Le rôle admin est stocké dans la table `user_roles`** (pas dans `profiles` → évite les attaques d'élévation de privilèges).
- Toutes les actions admin (lecture analytics, modification settings) sont **protégées par RLS** côté base.
- Le token API Conversions Meta est stocké chiffré côté DB et lisible **uniquement par les admins**. Il n'est PAS injecté dans les scripts du browser.

---

## 📈 Données collectées (tracking interne)

- **`visit_sessions`** : 1 ligne par visite (durée, referrer, UTM, user agent). Insérée à la fermeture de l'onglet.
- **`button_clicks`** : 1 ligne par clic CTA. Insérée immédiatement.

Les visiteurs anonymes peuvent **insérer** mais pas **lire** ces tables. Seuls les admins voient les données dans le dashboard.

---

## 🔧 Liens utiles

- Supabase Dashboard : https://supabase.com/dashboard/project/oivstbvuyzyewxfcmyze
- SQL Editor : https://supabase.com/dashboard/project/oivstbvuyzyewxfcmyze/sql/new
- Auth Users : https://supabase.com/dashboard/project/oivstbvuyzyewxfcmyze/auth/users
- Auth Settings (désactiver confirmation email) : https://supabase.com/dashboard/project/oivstbvuyzyewxfcmyze/auth/providers
