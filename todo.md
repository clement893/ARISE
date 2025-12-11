
## Refactorisation Tailwind CSS - Système de Design Centralisé
- [x] Analyser la version de Tailwind et la configuration actuelle (Tailwind v4)
- [x] Créer le fichier de design tokens (tokens.css - couleurs, typographie, spacing, shadows)
- [x] Créer les fichiers CSS modulaires (cards.css, headers.css, buttons.css, forms.css, badges.css, tables.css, modals.css, utilities.css)
- [x] Mettre à jour les composants UI pour utiliser les tokens (Button, Card, Badge, Input, StatCard)
- [x] Remplacer les couleurs hardcodées par les tokens dans toutes les pages (30 fichiers, 0 couleurs hardcodées restantes)
- [x] Supprimer les styles inline et réduire la duplication de classes
- [x] Pousser sur GitHub (commit 8f8438c)


## Refactorisation Composants Réutilisables
- [ ] Installer clsx et class-variance-authority (cva)
- [ ] Créer utilitaire cn() pour fusionner les classes
- [ ] Créer Button avec variantes (primary, secondary, outline, ghost, danger, loading)
- [ ] Créer Card avec variantes et sous-composants (CardHeader, CardContent, CardFooter)
- [ ] Créer Input, Textarea, Checkbox, PasswordInput avec accessibilité ARIA
- [ ] Créer Select et RadioGroup
- [ ] Créer Modal/Dialog avec accessibilité
- [ ] Créer Alert/Toast pour les notifications
- [ ] Créer Loader, Spinner, Skeleton
- [ ] Créer Navbar et Sidebar réutilisables
- [ ] Créer composants de liste (ListItem, Avatar, Badge)
- [ ] Refactoriser les pages pour utiliser les nouveaux composants
- [ ] Supprimer le markup dupliqué
