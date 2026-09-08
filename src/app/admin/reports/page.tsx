import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { name: true, email: true } },
      reportedUser: { select: { name: true, email: true } },
      ride: { select: { origin: true, destination: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports &amp; Moderation</h1>
        <p className="text-muted-foreground mt-1">Review user feedback, safety flags, and ride reports.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">All Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="p-3">Reporter</th>
                  <th className="p-3">Reported Subject</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No reports submitted yet.
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{r.reporter.name}</td>
                      <td className="p-3">
                        {r.reportedUser ? (
                          <span className="font-medium text-foreground">User: {r.reportedUser.name}</span>
                        ) : r.ride ? (
                          <span>Ride: {r.ride.origin} → {r.ride.destination}</span>
                        ) : (
                          <span className="text-muted-foreground">General</span>
                        )}
                      </td>
                      <td className="p-3 max-w-xs truncate">{r.reason}</td>
                      <td className="p-3">
                        <Badge variant={r.status === "RESOLVED" ? "default" : r.status === "PENDING" ? "outline" : "secondary"}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/reports/${r.id}`} className="text-xs font-semibold text-primary hover:underline">
                          Review →
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
