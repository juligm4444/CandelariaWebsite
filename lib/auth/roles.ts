/**
 * Role vocabulary, kept free of runtime imports so the data layer and the auth
 * configuration can both reference it without importing each other.
 */
export type InternalRole = 'leader' | 'coleader' | 'member';

export const INTERNAL_ROLES: InternalRole[] = ['leader', 'coleader', 'member'];

export function isInternalRole(value: unknown): value is InternalRole {
  return value === 'leader' || value === 'coleader' || value === 'member';
}
