import { compare, hash } from "bcryptjs";

export const ADMIN_ROLE = "ADMIN";
export const STAFF_ROLE = "STAFF";
export const USER_ROLE = "USER";

export type AuthRole = typeof ADMIN_ROLE | typeof STAFF_ROLE | typeof USER_ROLE;

const ROLE_MAP: Record<string, AuthRole> = {
  admin: ADMIN_ROLE,
  customer: USER_ROLE,
  staff: STAFF_ROLE,
  user: USER_ROLE
};

export function normalizeAuthRole(role: string | null | undefined): AuthRole {
  const normalizedRole = role?.trim().toLowerCase();

  if (!normalizedRole) {
    return USER_ROLE;
  }

  return ROLE_MAP[normalizedRole] ?? USER_ROLE;
}

export function isAdminRole(role: string | null | undefined): boolean {
  return normalizeAuthRole(role) === ADMIN_ROLE;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await compare(password, passwordHash);
  } catch {
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}
