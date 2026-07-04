import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getChildScope, mergeWhere } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lgaId = searchParams.get("lgaId");
    const facilityId = searchParams.get("facilityId");

    const filter: any = {};
    if (lgaId || facilityId) {
      filter.woman = {};
      if (lgaId) filter.woman.lgaId = lgaId;
      if (facilityId) filter.woman.facilityId = facilityId;
    }

    const where = mergeWhere(getChildScope(session), filter);

    const riskGroups = await prisma.nutritionScreening.groupBy({
      by: ["riskCategory"],
      where,
      _count: { id: true },
    });

    const lowMuacCount = await prisma.nutritionScreening.count({
      where: mergeWhere(where, { muacCm: { lt: 23.0 } }),
    });

    const totalScreenings = await prisma.nutritionScreening.count({
      where,
    });

    return NextResponse.json({
      success: true,
      data: {
        byRiskCategory: riskGroups.map((g) => ({ riskCategory: g.riskCategory, count: g._count.id })),
        lowMuacCount,
        totalScreenings,
      },
    });
  } catch (error: any) {
    console.error("Dashboard Nutrition Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
