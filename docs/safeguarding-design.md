# Safeguarding Design Document — Muryar Uwa Borno

This document outlines the safeguarding mechanisms built into Muryar Uwa Borno.

## 1. Phone Safety & Shared Phone Assessment
Many participants in Borno State borrow, share, or don't own phones. Sending reminders containing words like "nutrition risk", "malnourished", or reproductive health topics can occasionally create domestic risks.
- Enrolment mandates a **Safe Contact Assessment** defining which channels (Voice, SMS, WhatsApp) are safe.
- It establishes a **Safe Contact status** that governs message schedules.

## 2. Message Safety Rules
- **OPTED_OUT:** Blocks all digital log creations.
- **NO_DIRECT_CONTACT / MOBILIZER_ONLY:** Automatically intercepts message logs, tags them `MOBILIZER_ASSIGNED`, and routes follow-ups as home visits in the Missed Visits queue.
- **NEUTRAL_ONLY:** Forces the system to dispatch generic/neutral templates (e.g., "Routine health reminder from your PHC") instead of referencing clinical indicators.

## 3. Minimized GBV Logging Policy
In case of domestic safety or GBV disclosures during follow-up:
- The system prevents entering full disclosure narratives.
- It only flags the case severity level ("CRITICAL") and provides a dropdown to track safe referrals to protection partners.
- Access to these safeguarding flags is restricted to Admins and Supervisors.
