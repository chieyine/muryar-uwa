# Product Requirements Document (PRD) — Muryar Uwa Borno

## 1. Product Goals
Muryar Uwa Borno is a dedicated digital maternal health and nutrition follow-up system targeting pregnant and breastfeeding women, caregivers, and adolescent mothers in Borno State, Nigeria. It aims to improve clinic attendance (ANC/PNC), reduce referral drop-offs, and track household nutrition-resilience support (e.g., Tom Brown local food preparation, seedling kits).

## 2. Core Functional Requirements
- **Role-Based Access (RBAC):** Distinct dashboards and features for Admins, Supervisors, Midwives, CHEWs, Mobilizers, and PHC Board Reviewers.
- **Woman Enrolment:** A consent-first registration workflow. Supports coded name generation for safety/anonymity.
- **Safe Contact Assessment:** Rigorous evaluation of phone safety before sending any messages (Neutral Messages Only, Direct Safe, Mobilizer Only, No Direct Contact).
- **Nutrition Screening:** MUAC screening logic to classify risk levels (Urgent Referral, Severe Concern, Moderate Concern, At Risk, Normal) and generate recommendations.
- **Referral Tracking:** End-to-end referral updates. Closure rules prevent closing a referral without prior outreach resolution (must be COMPLETED or ESCALATED first).
- **Missed Visit Tracing:** Tracing workflow for women who missed scheduled ANC, PNC, or OTP visits.
- **Simulated Messaging:** Sandbox interface to simulate scheduled voice, IVR, SMS, and WhatsApp messages in Hausa, Kanuri, Fulfulde, and English.
- **Nutrition Resilience Support:** Tracking seedlings, sack-gardening kits, and Tom Brown session attendance.
- **Reports Export:** CSV-based data exports for all activities.
