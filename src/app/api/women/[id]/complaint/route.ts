import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canLogSafeguardingConcern, getWomanScope, mergeWhere } from "@/lib/permissions";

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
    if (!canLogSafeguardingConcern(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { type, severity, description } = body;

    if (!type || !severity || !description) {
      return NextResponse.json({ error: "Missing required safeguarding fields" }, { status: 400 });
    }
    const woman = await prisma.woman.findFirst({
      where: mergeWhere({ id }, getWomanScope(session)),
    });
    if (!woman) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const flag = await prisma.complaintOrSafeguardingFlag.create({
      data: {
        womanId: id,
        type,
        severity,
        description,
        status: "OPEN",
        createdByUserId: session.userId,
      },
    });

    return NextResponse.json({ success: true, flag });
  } catch (error: any) {
    console.error("Safeguarding API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
