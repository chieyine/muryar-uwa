# Data Dictionary — Muryar Uwa Borno

This file describes the relational database schema implemented in `schema.prisma`.

## Tables

### 1. User
Represents staff members and administrative users.
- `id` (String, UUID): Unique identifier.
- `fullName` (String): Display name.
- `email` (String, Unique): Access email.
- `role` (String): ADMIN, SUPERVISOR, CHEW, MIDWIFE, MOBILIZER, PHC_BOARD_VIEWER.
- `facilityId` (String, Optional): Linked facility.
- `lgaId` (String, Optional): Scoped LGA.

### 2. LGA
Local Government Areas in Borno State.
- `id` (String): Unique identifier.
- `name` (String, Unique): Name of the LGA (e.g., Maiduguri, Jere).

### 3. Facility
Primary Health Care centers (PHC), Outpatient Therapeutic Programs (OTP), or Stabilisation Centres (SC).
- `id` (String): Unique identifier.
- `name` (String, Unique): Facility name.
- `type` (String): PHC, SC, OTP, OUTREACH_POINT.
- `hasStarlink` (Boolean): Indicates whether internet access exists at the facility.

### 4. Woman
The primary participant entity.
- `id` (String): Unique identifier.
- `uniqueCode` (String, Unique): Generated ID format `ML-XX-1000`.
- `fullName` / `codedName` (String, Optional): Demographic identifiers. Anonymous logs utilize coded names.
- `safeContactStatus` (String): DIRECT_SAFE, NEUTRAL_ONLY, MOBILIZER_ONLY, NO_DIRECT_CONTACT, OPTED_OUT.
- `pregnancyStatus` / `breastfeedingStatus` (String): Health states.

### 5. SafeContactAssessment
Tracks safety conditions of a participant's phone access.
- `ownsPhone` / `sharedPhone` (Boolean): Phone access profiles.
- `safeForCalls` / `safeForSms` / `safeForWhatsapp` (Boolean): Delivery permission checks.
- `neutralMessagesOnly` (Boolean): Flag to restrict direct talk.

### 6. NutritionScreening
MUAC evaluations and risk categorization.
- `muacCm` (Float, Optional): MUAC width reading.
- `riskCategory` (String): NORMAL, AT_RISK, MODERATE_CONCERN, SEVERE_CONCERN, URGENT_REFERRAL.

### 7. Referral
Scoping of follow-up tasks to facilities.
- `referralType` (String): ANC, PNC, OTP_FOLLOW_UP, etc.
- `status` (String): IDENTIFIED, ATTENDED, COMPLETED, CLOSED, etc.

### 8. MessageLog
Delivery histories for voice/SMS notifications.
- `deliveryStatus` (String): PENDING, SENT, SKIPPED_UNSAFE, MOBILIZER_ASSIGNED, etc.
