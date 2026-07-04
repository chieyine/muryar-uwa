Yes — **showing them a working platform or even a strong clickable prototype can increase your chances**, but only if it does three things:

1. It proves FRAD can actually build and manage digital tools.
2. It shows the woman’s journey clearly, not just a dashboard.
3. It does not make reviewers think the project is already fully built and no longer needs funding.

The best approach is to build a **minimum viable Muryar Uwa demo**: enough to show enrolment, safe contact assessment, voice-first pathway, referral tracking, nutrition-risk follow-up, Tom Brown/seedling support, and dashboard. Do not try to build everything before submission.

Below is a **super detailed README** you can give to Claude/Codex or use as your own technical planning document.

---

# Muryar Uwa Borno Platform README

## Project Name

**Muryar Uwa Borno**

## Tagline

A voice-first digital health and nutrition follow-up system for women, mothers and caregivers in Borno State.

## Project Purpose

Muryar Uwa Borno is a women-centred digital platform designed to support pregnant women, breastfeeding women, mothers, caregivers, and nutritionally vulnerable women through PHCs and community follow-up.

The platform helps FRAD Foundation and PHC teams enrol women, assess safe communication preferences, screen for nutrition vulnerability, send voice/SMS/WhatsApp follow-up messages, track referrals, follow missed visits, and support practical nutrition-resilience actions such as Tom Brown demonstrations, MUAC follow-up, seedlings and sack-garden support.

Muryar Uwa is not a general digital literacy platform. It is not a marketplace. It is not a broad agriculture or livelihood platform. It is a focused digital health and nutrition agency tool for women.

## Core Problem

In Borno State, FRAD has seen mothers and caregivers who are themselves malnourished while caring for children with acute malnutrition. Nutrition programming often focuses on the child, while the mother’s own nutrition, follow-up needs, food insecurity, phone access, decision-making barriers, and missed referrals are not consistently tracked.

Many women face:

- low literacy;
- shared or borrowed phones;
- unsafe phone access;
- poor network;
- limited airtime or data;
- missed ANC/PNC/OTP visits;
- weak referral follow-up;
- poor access to nutrition counselling after leaving the PHC;
- food insecurity;
- limited practical support for household food diversity.

Muryar Uwa addresses this by creating a safe, voice-first, PHC-linked follow-up pathway.

## Primary Users

### 1. Women beneficiaries

These include:

- pregnant women;
- breastfeeding women;
- mothers of children under five;
- caregivers of children in OTP;
- caregivers of children discharged from SC;
- adolescent mothers;
- women of reproductive age attending PHC services;
- women identified as malnourished or nutritionally vulnerable;
- women with unsafe or limited phone access.

Women are the primary users. Children benefit through better maternal support, but the system is designed around the woman.

### 2. CHEWs

CHEWs use the frontline app to:

- enrol women;
- conduct safe contact assessment;
- screen for nutrition vulnerability;
- create referrals;
- follow up missed visits;
- record counselling;
- update referral outcomes;
- flag women needing mobilizer follow-up.

### 3. Midwives

Midwives use the frontline app to:

- enrol pregnant and breastfeeding women;
- track ANC and PNC follow-up;
- provide maternal nutrition counselling;
- record danger signs;
- refer women for PHC/secondary care;
- follow low-MUAC pregnant or breastfeeding women.

### 4. Nutrition mobilizers

Mobilizers use the app to:

- conduct community follow-up;
- trace missed visits;
- support women without phones;
- support women with unsafe phone access;
- organize Tom Brown demonstrations;
- support seedlings and sack-garden activities;
- follow women’s nutrition-resilience groups;
- update referral and follow-up status.

### 5. FRAD supervisors

Supervisors use the dashboard to:

- monitor enrolment;
- track referral completion;
- monitor PHC performance;
- identify unresolved cases;
- monitor active users;
- review nutrition-resilience activities;
- review safeguarding flags;
- export reports.

### 6. BSPHCDA / PHC Board reviewers

Government reviewers use a restricted dashboard to:

- view summary indicators;
- track PHC-level performance;
- review referral completion;
- support quarterly learning and coordination.

---

# Product Vision

Muryar Uwa should show that FRAD can build a practical digital platform for real humanitarian and PHC conditions.

The platform must be:

- **voice-first**;
- **offline-first**;
- **low-bandwidth**;
- **safe for women with shared phones**;
- **easy for CHEWs/midwives/mobilizers**;
- **useful for supervisors**;
- **focused on follow-up, not just registration**;
- **grounded in nutrition and maternal health**.

The platform should make it obvious that FRAD understands field realities in Borno.

---

# MVP Scope for Grant Demo

For the grant application, build a demo that shows the core workflow. It does not need full telecom integration yet.

## MVP must include

### 1. Login and role-based access

Roles:

- Admin
- Supervisor
- CHEW
- Midwife
- Mobilizer
- PHC Board Viewer

Each role should see only what they need.

### 2. Facility setup

Admin can create:

- LGA
- PHC
- staff user
- assigned role
- assigned PHC
- assigned supervisor

Example PHCs:

- Muna PHC
- Gwange PHC
- Custom House PHC
- Dalori PHC
- Gubio Camp PHC

### 3. Woman enrolment

Staff can enrol a woman with:

- unique ID;
- name or coded name;
- age;
- phone number if available;
- alternative phone if available;
- LGA;
- community;
- PHC;
- pregnancy status;
- breastfeeding status;
- caregiver status;
- child in OTP? yes/no;
- child discharged from SC? yes/no;
- consent;
- preferred language;
- preferred channel;
- safe contact time;
- shared phone status;
- safe content level;
- opt-out option.

### 4. Safe contact assessment

This is very important. It should be visible in the demo.

Fields:

- Is this your own phone?
- Is the phone shared?
- Who else uses the phone?
- Can you safely receive calls?
- Can you safely receive SMS?
- Can you safely receive WhatsApp?
- What time is safest?
- Are neutral health messages preferred?
- Are any topics unsafe to send?
- Should mobilizer follow-up be used instead?
- Consent to receive messages?

Safe contact status:

- Safe for direct contact
- Neutral messages only
- Mobilizer follow-up preferred
- No direct phone contact
- Opted out

### 5. Nutrition screening

Fields:

- MUAC reading
- oedema yes/no
- visibly wasted yes/no
- pregnant/breastfeeding yes/no
- appetite concern yes/no
- child under five in OTP yes/no
- child recently discharged from SC yes/no
- household food insecurity concern yes/no

Risk category:

- Normal
- At risk
- Moderate nutrition concern
- Severe nutrition concern
- Urgent referral needed

For the demo, risk classification can be rule-based, not clinical AI.

### 6. Referral tracker

Create referral types:

- ANC
- PNC
- PHC review
- Nutrition counselling
- MUAC recheck
- OTP follow-up
- SC follow-up
- Tom Brown demonstration
- Seedling/sack-garden support
- FSL/social protection referral
- Protection referral
- Emergency danger sign referral

Referral status:

- Identified
- Counselled
- Referred
- Message sent
- Reached
- Attended
- Completed
- Not reached
- Escalated
- Closed

The referral must not close automatically when created. It should close only when action is completed or escalated.

### 7. Messaging module demo

For MVP, create a simulated messaging module.

It does not need real SMS/IVR integration yet.

It should show:

- message templates;
- language;
- channel;
- scheduled date;
- delivery status;
- response status;
- next action.

Channels:

- Voice call
- IVR
- SMS
- WhatsApp voice note
- Mobilizer follow-up

Example message categories:

- ANC reminder
- PNC reminder
- OTP return reminder
- SC discharge follow-up
- Maternal nutrition
- Breastfeeding
- Complementary feeding
- Danger signs
- Tom Brown demonstration invite
- MUAC recheck reminder
- Seedling/sack-garden session reminder
- Hygiene/cholera prevention

### 8. Nutrition-resilience module

This must be carefully framed.

It should not look like agriculture/livelihood project.

The module should include:

- Tom Brown demonstration attended;
- local food counselling received;
- MUAC follow-up done;
- seedling support received;
- sack-garden support received;
- linked to nutrition-resilience group;
- linked to available FSL/social protection service;
- follow-up date.

Eligibility:

- low MUAC;
- pregnant or breastfeeding;
- caregiver of child with SAM;
- child discharged from SC;
- household food insecurity concern;
- supervisor approved.

### 9. Missed visit tracing

The system should flag:

- missed ANC appointment;
- missed PNC appointment;
- missed OTP visit;
- missed MUAC recheck;
- missed Tom Brown demonstration;
- missed referral appointment.

Actions:

- call woman;
- send voice message;
- send SMS;
- assign mobilizer;
- reschedule;
- escalate.

### 10. Dashboard

Dashboard should show:

- total women enrolled;
- active digital users;
- women by PHC;
- women by LGA;
- preferred language;
- preferred channel;
- safe contact category;
- MUAC risk categories;
- referrals created;
- referrals completed;
- open referrals;
- missed visits;
- women reached by mobilizers;
- Tom Brown demonstrations completed;
- women receiving seedling/sack-garden support;
- complaints/safeguarding flags;
- cost per active woman, optional;
- PHC performance ranking.

### 11. Reports

Reports should export:

- enrolment summary;
- referral completion summary;
- PHC performance summary;
- nutrition-resilience summary;
- safeguarding-safe contact summary;
- missed visit tracing summary.

Export formats:

- CSV
- Excel
- PDF later

---

# Technical Architecture

## Recommended Stack

For speed, use a web-first MVP with mobile-responsive frontend, then later build Android offline app.

### Option A: Fastest MVP

Use:

- Frontend: React / Next.js
- Backend: Node.js / NestJS or Express
- Database: PostgreSQL
- ORM: Prisma
- Authentication: NextAuth / Clerk / custom JWT
- Hosting: Render / Railway / Fly.io / Vercel + Supabase
- File storage: Supabase Storage or S3-compatible
- SMS/WhatsApp later: Termii, Twilio, Africa’s Talking, SendChamp or local provider
- IVR later: Africa’s Talking / Twilio / local IVR provider

### Option B: More production-ready

Use:

- Frontend: React / Next.js
- Backend: NestJS
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT + RBAC
- Offline mobile app: Kotlin Android later
- Message queue: BullMQ / Redis
- Background jobs: message scheduling and reminders
- Hosting: AWS / GCP / Azure / Hetzner / Render
- Monitoring: Sentry
- Analytics: Metabase or custom dashboard

### Option C: If using Supabase

Use:

- Next.js
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Supabase Edge Functions
- Supabase Storage
- Metabase or custom dashboard

This is the fastest for demo.

---

# Suggested MVP Technology Choice

For the grant demo, use:

```text
Next.js + Supabase + TailwindCSS + PostgreSQL + Recharts
```

Why:

- fast to build;
- easy authentication;
- easy database;
- good dashboard;
- easy deployment;
- enough for a convincing demo;
- can later be converted to a production architecture.

---

# Repository Structure

```text
muryaruwa-borno/
  README.md
  .env.example
  package.json
  next.config.js
  tailwind.config.js
  prisma/
    schema.prisma
    seed.ts
  src/
    app/
      login/
      dashboard/
      women/
      women/new/
      women/[id]/
      referrals/
      referrals/[id]/
      messages/
      nutrition-resilience/
      missed-visits/
      reports/
      admin/
      settings/
    components/
      layout/
      forms/
      dashboard/
      tables/
      charts/
      status/
    lib/
      auth.ts
      db.ts
      permissions.ts
      validators.ts
      messageTemplates.ts
      riskRules.ts
      referralRules.ts
    server/
      actions/
      services/
      jobs/
    types/
      index.ts
  docs/
    product-requirements.md
    data-dictionary.md
    demo-script.md
    safeguarding-design.md
    user-journeys.md
```

---

# Data Model

## User

```ts
User {
  id: string
  fullName: string
  email: string
  phone?: string
  role: "ADMIN" | "SUPERVISOR" | "CHEW" | "MIDWIFE" | "MOBILIZER" | "PHC_BOARD_VIEWER"
  lgaId?: string
  facilityId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

## LGA

```ts
LGA {
  id: string
  name: string
  state: "Borno"
  facilities: Facility[]
}
```

## Facility

```ts
Facility {
  id: string
  name: string
  lgaId: string
  type: "PHC" | "SC" | "OTP" | "OUTREACH_POINT"
  hasStarlink: boolean
  isActive: boolean
  createdAt: Date
}
```

## Woman

```ts
Woman {
  id: string
  uniqueCode: string
  fullName?: string
  codedName?: string
  age: number
  phone?: string
  alternatePhone?: string
  lgaId: string
  facilityId: string
  community: string
  pregnancyStatus: "PREGNANT" | "NOT_PREGNANT" | "UNKNOWN"
  breastfeedingStatus: "BREASTFEEDING" | "NOT_BREASTFEEDING" | "UNKNOWN"
  caregiverStatus: boolean
  childInOtp: boolean
  childDischargedFromSc: boolean
  consentGiven: boolean
  preferredLanguage: "HAUSA" | "KANURI" | "FULFULDE" | "ENGLISH"
  preferredChannel: "VOICE" | "IVR" | "SMS" | "WHATSAPP_VOICE" | "MOBILIZER"
  safeContactStatus: "DIRECT_SAFE" | "NEUTRAL_ONLY" | "MOBILIZER_ONLY" | "NO_DIRECT_CONTACT" | "OPTED_OUT"
  safeContactTime?: string
  registeredByUserId: string
  registrationDate: Date
  status: "ACTIVE" | "INACTIVE" | "TRANSFERRED" | "OPTED_OUT"
  createdAt: Date
  updatedAt: Date
}
```

## SafeContactAssessment

```ts
SafeContactAssessment {
  id: string
  womanId: string
  ownsPhone: boolean
  sharedPhone: boolean
  sharedWith?: string
  safeForCalls: boolean
  safeForSms: boolean
  safeForWhatsapp: boolean
  preferredTime?: string
  neutralMessagesOnly: boolean
  unsafeTopics?: string
  mobilizerFollowUpPreferred: boolean
  directContactAllowed: boolean
  assessedByUserId: string
  assessedAt: Date
}
```

## NutritionScreening

```ts
NutritionScreening {
  id: string
  womanId: string
  muacCm?: number
  oedema: boolean
  visiblyWasted: boolean
  appetiteConcern: boolean
  pregnantOrBreastfeeding: boolean
  householdFoodInsecurity: boolean
  riskCategory: "NORMAL" | "AT_RISK" | "MODERATE_CONCERN" | "SEVERE_CONCERN" | "URGENT_REFERRAL"
  screenedByUserId: string
  screenedAt: Date
  nextScreeningDate?: Date
}
```

## Referral

```ts
Referral {
  id: string
  womanId: string
  referralType:
    | "ANC"
    | "PNC"
    | "PHC_REVIEW"
    | "NUTRITION_COUNSELLING"
    | "MUAC_RECHECK"
    | "OTP_FOLLOW_UP"
    | "SC_FOLLOW_UP"
    | "TOM_BROWN_DEMO"
    | "SEEDLING_SUPPORT"
    | "FSL_SOCIAL_PROTECTION"
    | "PROTECTION"
    | "EMERGENCY"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status:
    | "IDENTIFIED"
    | "COUNSELLED"
    | "REFERRED"
    | "MESSAGE_SENT"
    | "REACHED"
    | "ATTENDED"
    | "COMPLETED"
    | "NOT_REACHED"
    | "ESCALATED"
    | "CLOSED"
  reason: string
  destination?: string
  dueDate?: Date
  createdByUserId: string
  assignedToUserId?: string
  completedAt?: Date
  closedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

## ReferralUpdate

```ts
ReferralUpdate {
  id: string
  referralId: string
  status: ReferralStatus
  note: string
  updatedByUserId: string
  createdAt: Date
}
```

## MessageTemplate

```ts
MessageTemplate {
  id: string
  title: string
  category:
    | "ANC_REMINDER"
    | "PNC_REMINDER"
    | "OTP_REMINDER"
    | "SC_FOLLOWUP"
    | "MATERNAL_NUTRITION"
    | "BREASTFEEDING"
    | "COMPLEMENTARY_FEEDING"
    | "DANGER_SIGNS"
    | "TOM_BROWN"
    | "SEEDLING"
    | "HYGIENE"
    | "SAFE_CONTACT"
  language: "HAUSA" | "KANURI" | "FULFULDE" | "ENGLISH"
  channel: "VOICE" | "IVR" | "SMS" | "WHATSAPP_VOICE"
  contentText: string
  audioUrl?: string
  isActive: boolean
}
```

## MessageLog

```ts
MessageLog {
  id: string
  womanId: string
  templateId: string
  channel: "VOICE" | "IVR" | "SMS" | "WHATSAPP_VOICE" | "MOBILIZER"
  scheduledAt: Date
  sentAt?: Date
  deliveryStatus: "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "SKIPPED_UNSAFE" | "MOBILIZER_ASSIGNED"
  responseStatus?: "NO_RESPONSE" | "CONFIRMED" | "CALLBACK_REQUESTED" | "HELP_NEEDED"
  providerMessageId?: string
  createdAt: Date
}
```

## NutritionResilienceActivity

```ts
NutritionResilienceActivity {
  id: string
  womanId: string
  activityType:
    | "TOM_BROWN_DEMO"
    | "LOCAL_FOOD_DEMO"
    | "MUAC_FOLLOWUP"
    | "SEEDLING_SUPPORT"
    | "SACK_GARDEN_SUPPORT"
    | "NUTRITION_GROUP"
    | "FSL_REFERRAL"
    | "SOCIAL_PROTECTION_REFERRAL"
  eligibilityReason:
    | "LOW_MUAC"
    | "PREGNANT"
    | "BREASTFEEDING"
    | "CAREGIVER_OF_SAM_CHILD"
    | "SC_DISCHARGE_CAREGIVER"
    | "HOUSEHOLD_FOOD_INSECURITY"
    | "SUPERVISOR_APPROVED"
  status: "PLANNED" | "ATTENDED" | "RECEIVED" | "REFERRED" | "COMPLETED" | "MISSED"
  activityDate: Date
  followUpDate?: Date
  notes?: string
  recordedByUserId: string
  createdAt: Date
}
```

## MissedVisit

```ts
MissedVisit {
  id: string
  womanId: string
  visitType:
    | "ANC"
    | "PNC"
    | "OTP"
    | "SC_FOLLOWUP"
    | "MUAC_RECHECK"
    | "TOM_BROWN_DEMO"
    | "REFERRAL_APPOINTMENT"
  expectedDate: Date
  status: "OPEN" | "CONTACTED" | "RESCHEDULED" | "COMPLETED" | "ESCALATED" | "CLOSED"
  assignedToUserId?: string
  reasonForMissedVisit?: string
  createdAt: Date
  updatedAt: Date
}
```

## ComplaintOrSafeguardingFlag

```ts
ComplaintOrSafeguardingFlag {
  id: string
  womanId?: string
  type:
    | "COMPLAINT"
    | "SAFE_CONTACT_CONCERN"
    | "GBV_DISCLOSURE"
    | "DATA_PRIVACY"
    | "STAFF_CONDUCT"
    | "FRAUD"
    | "OTHER"
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  description: string
  status: "OPEN" | "IN_REVIEW" | "REFERRED" | "RESOLVED" | "CLOSED"
  assignedToUserId?: string
  createdByUserId: string
  createdAt: Date
  closedAt?: Date
}
```

---

# Key Workflows

## Workflow 1: Enrol a Woman

1. Staff logs in.
2. Staff selects PHC.
3. Staff clicks “Enrol Woman.”
4. Staff records consent.
5. Staff enters demographic and contact information.
6. Staff conducts safe contact assessment.
7. Staff records pregnancy/breastfeeding/caregiver status.
8. Staff records preferred language and channel.
9. Staff saves record.
10. System generates unique Muryar Uwa ID.
11. System suggests next step:

- nutrition screening;
- ANC referral;
- PNC referral;
- OTP follow-up;
- message schedule;
- mobilizer follow-up.

## Workflow 2: Safe Contact Decision

If woman selects:

### Direct safe

System allows voice/SMS/WhatsApp.

### Neutral only

System sends only neutral health/nutrition reminders.

### Mobilizer only

System does not send phone messages. It creates mobilizer follow-up task.

### No direct contact

System blocks messages and requires supervisor-approved follow-up.

### Opted out

System stops messaging.

## Workflow 3: Nutrition Screening

1. Staff opens woman profile.
2. Clicks “New Nutrition Screening.”
3. Enters MUAC and risk fields.
4. System classifies risk.
5. System suggests:
   - PHC review;
   - nutrition counselling;
   - Tom Brown demo;
   - MUAC recheck;
   - seedling/sack-garden support;
   - FSL/social protection referral;
   - urgent referral.

## Workflow 4: Create Referral

1. Staff selects referral type.
2. Adds reason.
3. Selects priority.
4. Sets due date.
5. Assigns to CHEW/midwife/mobilizer.
6. System tracks status.
7. Referral remains open until completed, escalated or closed.

## Workflow 5: Missed Visit Tracing

1. System checks due dates daily.
2. Missed visits are flagged.
3. Staff dashboard shows missed visits.
4. Staff attempts contact.
5. If phone unsafe or unreachable, mobilizer is assigned.
6. Outcome is recorded.
7. Visit is rescheduled, completed, escalated or closed.

## Workflow 6: Message Scheduling

1. Woman enrolled.
2. System checks safe contact status.
3. System checks preferred language and channel.
4. System selects template.
5. System schedules message.
6. Message log created.
7. Delivery status updated manually in MVP or via provider later.
8. Failed messages create follow-up task.

## Workflow 7: Nutrition-Resilience Support

1. Woman identified as vulnerable.
2. Staff records eligibility reason.
3. Staff schedules Tom Brown demo or local food session.
4. Staff records attendance.
5. Staff records seedling/sack-garden support if provided.
6. Staff schedules MUAC follow-up.
7. Staff links to available FSL/social protection services where available.
8. Supervisor reviews activity summary.

---

# Risk Rules for MVP

These are simple rules for demo purposes. They should be reviewed by nutrition experts before production use.

## Nutrition risk classification

```text
If oedema = yes:
  urgent referral

Else if visibly wasted = yes:
  severe concern

Else if MUAC < 19.0 cm:
  urgent referral

Else if MUAC >= 19.0 and < 21.0 cm:
  severe concern

Else if MUAC >= 21.0 and < 23.0 cm:
  moderate concern

Else if MUAC >= 23.0 and household food insecurity = yes:
  at risk

Else:
  normal
```

Note: MUAC thresholds for adult women and pregnant/breastfeeding women should be aligned with applicable national/sector guidance before real deployment.

## Message safety rule

```text
If safeContactStatus = OPTED_OUT:
  do not send message

If safeContactStatus = NO_DIRECT_CONTACT:
  do not send message; assign mobilizer

If safeContactStatus = MOBILIZER_ONLY:
  do not send message; assign mobilizer

If safeContactStatus = NEUTRAL_ONLY:
  send only neutral templates

If safeContactStatus = DIRECT_SAFE:
  send selected approved templates
```

## Referral closure rule

```text
Referral cannot be closed at IDENTIFIED or REFERRED.

Referral can only be closed after:
  COMPLETED, or
  ESCALATED with note, or
  supervisor-approved closure.
```

---

# Pages and UI Requirements

## Login Page

Fields:

- email
- password

After login, redirect based on role.

## Main Dashboard

Cards:

- Total women enrolled
- Active users
- Safe contact completed
- Open referrals
- Completed referrals
- Missed visits
- Low MUAC women
- Tom Brown demos completed
- Seedling/sack-garden support
- Safeguarding flags

Charts:

- enrolment by PHC;
- referral completion rate;
- women by communication channel;
- women by language;
- nutrition risk category;
- open referrals by type;
- missed visits by PHC.

## Women List Page

Table columns:

- Muryar Uwa ID
- Name/coded name
- Age
- PHC
- Community
- Language
- Channel
- Safe contact status
- Risk category
- Open referrals
- Last contact
- Status

Filters:

- PHC
- LGA
- language
- safe contact status
- risk category
- pregnancy status
- breastfeeding status
- child in OTP
- child discharged from SC

## Woman Profile Page

Sections:

1. Basic information
2. Safe contact assessment
3. Nutrition screening history
4. Referrals
5. Message history
6. Missed visits
7. Nutrition-resilience activities
8. Complaints/safeguarding flags
9. Notes

Actions:

- new screening;
- create referral;
- schedule message;
- assign mobilizer;
- record activity;
- record complaint;
- opt out;
- update safe contact.

## New Enrolment Page

Multi-step form:

Step 1: Consent
Step 2: Basic information
Step 3: Contact and safe communication
Step 4: Pregnancy/breastfeeding/caregiver status
Step 5: Initial nutrition screening
Step 6: Recommended next actions

## Referral Page

Referral table:

- woman ID
- referral type
- priority
- assigned to
- due date
- status
- last update
- PHC

Referral details:

- status timeline;
- notes;
- updates;
- close/escalate buttons.

## Messages Page

Tabs:

- Templates
- Scheduled
- Sent
- Failed
- Unsafe/skipped
- Mobilizer follow-up

## Nutrition-Resilience Page

Track:

- Tom Brown demo
- Local food demo
- MUAC follow-up
- Seedling support
- Sack-garden support
- Nutrition group
- FSL/social protection referral

## Missed Visits Page

Table:

- woman ID
- visit type
- expected date
- days overdue
- assigned to
- status
- action

## Reports Page

Export:

- enrolment report;
- referral report;
- safe contact report;
- nutrition screening report;
- activity report;
- PHC performance report.

## Admin Page

Admin can manage:

- users;
- roles;
- facilities;
- LGAs;
- message templates;
- referral types;
- activity types;
- system settings.

---

# Dashboard Indicator Definitions

## Enrolled woman

A woman who has consented and has a Muryar Uwa profile.

## Active digital user

A woman who receives at least one verified Muryar Uwa digital or assisted-digital touchpoint through voice, IVR, SMS, WhatsApp or mobilizer follow-up.

## Engaged user

A woman who receives two or more touchpoints or completes an action, such as:

- attending ANC;
- completing referral;
- receiving counselling;
- attending Tom Brown demonstration;
- receiving MUAC follow-up;
- receiving seedling/sack-garden support;
- using callback or mobilizer pathway.

## Referral completion rate

```text
completed referrals / total referrals created
```

## Missed visit tracing rate

```text
missed visits contacted or resolved / total missed visits flagged
```

## Safe contact completion rate

```text
women with safe contact assessment / total enrolled women
```

---

# Message Templates for Demo

## English examples

### ANC reminder

```text
Hello. This is Muryar Uwa from your PHC. Please remember your ANC visit. If you feel weak, dizzy, have bleeding, severe headache or swelling, please go to the PHC immediately.
```

### Maternal nutrition

```text
Hello. Try to eat small nutritious meals when you can. Beans, groundnut, millet, maize, vegetables, eggs or fish when available can help strengthen you and your baby.
```

### Tom Brown demonstration

```text
Hello. Your PHC team is organizing a Tom Brown demonstration for mothers. Please attend if it is safe for you. You will learn how to prepare a nutritious local food mixture.
```

### OTP follow-up

```text
Hello. Please remember your child’s OTP follow-up day. If you cannot come, inform the PHC worker or mobilizer so they can support you.
```

### MUAC follow-up

```text
Hello. Please return to the PHC or meet the mobilizer for your MUAC follow-up. This helps us know if your nutrition is improving.
```

### Seedling/sack-garden reminder

```text
Hello. Your nutrition group will meet for sack-garden and seedling support. This is to help improve household food diversity with small vegetables at home.
```

### Neutral message

```text
Hello. This is a health reminder from your PHC. Please remember your next visit and contact the PHC worker if you need support.
```

---

# Safeguarding Design Requirements

## Must-have safeguards

- consent before enrolment;
- safe contact assessment;
- neutral messages option;
- opt-out option;
- no direct messaging where unsafe;
- role-based access;
- password-protected accounts;
- limited sensitive data collection;
- complaint reporting;
- safeguarding flagging;
- supervisor escalation;
- audit trail.

## Data minimization rule

Do not collect sensitive details that are not needed for follow-up.

## Shared phone safety

Never assume the phone belongs to the woman.

## Message safety

All sensitive templates must be approved before use.

## Protection disclosure

If a woman discloses GBV/protection concern, the platform should only record minimal safe referral information, not detailed case narratives.

---

# Demo Data to Seed

Create seed data for:

- 5 LGAs
- 10 PHCs
- 40 women
- 10 staff users
- 80 referrals
- 50 message logs
- 20 nutrition screenings
- 15 nutrition-resilience activities
- 10 missed visits
- 3 safeguarding flags

Example PHCs:

```text
Muna PHC
Gwange PHC
Dalori PHC
Gubio Road PHC
Custom House PHC
Mairi PHC
Bulabulin PHC
Mashamari PHC
Old Maiduguri PHC
Gomari PHC
```

Example users:

```text
Admin User
FRAD Supervisor
CHEW Muna
Midwife Muna
Mobilizer Jere
PHC Board Viewer
```

---

# Demo Script for Reviewers

Use this flow when showing the platform:

## Step 1: Start with the problem

Say:

> “This platform was built from what FRAD sees in Borno: mothers caring for malnourished children while they themselves are weak, food insecure or malnourished. Muryar Uwa helps us treat the woman as a primary client, not only as the caregiver of the child.”

## Step 2: Enrol a woman

Show the enrolment form.

Emphasize:

- consent;
- language;
- safe contact;
- shared phone;
- preferred channel.

Say:

> “The system does not assume every woman has a private phone. Safe contact is part of enrolment.”

## Step 3: Show nutrition screening

Enter MUAC and risk details.

Say:

> “This helps us identify women who may need more than reminders — counselling, MUAC follow-up, Tom Brown demonstration, seedlings or referral.”

## Step 4: Create referral

Create a PHC/nutrition referral.

Say:

> “A referral is not closed just because we wrote it. It remains open until the woman is reached and the action is completed or escalated.”

## Step 5: Show messaging

Show scheduled voice/SMS/WhatsApp message.

Say:

> “Muryar Uwa is voice-first because many women may not read SMS comfortably. WhatsApp is optional, not required.”

## Step 6: Show nutrition-resilience

Show Tom Brown and seedling/sack-garden activity.

Say:

> “This is not a separate agriculture project. It is targeted nutrition-resilience support for women identified as malnourished or vulnerable.”

## Step 7: Show dashboard

Show indicators.

Say:

> “This allows FRAD and PHC Board to know who is being reached, who is missed, and which referrals are still open.”

## Step 8: Close with digital agency

Say:

> “For us, digital agency means the woman can choose how she is reached, receive information in her language, act on it, complete referrals and get practical support.”

---

# Build Phases

## Phase 0: Grant Demo

Timeline: 5–10 days

Build:

- login;
- dashboard;
- enrolment;
- safe contact;
- nutrition screening;
- referral tracking;
- message simulation;
- nutrition-resilience activities;
- missed visits;
- reports;
- demo data.

No real telecom integration needed.

## Phase 1: Pilot MVP

Timeline: 1–2 months

Add:

- real user authentication;
- real database;
- better RBAC;
- SMS integration;
- WhatsApp integration;
- offline support planning;
- audit trail;
- basic exports;
- full mobile responsiveness.

## Phase 2: Field Pilot

Timeline: 2–4 months

Add:

- Android offline app or PWA offline mode;
- real PHC deployment;
- field testing;
- Hausa/Kanuri/Fulfulde audio;
- real message delivery;
- dashboard review;
- user feedback.

## Phase 3: Scale

Timeline: 5–18 months

Add:

- IVR integration;
- automated scheduling;
- advanced reporting;
- supervisor workflows;
- BSPHCDA dashboard;
- multi-LGA scale;
- data quality checks;
- open data learning outputs.

---

# Security and Privacy Requirements

## Authentication

- email/password login;
- password reset;
- role-based access;
- session timeout.

## Authorization

Admin can see all.
Supervisor can see assigned LGAs/PHCs.
CHEW/midwife can see assigned PHC.
Mobilizer can see assigned tasks.
PHC Board viewer can see aggregate reports only.

## Audit Trail

Track:

- who created record;
- who updated record;
- what changed;
- when changed.

## Data protection

- encrypt database at rest where possible;
- secure backups;
- HTTPS only;
- no public exposure of participant data;
- anonymized exports for learning.

---

# API Endpoints

## Auth

```http
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/reset-password
```

## Women

```http
GET /api/women
POST /api/women
GET /api/women/:id
PATCH /api/women/:id
POST /api/women/:id/opt-out
```

## Safe Contact

```http
POST /api/women/:id/safe-contact
GET /api/women/:id/safe-contact
PATCH /api/safe-contact/:id
```

## Nutrition Screening

```http
POST /api/women/:id/nutrition-screening
GET /api/women/:id/nutrition-screenings
```

## Referrals

```http
GET /api/referrals
POST /api/referrals
GET /api/referrals/:id
PATCH /api/referrals/:id
POST /api/referrals/:id/updates
POST /api/referrals/:id/close
POST /api/referrals/:id/escalate
```

## Messages

```http
GET /api/message-templates
POST /api/message-templates
POST /api/messages/schedule
GET /api/messages/logs
PATCH /api/messages/:id/status
```

## Nutrition Resilience

```http
GET /api/nutrition-resilience
POST /api/nutrition-resilience
PATCH /api/nutrition-resilience/:id
```

## Missed Visits

```http
GET /api/missed-visits
POST /api/missed-visits
PATCH /api/missed-visits/:id
POST /api/missed-visits/:id/assign
POST /api/missed-visits/:id/close
```

## Dashboard

```http
GET /api/dashboard/summary
GET /api/dashboard/enrolment
GET /api/dashboard/referrals
GET /api/dashboard/nutrition
GET /api/dashboard/messages
GET /api/dashboard/phc-performance
```

## Reports

```http
GET /api/reports/enrolment.csv
GET /api/reports/referrals.csv
GET /api/reports/nutrition.csv
GET /api/reports/activities.csv
```

---

# Development Setup

## Requirements

```text
Node.js 20+
PostgreSQL
npm or pnpm
Git
```

## Install

```bash
git clone https://github.com/frad-foundation/muryaruwa-borno.git
cd muryaruwa-borno
npm install
```

## Environment variables

Create `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/muryaruwa"
NEXTAUTH_SECRET="replace-with-secret"
NEXTAUTH_URL="http://localhost:3000"

SMS_PROVIDER_API_KEY=""
WHATSAPP_PROVIDER_API_KEY=""
IVR_PROVIDER_API_KEY=""

APP_ENV="development"
```

## Database migration

```bash
npx prisma migrate dev
npx prisma db seed
```

## Run development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Acceptance Criteria for Demo

The demo is ready when:

- Admin can log in.
- Supervisor can view dashboard.
- CHEW can enrol woman.
- Safe contact assessment works.
- Nutrition screening creates risk category.
- Referral can be created and updated.
- Referral cannot close without completion/escalation.
- Message can be scheduled or simulated.
- Unsafe contact blocks direct messages.
- Nutrition-resilience activity can be recorded.
- Missed visit can be assigned to mobilizer.
- Dashboard updates with demo data.
- Reports can export CSV.
- Demo script can be completed in under 10 minutes.

---

# What to Show in the Application

Do not say:

> “The platform is fully built and deployed.”

Say:

> “FRAD has developed a working Muryar Uwa prototype that demonstrates the core user journey: enrolment, safe contact assessment, voice-first follow-up, referral tracking, nutrition-risk screening, Tom Brown/seedling support tracking and dashboard review. The grant will support user testing, full deployment, telecom/IVR integration, field rollout through 25 PHCs and scale to 50,000 women.”

This is the best positioning.

It shows seriousness but still justifies the funding.

---

# Does showing the platform increase chances?

Yes, it can — **if presented correctly**.

It increases your chances because it shows:

- FRAD is not just writing ideas;
- you have in-house technical capacity;
- the concept is buildable;
- the workflow is realistic;
- the budget for technology is credible;
- your Starlink success is useful;
- UNICEF’s positive feedback on your OTP tool fits a pattern of real innovation.

But do not overbuild. A clean prototype is better than a messy “complete” system.

What reviewers should see is:

> “FRAD already understands the problem and has the capacity to build. The grant will help them test, deploy, integrate and scale responsibly.”

That is exactly the impression you want.
