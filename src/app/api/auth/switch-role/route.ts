import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateToken, getSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // Lookup corresponding seeded user
    const user = await prisma.user.findFirst({
      where: {
        role: role.toUpperCase(),
        isActive: true,
      },
      include: {
        facility: true,
        lga: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: `Seeded user for role ${role} not found in database.` },
        { status: 404 }
      );
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as any,
      lgaId: user.lgaId,
      facilityId: user.facilityId,
    };

    const token = generateToken(sessionPayload);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        facility: user.facility ? { id: user.facility.id, name: user.facility.name } : null,
        lga: user.lga ? { id: user.lga.id, name: user.lga.name } : null,
      },
    });
  } catch (error: any) {
    console.error("Switch Role API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
