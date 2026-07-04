import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, lgaId, type, hasStarlink } = await request.json();
    if (!name || !lgaId || !type) {
      return NextResponse.json({ error: "Name, LGA, and Type are required" }, { status: 400 });
    }

    const facility = await prisma.facility.create({
      data: {
        name,
        lgaId,
        type,
        hasStarlink: !!hasStarlink,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, facility });
  } catch (error: any) {
    console.error("Admin Create Facility Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
