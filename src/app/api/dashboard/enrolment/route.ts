import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getFacilityScope, getWomanScope, mergeWhere } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lgaId = searchParams.get("lgaId");

    const filter: any = {};
    if (lgaId) filter.lgaId = lgaId;
    const womanScope = getWomanScope(session);

    // Group by Facility
    const facilitiesWithCount = await prisma.facility.findMany({
      where: mergeWhere(getFacilityScope(session), lgaId ? { lgaId } : {}),
      orderBy: { name: "asc" },
    });

    const enrolmentByFacility = await Promise.all(facilitiesWithCount.map(async (f) => ({
      facilityId: f.id,
      facilityName: f.name,
      count: await prisma.woman.count({ where: mergeWhere(womanScope, { facilityId: f.id }) }),
    })));

    // Group by LGA
    const lgasWithCount = await prisma.lGA.findMany({
      where: session.role === "SUPERVISOR" && session.lgaId ? { id: session.lgaId } : filter,
      orderBy: { name: "asc" },
    });

    const enrolmentByLga = await Promise.all(lgasWithCount.map(async (l) => ({
      lgaId: l.id,
      lgaName: l.name,
      count: await prisma.woman.count({ where: mergeWhere(womanScope, { lgaId: l.id }) }),
    })));

    return NextResponse.json({
      success: true,
      data: {
        enrolmentByFacility,
        enrolmentByLga,
      },
    });
  } catch (error: any) {
    console.error("Dashboard Enrolment Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
