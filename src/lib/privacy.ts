import { canViewDetailedSafeContact, canViewDirectContact } from "@/lib/permissions";

type PrivacyUser = {
  role: string;
};

type AnyRecord = Record<string, any>;

function maskPhone(value: string | null | undefined) {
  if (!value) return null;
  const visible = value.slice(-4);
  return `Hidden (${visible})`;
}

export function minimizeParticipantForUser<T extends AnyRecord>(participant: T, user: PrivacyUser): T {
  const canSeeContact = canViewDirectContact(user.role);
  const canSeeSafeContactDetail = canViewDetailedSafeContact(user.role);

  const minimized: AnyRecord = { ...participant };

  if (!canSeeContact) {
    minimized.phone = null;
    minimized.alternatePhone = null;
    minimized.maskedPhone = maskPhone(participant.phone);
    minimized.maskedAlternatePhone = maskPhone(participant.alternatePhone);
  }

  if (!canSeeSafeContactDetail && Array.isArray(participant.safeContactAssessments)) {
    minimized.safeContactAssessments = participant.safeContactAssessments.map((assessment: AnyRecord) => ({
      ...assessment,
      sharedWith: assessment.sharedPhone ? "Hidden" : null,
      unsafeTopics: assessment.unsafeTopics ? "Hidden" : null,
    }));
  }

  if (!canSeeSafeContactDetail && Array.isArray(participant.complaints)) {
    minimized.complaints = participant.complaints.map((complaint: AnyRecord) => ({
      ...complaint,
      description: complaint.severity === "CRITICAL" ? "Restricted safeguarding detail" : complaint.description,
    }));
  }

  return minimized as T;
}

export function minimizeParticipantsForUser<T extends AnyRecord>(participants: T[], user: PrivacyUser): T[] {
  return participants.map((participant) => minimizeParticipantForUser(participant, user));
}

