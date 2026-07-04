import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { classifyNutritionRisk } from "@/lib/riskRules";
import { ROLE_GROUPS, canAccessFacility, getWomanScope, hasRole, mergeWhere } from "@/lib/permissions";
import { minimizeParticipantsForUser } from "@/lib/privacy";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasRole(session.role, ROLE_GROUPS.WRITE_WOMEN)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      // Basic Info
      fullName,
      codedName,
      age,
      community,
      lgaId,
      facilityId,
      pregnancyStatus,
      breastfeedingStatus,
      caregiverStatus,
      childInOtp,
      childDischargedFromSc,
      consentGiven,
      // Contact & Safe Communication
      phone,
      alternatePhone,
      preferredLanguage,
      preferredChannel,
      safeContactStatus,
      safeContactTime,
      ownsPhone,
      sharedPhone,
      sharedWith,
      safeForCalls,
      safeForSms,
      safeForWhatsapp,
      neutralMessagesOnly,
      unsafeTopics,
      // Screening Info (Optional)
      hasInitialScreening,
      muacCm,
      oedema,
      visiblyWasted,
      appetiteConcern,
      householdFoodInsecurity,
    } = body;

    // Validation
    if (!consentGiven) {
      return NextResponse.json({ error: "Consent is required for enrolment" }, { status: 400 });
    }
    if (!age || !community || !lgaId || !facilityId || !preferredLanguage || !preferredChannel || !safeContactStatus) {
      return NextResponse.json({ error: "Missing required basic fields" }, { status: 400 });
    }
    const targetFacility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: { id: true, lgaId: true },
    });
    if (!targetFacility || targetFacility.lgaId !== lgaId) {
      return NextResponse.json({ error: "Invalid facility selection" }, { status: 400 });
    }
    if (!canAccessFacility(session, targetFacility)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate unique Muryar Uwa ID
    const count = await prisma.woman.count();
    const uniqueCode = `ML-EN-${1000 + count + 1}`;

    const newWoman = await prisma.$transaction(async (tx) => {
      // 1. Create Woman
      const woman = await tx.woman.create({
        data: {
          uniqueCode,
          fullName: fullName || null,
          codedName: codedName || null,
          age: parseInt(age),
          phone: phone || null,
          alternatePhone: alternatePhone || null,
          lgaId,
          facilityId,
          community,
          pregnancyStatus,
          breastfeedingStatus,
          caregiverStatus: !!caregiverStatus,
          childInOtp: !!childInOtp,
          childDischargedFromSc: !!childDischargedFromSc,
          consentGiven: !!consentGiven,
          preferredLanguage,
          preferredChannel,
          safeContactStatus,
          safeContactTime,
          registeredByUserId: session.userId,
          status: safeContactStatus === "OPTED_OUT" ? "OPTED_OUT" : "ACTIVE",
        },
      });

      // 2. Create Safe Contact Assessment
      await tx.safeContactAssessment.create({
        data: {
          womanId: woman.id,
          ownsPhone: !!ownsPhone,
          sharedPhone: !!sharedPhone,
          sharedWith: sharedWith || null,
          safeForCalls: !!safeForCalls,
          safeForSms: !!safeForSms,
          safeForWhatsapp: !!safeForWhatsapp,
          preferredTime: safeContactTime || null,
          neutralMessagesOnly: !!neutralMessagesOnly,
          unsafeTopics: unsafeTopics || null,
          mobilizerFollowUpPreferred: safeContactStatus === "MOBILIZER_ONLY" || safeContactStatus === "NO_DIRECT_CONTACT",
          directContactAllowed: safeContactStatus === "DIRECT_SAFE" || safeContactStatus === "NEUTRAL_ONLY",
          assessedByUserId: session.userId,
        },
      });

      // 3. Create Screening (if supplied)
      let calculatedRisk = "NORMAL";
      if (hasInitialScreening) {
        const riskVal = classifyNutritionRisk({
          muacCm: muacCm ? parseFloat(muacCm) : null,
          oedema: !!oedema,
          visiblyWasted: !!visiblyWasted,
          householdFoodInsecurity: !!householdFoodInsecurity,
        });
        calculatedRisk = riskVal;

        await tx.nutritionScreening.create({
          data: {
            womanId: woman.id,
            muacCm: muacCm ? parseFloat(muacCm) : null,
            oedema: !!oedema,
            visiblyWasted: !!visiblyWasted,
            appetiteConcern: !!appetiteConcern,
            pregnantOrBreastfeeding: pregnancyStatus === "PREGNANT" || breastfeedingStatus === "BREASTFEEDING",
            householdFoodInsecurity: !!householdFoodInsecurity,
            riskCategory: riskVal,
            screenedByUserId: session.userId,
            nextScreeningDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next check in 30 days
          },
        });

        // 4. Trigger Automatic Referrals based on screening risk
        if (riskVal === "URGENT_REFERRAL" || riskVal === "SEVERE_CONCERN" || riskVal === "MODERATE_CONCERN") {
          let refType = "PHC_REVIEW";
          let priority = "MEDIUM";
          let reason = "Nutrition risk identified during screening.";

          if (riskVal === "URGENT_REFERRAL") {
            refType = "EMERGENCY";
            priority = "URGENT";
            reason = "Urgent danger signs / Severe acute malnutrition with oedema.";
          } else if (riskVal === "SEVERE_CONCERN") {
            refType = "OTP_FOLLOW_UP";
            priority = "HIGH";
            reason = "Severe concern: Low MUAC or visibly wasted caregiver.";
          } else if (riskVal === "MODERATE_CONCERN") {
            refType = "NUTRITION_COUNSELLING";
            priority = "MEDIUM";
            reason = "Moderate concern: Low MUAC screening.";
          }

          const ref = await tx.referral.create({
            data: {
              womanId: woman.id,
              referralType: refType,
              priority: priority,
              status: "IDENTIFIED",
              reason,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              createdByUserId: session.userId,
            },
          });

          await tx.referralUpdate.create({
            data: {
              referralId: ref.id,
              status: "IDENTIFIED",
              note: "Automatic referral logged by system risk triggers.",
              updatedByUserId: session.userId,
            },
          });
        }
      }

      // 5. Automatic Messaging triggers based on conditions
      // Find relevant templates
      let templateCategory = "SAFE_CONTACT";
      if (pregnancyStatus === "PREGNANT") {
        templateCategory = "ANC_REMINDER";
      } else if (breastfeedingStatus === "BREASTFEEDING") {
        templateCategory = "MATERNAL_NUTRITION";
      } else if (childInOtp) {
        templateCategory = "OTP_REMINDER";
      }

      const templates = await tx.messageTemplate.findMany({
        where: {
          category: templateCategory,
          language: preferredLanguage,
          isActive: true,
        },
        take: 1,
      });

      const selectedTemplate = templates[0] || await tx.messageTemplate.findFirst({
        where: { language: preferredLanguage, isActive: true },
      });

      if (selectedTemplate && safeContactStatus !== "OPTED_OUT") {
        const deliverStatus = (safeContactStatus === "NO_DIRECT_CONTACT" || safeContactStatus === "MOBILIZER_ONLY")
          ? "MOBILIZER_ASSIGNED"
          : "PENDING";

        await tx.messageLog.create({
          data: {
            womanId: woman.id,
            templateId: selectedTemplate.id,
            channel: preferredChannel,
            scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Schedule in 2 days
            deliveryStatus: deliverStatus,
          },
        });
      }

      // 6. Assign missed visit/outreach tasks if phone is unsafe
      if (safeContactStatus === "NO_DIRECT_CONTACT" || safeContactStatus === "MOBILIZER_ONLY") {
        await tx.missedVisit.create({
          data: {
            womanId: woman.id,
            visitType: hasInitialScreening ? "MUAC_RECHECK" : "ANC",
            expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "OPEN",
            reasonForMissedVisit: "Participant unreachable by phone; mobilizer outreach scheduled.",
          },
        });
      }

      return woman;
    });

    return NextResponse.json({ success: true, woman: newWoman });
  } catch (error: any) {
    console.error("Enrolment API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lgaId = searchParams.get("lgaId");
    const facilityId = searchParams.get("facilityId");
    const preferredLanguage = searchParams.get("preferredLanguage");
    const safeContactStatus = searchParams.get("safeContactStatus");
    const pregnancyStatus = searchParams.get("pregnancyStatus");
    const breastfeedingStatus = searchParams.get("breastfeedingStatus");
    const childInOtp = searchParams.get("childInOtp");
    const childDischargedFromSc = searchParams.get("childDischargedFromSc");
    const riskCategory = searchParams.get("riskCategory");

    // Build filter object
    const filter: any = {};
    if (lgaId) filter.lgaId = lgaId;
    if (facilityId) filter.facilityId = facilityId;
    if (preferredLanguage) filter.preferredLanguage = preferredLanguage;
    if (safeContactStatus) filter.safeContactStatus = safeContactStatus;
    if (pregnancyStatus) filter.pregnancyStatus = pregnancyStatus;
    if (breastfeedingStatus) filter.breastfeedingStatus = breastfeedingStatus;
    if (childInOtp !== null) filter.childInOtp = childInOtp === "true";
    if (childDischargedFromSc !== null) filter.childDischargedFromSc = childDischargedFromSc === "true";

    const women = await prisma.woman.findMany({
      where: mergeWhere(getWomanScope(session), filter),
      include: {
        lga: true,
        facility: true,
        nutritionScreenings: {
          orderBy: { screenedAt: "desc" },
          take: 1,
        },
        referrals: {
          where: { status: { notIn: ["COMPLETED", "CLOSED"] } },
        },
      },
      orderBy: { registrationDate: "desc" },
    });

    // Post-filter by riskCategory if requested
    let result = women;
    if (riskCategory) {
      result = women.filter((w) => {
        const latestScreening = w.nutritionScreenings[0];
        return latestScreening?.riskCategory === riskCategory;
      });
    }

    return NextResponse.json({ success: true, women: minimizeParticipantsForUser(result, session) });
  } catch (error: any) {
    console.error("GET Women API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
