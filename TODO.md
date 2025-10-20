# TODO: Supprimer le rôle "visitor" et gérer les utilisateurs non connectés

## Tâches à effectuer
- [ ] Supprimer VISITOR de l'enum UserRole dans user.entity.ts
- [ ] Changer la valeur par défaut de role à MEMBER dans user.entity.ts
- [ ] Mettre à jour users.service.ts pour utiliser MEMBER comme valeur par défaut lors de la création
- [ ] Tester les nouvelles inscriptions
- [ ] Vérifier que les guards d'authentification fonctionnent pour les utilisateurs non connectés

## État actuel
- Le rôle VISITOR est défini mais ne correspond à aucun utilisateur réel
- Les utilisateurs non connectés sont déjà gérés par les guards (ForbiddenException)
- Le frontend devra afficher l'état non connecté avec bouton de connexion
