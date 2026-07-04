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

    const statusGroups = await prisma.referral.groupBy({
      by: ["status"],
      where,
      _count: { id: true },
    });

    const typeGroups = await prisma.referral.groupBy({
      by: ["referralType"],
      where,
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        byStatus: statusGroups.map((g) => ({ status: g.status, count: g._count.id })),
        byType: typeGroups.map((g) => ({ referralType: g.referralType, count: g._count.id })),
      },
    });
  } catch (error: any) {
    console.error("Dashboard Referrals Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
