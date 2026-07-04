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

    const deliveryStatusGroups = await prisma.messageLog.groupBy({
      by: ["deliveryStatus"],
      where,
      _count: { id: true },
    });

    const channelGroups = await prisma.messageLog.groupBy({
      by: ["channel"],
      where,
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        byDeliveryStatus: deliveryStatusGroups.map((g) => ({ deliveryStatus: g.deliveryStatus, count: g._count.id })),
        byChannel: channelGroups.map((g) => ({ channel: g.channel, count: g._count.id })),
      },
    });
  } catch (error: any) {
    console.error("Dashboard Messages Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
