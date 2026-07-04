import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import EnrolmentWizard from "./EnrolmentWizard";
import { getFacilityScope } from "@/lib/permissions";

export default async function NewEnrolmentPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Only Admin, CHEW, and Midwife can enrol women
  const allowedRoles = ["ADMIN", "CHEW", "MIDWIFE"];
  if (!allowedRoles.includes(session.role)) {
    redirect("/dashboard");
  }

  // Fetch LGAs and facilities for selections
  const lgas = await prisma.lGA.findMany({
    where: session.role === "ADMIN" ? {} : session.lgaId ? { id: session.lgaId } : { id: "__deny_all__" },
    orderBy: { name: "asc" },
  });

  const facilities = await prisma.facility.findMany({
    where: getFacilityScope(session),
    orderBy: { name: "asc" },
  });

  // Serialize models for client component safety
  const serializedLgas = lgas.map((l) => ({ id: l.id, name: l.name }));
  const serializedFacilities = facilities.map((f) => ({
    id: f.id,
    name: f.name,
    lgaId: f.lgaId,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Respectful enrolment</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">New Woman Enrolment</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Register a pregnant woman, breastfeeding mother, or caregiver with consent, safe contact choices, and nutrition follow-up needs.
        </p>
      </div>

      <EnrolmentWizard lgas={serializedLgas} facilities={serializedFacilities} />
    </div>
  );
}
