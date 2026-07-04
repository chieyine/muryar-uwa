import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { classifyNutritionRisk } from "@/lib/riskRules";
import { canLogNutritionScreening, getWomanScope, mergeWhere } from "@/lib/permissions";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canLogNutritionScreening(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { muacCm, oedema, visiblyWasted, appetiteConcern, householdFoodInsecurity } = body;

    const woman = await prisma.woman.findFirst({ where: mergeWhere({ id }, getWomanScope(session)) });
    if (!woman) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const riskVal = classifyNutritionRisk({
      muacCm: muacCm ? parseFloat(muacCm) : null,
      oedema: !!oedema,
      visiblyWasted: !!visiblyWasted,
      householdFoodInsecurity: !!householdFoodInsecurity,
    });

    const screening = await prisma.$transaction(async (tx) => {
      // 1. Create nutrition screening
      const scr = await tx.nutritionScreening.create({
        data: {
          womanId: id,
          muacCm: muacCm ? parseFloat(muacCm) : null,
          oedema: !!oedema,
          visiblyWasted: !!visiblyWasted,
          appetiteConcern: !!appetiteConcern,
          pregnantOrBreastfeeding: woman.pregnancyStatus === "PREGNANT" || woman.breastfeedingStatus === "BREASTFEEDING",
          householdFoodInsecurity: !!householdFoodInsecurity,
          riskCategory: riskVal,
          screenedByUserId: session.userId,
          nextScreeningDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // 2. Automatically trigger referral if risk level requires it
      if (riskVal === "URGENT_REFERRAL" || riskVal === "SEVERE_CONCERN" || riskVal === "MODERATE_CONCERN") {
        let refType = "PHC_REVIEW";
        let priority = "MEDIUM";
        let reason = `Nutrition concern identified during follow-up screening (MUAC: ${muacCm || "N/A"}).`;

        if (riskVal === "URGENT_REFERRAL") {
          refType = "EMERGENCY";
          priority = "URGENT";
          reason = "Emergency danger signs / Bilateral pitting oedema detected during screening.";
        } else if (riskVal === "SEVERE_CONCERN") {
          refType = "OTP_FOLLOW_UP";
          priority = "HIGH";
          reason = "SAM screening level without oedema.";
        } else if (riskVal === "MODERATE_CONCERN") {
          refType = "NUTRITION_COUNSELLING";
          priority = "MEDIUM";
        }

        const ref = await tx.referral.create({
          data: {
            womanId: id,
            referralType: refType,
            priority: priority,
            status: "IDENTIFIED",
            reason,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdByUserId: session.userId,
          },
        });

        await tx.referralUpdate.create({
          data: {
            referralId: ref.id,
            status: "IDENTIFIED",
            note: "Automatic referral logged by follow-up screening trigger.",
            updatedByUserId: session.userId,
          },
        });
      }

      return scr;
    });

    return NextResponse.json({ success: true, screening });
  } catch (error: any) {
    console.error("Screening API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
