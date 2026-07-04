# Grant Review Demo Script — Muryar Uwa Borno

Follow this script when presenting the Muryar Uwa Borno system to grant reviewers.

## Step 1: Contextualize the Borno Humanitarian Problem
**Narrative:**
> "This platform was built from what FRAD sees in Borno: mothers caring for malnourished children while they themselves are weak, food insecure or malnourished. Muryar Uwa helps us treat the woman as a primary client, not only as the caregiver of the child."

## Step 2: Consent and Safety-First Enrolment
1. Navigate to `/women/new` (or click "New Enrolment" in sidebar).
2. Show Step 1 (Consent). Check "Participant gives informed consent".
3. Show Step 2 (Demographics). Emphasize that if "Full Name" is left blank, a secure **Coded Name** is generated.
4. Show Step 3 (Safe Contact). Discuss shared phone safety.
**Narrative:**
> "The system does not assume every woman has a private phone. Safe contact is part of enrolment. If phone contact is unsafe, we restrict direct messages and schedule a mobilizer community follow-up instead."

## Step 3: Risk Classification on Nutrition Screening
1. Show Step 5 (Initial screening) of enrolment, or log a screening from a profile.
2. Check "Visibly Wasted" or set MUAC to `20.5 cm`.
3. Show Step 6 (Review & Actions). Point out the risk category: "SEVERE_CONCERN".
**Narrative:**
> "This helps us identify women who may need more than reminders — counselling, MUAC follow-up, Tom Brown demonstration, seedlings or referral."

## Step 4: Closed-Loop Referrals
1. Go to a woman's profile, create a referral of type "TOM_BROWN_DEMO".
2. Attempt to mark a new referral as "CLOSED" directly without changing to COMPLETED/ESCALATED first.
3. Show the validation blocker.
**Narrative:**
> "A referral is not closed just because we wrote it. It remains open until the woman is reached and the action is completed or escalated."

## Step 5: Voice-First Triggers & Nutrition Resilience
1. Navigate to the simulated messaging queue (`/messages`).
2. Show the voice messages scheduled in the queue.
**Narrative:**
> "Muryar Uwa is voice-first because many women may not read SMS comfortably. WhatsApp is optional, not required."
