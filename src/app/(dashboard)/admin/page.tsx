import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Security check: restrict page to ADMIN role
  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    include: {
      facility: { select: { name: true } },
      lga: { select: { name: true } },
    },
    orderBy: { fullName: "asc" },
  });

  // Fetch all LGAs
  const lgas = await prisma.lGA.findMany({
    orderBy: { name: "asc" },
  });

  // Fetch all facilities
  const facilities = await prisma.facility.findMany({
    include: {
      lga: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  // Fetch templates
  const templates = await prisma.messageTemplate.findMany({
    orderBy: { category: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950 tracking-tight">System Administration</h2>
        <p className="text-sm text-slate-600">
          Configure LGAs, register facilities, manage staff permissions, and update outreach templates.
        </p>
      </div>

      <AdminClient
        users={users}
        lgas={lgas}
        facilities={facilities}
        templates={templates}
      />
    </div>
  );
}
