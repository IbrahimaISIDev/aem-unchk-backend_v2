import { UserRole } from '../users/entities/user.entity';

export type DashboardCard =
  | 'users'
  | 'media'
  | 'events'
  | 'products'
  | 'analytics'
  | 'finance';

const ROLE_CARDS: Record<UserRole, DashboardCard[]> = {
  [UserRole.ADMIN]: ['users', 'media', 'events', 'products', 'analytics', 'finance'],
  [UserRole.SEC_GENERAL]: ['users', 'media', 'events', 'analytics'],
  [UserRole.TECH_MANAGER]: ['media', 'events', 'analytics'],
  [UserRole.FINANCE_MANAGER]: ['products', 'finance', 'analytics'],
  [UserRole.TREASURER]: ['finance', 'analytics'],
  [UserRole.SCHOLAR]: ['media', 'events'],
  [UserRole.IMAM]: ['media', 'events'],
  [UserRole.ISLAMIC_MANAGER]: ['media', 'events'],
  [UserRole.PEDAGOGIC_MANAGER]: ['media', 'events'],
  [UserRole.MEMBER]: ['media', 'events', 'products'],
};

export function allowedCardsForRole(role: UserRole): DashboardCard[] {
  return ROLE_CARDS[role] || [];
}

export function adminRouteForCard(card: DashboardCard): string {
  switch (card) {
    case 'users':
      return '/admin/users';
    case 'media':
      return '/admin/media';
    case 'events':
      return '/admin/events';
    case 'products':
      return '/admin/products';
    case 'analytics':
      return '/admin/analytics';
    case 'finance':
      return '/admin/finance';
    default:
      return '/admin';
  }
}