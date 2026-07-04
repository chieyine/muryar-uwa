import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import NavigationClient from "./NavigationClient";
import ReviewerControlRoom from "@/components/ReviewerControlRoom";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar & Navigation Header are managed client-side for interactions */}
      <NavigationClient user={session}>
        {children}
      </NavigationClient>
      <ReviewerControlRoom currentUser={session} />
    </div>
  );
}
