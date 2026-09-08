import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prisma, VerificationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminPassengersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const search = searchParams.search || "";
  const status = searchParams.status || "";

  const where: Prisma.UserWhereInput = {
    bookings: { some: {} },
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (status) {
    where.studentVerificationStatus = status as VerificationStatus;
  }

  const passengers = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Passenger Directory</h1>
        <p className="text-muted-foreground mt-1">Manage users who have booked rides on the platform.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters &amp; Search</CardTitle>
          <form method="GET" className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search passenger by name or email..."
              className="flex-1 px-3 py-2 text-sm rounded-md border bg-background"
            />
            <select
              name="status"
              defaultValue={status}
              className="px-3 py-2 text-sm rounded-md border bg-background"
            >
              <option value="">All Verification Statuses</option>
              <option value="APPROVED">Verified Student</option>
              <option value="PENDING">Pending Approval</option>
              <option value="REJECTED">Rejected</option>
              <option value="NOT_SUBMITTED">Not Submitted</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              Filter
            </button>
          </form>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="p-3">Passenger</th>
                  <th className="p-3">Student Verification</th>
                  <th className="p-3">Bookings Count</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {passengers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                      No passengers found matching criteria.
                    </td>
                  </tr>
                ) : (
                  passengers.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant={p.studentVerificationStatus === "APPROVED" ? "default" : "outline"}>
                          {p.studentVerificationStatus === "APPROVED" ? "Verified Student" : p.studentVerificationStatus}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">{p._count.bookings}</td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/passengers/${p.id}`} className="text-xs font-semibold text-primary hover:underline">
                          View Passenger →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
