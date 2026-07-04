# User Journeys — Muryar Uwa Borno

This file captures end-to-end paths of frontline actors inside Muryar Uwa Borno.

## 1. Journey A: Enrolling a Pregnant Woman (CHEW / Midwife)
1. **Login:** A CHEW at Muna PHC logs into the portal.
2. **Consent & Demographics:** CHEW enters the participant's age and community. The participant requests a coded profile for privacy, so the name is left blank and `ML-ANON-XYZ` is generated.
3. **Assessment:** The CHEW logs that the woman shares her phone with her husband, and she only wants neutral messages.
4. **Nutrition:** The CHEW measures the woman's MUAC at `22.0 cm` (Moderate Concern).
5. **Auto-Trigger:** The system schedules a monthly MUAC re-check and schedules a neutral-theme maternal nutrition advice call.

## 2. Journey B: Missed OTP Visit Follow-up (Nutrition Mobilizer)
1. **Triggers:** A participant misses her child's OTP food pick-up appointment at Dalori PHC.
2. **Flagged:** The system generates a missed visit entry flagged as "OPEN".
3. **Outreach:** Because her phone contact preference was set to "Mobilizer Only" (no direct calls), the missed visit is assigned to a community mobilizer.
4. **Action:** The mobilizer receives the task, visits the household, provides complementary feeding counselling, and helps the mother schedule a new OTP appointment.
5. **Resolution:** The mobilizer logs the reason ("Lack of transport support") and closes the missed visit task.
