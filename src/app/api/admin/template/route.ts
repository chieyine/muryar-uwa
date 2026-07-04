import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, category, language, channel, contentText } = await request.json();
    if (!title || !category || !language || !channel || !contentText) {
      return NextResponse.json({ error: "All template fields are required" }, { status: 400 });
    }

    const template = await prisma.messageTemplate.create({
      data: {
        title,
        category,
        language,
        channel,
        contentText,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error("Admin Create Template Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
