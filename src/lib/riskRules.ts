/**
 * Risk Rules Utility for Muryar Uwa Borno
 * Implementation of rules defined in readme.md
 */

export type RiskCategory =
  | "NORMAL"
  | "AT_RISK"
  | "MODERATE_CONCERN"
  | "SEVERE_CONCERN"
  | "URGENT_REFERRAL";

export interface NutritionScreeningInput {
  muacCm?: number | null;
  oedema: boolean;
  visiblyWasted: boolean;
  householdFoodInsecurity: boolean;
}

/**
 * Classifies nutrition risk level based on screening data
 */
export function classifyNutritionRisk(input: NutritionScreeningInput): RiskCategory {
  const { muacCm, oedema, visiblyWasted, householdFoodInsecurity } = input;

  if (oedema) {
    return "URGENT_REFERRAL";
  }

  if (visiblyWasted) {
    return "SEVERE_CONCERN";
  }

  if (muacCm !== undefined && muacCm !== null) {
    if (muacCm < 19.0) {
      return "URGENT_REFERRAL";
    }
    if (muacCm >= 19.0 && muacCm < 21.0) {
      return "SEVERE_CONCERN";
    }
    if (muacCm >= 21.0 && muacCm < 23.0) {
      return "MODERATE_CONCERN";
    }
    if (muacCm >= 23.0 && householdFoodInsecurity) {
      return "AT_RISK";
    }
  } else {
    // If no MUAC is recorded but household food insecurity is present
    if (householdFoodInsecurity) {
      return "AT_RISK";
    }
  }

  return "NORMAL";
}

/**
 * Gets recommended actions for each risk category
 */
export function getRecommendedActions(riskCategory: RiskCategory): string[] {
  switch (riskCategory) {
    case "URGENT_REFERRAL":
      return [
        "Immediate emergency danger sign referral to PHC/Secondary Care facility",
        "Notify assigned community midwife",
        "Arrange direct contact/transport support",
      ];
    case "SEVERE_CONCERN":
      return [
        "Refer for Outpatient Therapeutic Program (OTP) enrollment / review",
        "Initiate nutrition counselling for mother and family",
        "Register for local food resilience support (Tom Brown demonstration)",
        "Schedule bi-weekly MUAC re-check",
      ];
    case "MODERATE_CONCERN":
      return [
        "Refer to local Supplementary Feeding Program (SFP) / nutrition group",
        "Provide maternal nutrition counselling",
        "Recommend seedling and sack-garden support",
        "Schedule monthly MUAC re-check",
      ];
    case "AT_RISK":
      return [
        "Register for household seedling/sack-garden support",
        "Recommend educational sessions on dietary diversity and local food",
        "Rescreen in 1-2 months",
      ];
    case "NORMAL":
    default:
      return [
        "Continue routine health reminders (ANC/PNC)",
        "Regular monitoring during scheduled PHC visits",
      ];
  }
}

/**
 * Checks message safety guidelines for a safe contact status
 */
export function getMessageSafety(safeContactStatus: string): {
  sendAllowed: boolean;
  neutralOnly: boolean;
  assignMobilizer: boolean;
  reason: string;
} {
  switch (safeContactStatus) {
    case "OPTED_OUT":
      return {
        sendAllowed: false,
        neutralOnly: false,
        assignMobilizer: false,
        reason: "User has opted out of all contact.",
      };
    case "NO_DIRECT_CONTACT":
      return {
        sendAllowed: false,
        neutralOnly: false,
        assignMobilizer: true,
        reason: "No direct contact allowed; home outreach required.",
      };
    case "MOBILIZER_ONLY":
      return {
        sendAllowed: false,
        neutralOnly: false,
        assignMobilizer: true,
        reason: "Direct messaging disabled; follow up via nutrition mobilizer.",
      };
    case "NEUTRAL_ONLY":
      return {
        sendAllowed: true,
        neutralOnly: true,
        assignMobilizer: false,
        reason: "Direct contact allowed with neutral health messages only.",
      };
    case "DIRECT_SAFE":
    default:
      return {
        sendAllowed: true,
        neutralOnly: false,
        assignMobilizer: false,
        reason: "Safe for direct voice, SMS, and WhatsApp messages.",
      };
  }
}

/**
 * Validates if a referral can be closed in its current state
 */
export function canCloseReferral(status: string): boolean {
  // Referral cannot be closed at IDENTIFIED or REFERRED
  return status !== "IDENTIFIED" && status !== "REFERRED";
}
