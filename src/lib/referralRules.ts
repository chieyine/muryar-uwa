/**
 * Validation rules and policies for referrals
 */

import { canCloseReferral } from "./riskRules";

export const REFERRAL_STATUS = {
  IDENTIFIED: "IDENTIFIED",
  COUNSELLED: "COUNSELLED",
  REFERRED: "REFERRED",
  MESSAGE_SENT: "MESSAGE_SENT",
  REACHED: "REACHED",
  ATTENDED: "ATTENDED",
  COMPLETED: "COMPLETED",
  NOT_REACHED: "NOT_REACHED",
  ESCALATED: "ESCALATED",
  CLOSED: "CLOSED",
};

/**
 * Checks if a status transition is permitted
 */
export function isValidTransition(currentStatus: string, nextStatus: string): boolean {
  if (currentStatus === nextStatus) return true;

  // Closed/Completed/Escalated cannot go back to Identified or Referred easily
  if (
    (currentStatus === REFERRAL_STATUS.COMPLETED || currentStatus === REFERRAL_STATUS.CLOSED) &&
    (nextStatus === REFERRAL_STATUS.IDENTIFIED || nextStatus === REFERRAL_STATUS.REFERRED)
  ) {
    return false;
  }

  return true;
}

/**
 * Enforces closure safeguarding rule:
 * Referral cannot be directly closed at IDENTIFIED or REFERRED.
 * Must be closed via supervisor approval or marked COMPLETED/ESCALATED first.
 */
export function isClosureAllowed(statusBeforeClose: string, userRole: string): boolean {
  if (userRole === "ADMIN" || userRole === "SUPERVISOR") {
    return true; // Supervisors and admins can override and close any referral
  }
  return canCloseReferral(statusBeforeClose);
}
