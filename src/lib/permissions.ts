/**
 * Permissions checks based on user roles defined in readme.md
 */

export const ROLES = {
  ADMIN: "ADMIN",
  SUPERVISOR: "SUPERVISOR",
  CHEW: "CHEW",
  MIDWIFE: "MIDWIFE",
  MOBILIZER: "MOBILIZER",
  PHC_BOARD_VIEWER: "PHC_BOARD_VIEWER",
};

export const ROLE_GROUPS = {
  ALL: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.CHEW, ROLES.MIDWIFE, ROLES.MOBILIZER, ROLES.PHC_BOARD_VIEWER],
  FRONTLINE: [ROLES.ADMIN, ROLES.CHEW, ROLES.MIDWIFE],
  COMMUNITY_OUTREACH: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MOBILIZER],
  MANAGEMENT: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.PHC_BOARD_VIEWER],
  WRITE_WOMEN: [ROLES.ADMIN, ROLES.CHEW, ROLES.MIDWIFE],
  WRITE_REFERRALS: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.CHEW, ROLES.MIDWIFE],
  REPORTS_ACCESS: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.PHC_BOARD_VIEWER],
};

/**
 * Checks if a user's role has permission to access a set of roles/groups
 */
export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Validates check for facility-level scoping
 */
export function canAccessFacility(
  user: { role: string; facilityId?: string | null; lgaId?: string | null },
  targetFacility: { id: string; lgaId: string }
): boolean {
  if (user.role === ROLES.ADMIN || user.role === ROLES.PHC_BOARD_VIEWER) {
    return true;
  }
  if (user.role === ROLES.SUPERVISOR) {
    return !user.lgaId || user.lgaId === targetFacility.lgaId;
  }
  // Frontline staff (CHEW/Midwife/Mobilizer) scoped to their assigned facility
  return user.facilityId === targetFacility.id;
}

type ScopedUser = {
  userId?: string;
  role: string;
  facilityId?: string | null;
  lgaId?: string | null;
};

export function mergeWhere<T extends Record<string, unknown>>(
  ...clauses: Array<T | Record<string, unknown> | undefined>
) {
  const activeClauses = clauses.filter((clause) => clause && Object.keys(clause).length > 0);
  if (activeClauses.length === 0) return {};
  if (activeClauses.length === 1) return activeClauses[0];
  return { AND: activeClauses };
}

export function getWomanScope(user: ScopedUser) {
  if (user.role === ROLES.ADMIN || user.role === ROLES.PHC_BOARD_VIEWER) {
    return {};
  }

  if (user.role === ROLES.SUPERVISOR) {
    return user.lgaId ? { lgaId: user.lgaId } : {};
  }

  if (user.role === ROLES.CHEW || user.role === ROLES.MIDWIFE) {
    return user.facilityId ? { facilityId: user.facilityId } : { registeredByUserId: user.userId };
  }

  if (user.role === ROLES.MOBILIZER) {
    const assignedCaseload: Record<string, unknown>[] = [
      { referrals: { some: { assignedToUserId: user.userId } } },
      { missedVisits: { some: { assignedToUserId: user.userId } } },
    ];

    if (user.facilityId) {
      assignedCaseload.push({ facilityId: user.facilityId });
    }

    return { OR: assignedCaseload };
  }

  return { id: "__deny_all__" };
}

export function getChildScope(user: ScopedUser) {
  const womanScope = getWomanScope(user);
  return Object.keys(womanScope).length > 0 ? { woman: womanScope } : {};
}

export function getFacilityScope(user: ScopedUser) {
  if (user.role === ROLES.ADMIN || user.role === ROLES.PHC_BOARD_VIEWER) {
    return {};
  }
  if (user.role === ROLES.SUPERVISOR) {
    return user.lgaId ? { lgaId: user.lgaId } : {};
  }
  if (user.facilityId) {
    return { id: user.facilityId };
  }
  return { id: "__deny_all__" };
}

export function canViewParticipantDirectory(role: string) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.CHEW, ROLES.MIDWIFE, ROLES.MOBILIZER].includes(role);
}

export function canViewDirectContact(role: string) {
  return [ROLES.ADMIN, ROLES.CHEW, ROLES.MIDWIFE].includes(role);
}

export function canViewDetailedSafeContact(role: string) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.CHEW, ROLES.MIDWIFE].includes(role);
}

export function canManageParticipant(role: string) {
  return [ROLES.ADMIN, ROLES.CHEW, ROLES.MIDWIFE].includes(role);
}

export function canLogNutritionScreening(role: string) {
  return [ROLES.ADMIN, ROLES.CHEW, ROLES.MIDWIFE].includes(role);
}

export function canManageSafeContact(role: string) {
  return [ROLES.ADMIN, ROLES.CHEW, ROLES.MIDWIFE].includes(role);
}

export function canCreateReferral(role: string) {
  return ROLE_GROUPS.WRITE_REFERRALS.includes(role);
}

export function canCreateResilienceActivity(role: string) {
  return [ROLES.ADMIN, ROLES.CHEW, ROLES.MIDWIFE, ROLES.MOBILIZER].includes(role);
}

export function canLogSafeguardingConcern(role: string) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.CHEW, ROLES.MIDWIFE, ROLES.MOBILIZER].includes(role);
}

export function canAssignOutreach(role: string) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR].includes(role);
}

export function canUpdateAssignedReferral(
  user: ScopedUser,
  referral: { createdByUserId?: string | null; assignedToUserId?: string | null }
) {
  if ([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.CHEW, ROLES.MIDWIFE].includes(user.role)) return true;
  return user.role === ROLES.MOBILIZER && referral.assignedToUserId === user.userId;
}

export function canCloseMissedVisit(
  user: ScopedUser,
  visit: { assignedToUserId?: string | null }
) {
  if ([ROLES.ADMIN, ROLES.SUPERVISOR].includes(user.role)) return true;
  return user.role === ROLES.MOBILIZER && visit.assignedToUserId === user.userId;
}

export function canExportIdentifiedReports(role: string) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR].includes(role);
}

export function canExportAggregateReports(role: string) {
  return ROLE_GROUPS.REPORTS_ACCESS.includes(role);
}

export function getUserCapabilities(user: ScopedUser) {
  return {
    canViewDirectContact: canViewDirectContact(user.role),
    canViewDetailedSafeContact: canViewDetailedSafeContact(user.role),
    canManageParticipant: canManageParticipant(user.role),
    canLogNutritionScreening: canLogNutritionScreening(user.role),
    canManageSafeContact: canManageSafeContact(user.role),
    canCreateReferral: canCreateReferral(user.role),
    canCreateResilienceActivity: canCreateResilienceActivity(user.role),
    canLogSafeguardingConcern: canLogSafeguardingConcern(user.role),
    canAssignOutreach: canAssignOutreach(user.role),
    canExportIdentifiedReports: canExportIdentifiedReports(user.role),
    canExportAggregateReports: canExportAggregateReports(user.role),
  };
}
