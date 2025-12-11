# Problèmes de contraste identifiés

## Pages avec fond vert (bg-primary-500) et textes peu lisibles:

### 1. Page Login (/login)
- "Sign in or continue your leadership journey" - text-white/80 OK mais pourrait être plus visible
- Labels et textes sont OK (blancs)

### 2. Page Profile (/dashboard/profile)
- "Update your profile information & subscription" - text-white/70 peu visible
- Le reste est sur fond blanc (card) donc OK

### 3. Page Settings (/dashboard/settings)
- "Manage your account settings" - peu visible (probablement text-white/70)
- Le reste est sur fond blanc (card) donc OK

### 4. Pages avec loading screens (bg-primary-500)
- Tous les loading screens utilisent bg-primary-500 avec spinner blanc - OK

## Corrections nécessaires:
1. Augmenter l'opacité des textes secondaires de white/70 à white/90 ou white
2. Vérifier les pages de signup qui ont des formulaires sur fond vert
