/**
 * Data validators for Muryar Uwa Borno MVP fields
 */

/**
 * Validates Nigeria format phone numbers
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  // Match +234XXXXXXXXXX or 080XXXXXXXX, etc.
  const regex = /^(?:\+234|0)[789]\d{9}$/;
  return regex.test(phone.trim());
}

/**
 * Validates MUAC reading ranges (typically between 8cm and 35cm for screening)
 */
export function validateMuac(muac: number): { isValid: boolean; error?: string } {
  if (muac < 5 || muac > 50) {
    return { isValid: false, error: "MUAC reading must be between 5.0cm and 50.0cm." };
  }
  return { isValid: true };
}

/**
 * Validates consent and basic fields for enrolment
 */
export function validateEnrolmentData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.consentGiven) {
    errors.push("Consent must be explicitly recorded.");
  }
  if (!data.age || parseInt(data.age) < 12 || parseInt(data.age) > 100) {
    errors.push("Valid age (12-100) is required.");
  }
  if (!data.community || data.community.trim().length === 0) {
    errors.push("Community name is required.");
  }
  if (!data.lgaId) {
    errors.push("LGA selection is required.");
  }
  if (!data.facilityId) {
    errors.push("Facility selection is required.");
  }
  if (!data.preferredLanguage) {
    errors.push("Preferred language is required.");
  }
  if (!data.preferredChannel) {
    errors.push("Preferred communication channel is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
