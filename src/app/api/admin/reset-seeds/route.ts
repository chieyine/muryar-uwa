import { NextResponse } from "next/server";
import { exec } from "child_process";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run the prisma seed script command
    return new Promise<Response>((resolve) => {
      exec("npx prisma db seed", (error, stdout, stderr) => {
        if (error) {
          console.error(`Seed execution error: ${error}`);
          resolve(
            NextResponse.json(
              { error: "Seed reset failed", details: stderr },
              { status: 500 }
            )
          );
          return;
        }
        console.log(`Seed output: ${stdout}`);
        resolve(NextResponse.json({ success: true, message: "Database re-seeded successfully." }));
      });
    });
  } catch (error: any) {
    console.error("Reset Seeds API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
