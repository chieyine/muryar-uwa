import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canCloseMissedVisit, getChildScope, mergeWhere } from "@/lib/permissions";

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

    const { id } = await params;
    const { status, reasonForMissedVisit } = await request.json();

    if (!status || !reasonForMissedVisit) {
      return NextResponse.json({ error: "Status and reason notes are required" }, { status: 400 });
    }
    const visitToClose = await prisma.missedVisit.findFirst({
      where: mergeWhere({ id }, getChildScope(session)),
    });
    if (!visitToClose) {
      return NextResponse.json({ error: "Missed visit not found" }, { status: 404 });
    }
    if (!canCloseMissedVisit(session, visitToClose)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const visit = await prisma.missedVisit.update({
      where: { id: visitToClose.id },
      data: {
        status,
        reasonForMissedVisit,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, visit });
  } catch (error: any) {
    console.error("Missed Visit Close Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
