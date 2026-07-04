import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { seedDatabase } from "../../../../../prisma/seed";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    // Allow any logged-in demo reviewer to trigger data resets to ease testing
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Triggering native database seed reset...");
    await seedDatabase();
    
    return NextResponse.json({ 
      success: true, 
      message: "Database re-seeded successfully." 
    });
  } catch (error: any) {
    console.error("Reset Seeds API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
