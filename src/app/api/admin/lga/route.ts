import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, state } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "LGA name is required" }, { status: 400 });
    }

    const lga = await prisma.lGA.create({
      data: { name, state: state || "Borno" },
    });

    return NextResponse.json({ success: true, lga });
  } catch (error: any) {
    console.error("Admin Create LGA Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
