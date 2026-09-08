import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prisma, VerificationDocumentType, VerificationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminVerificationCenterPage({
  searchParams,
}: {
  searchParams: { status?: string; documentType?: string; search?: string };
}) {
  const status = searchParams.status || "";
  const documentType = searchParams.documentType || "";
  const search = searchParams.search || "";

  const where: Prisma.VerificationWhereInput = {};
  if (status) where.status = status as VerificationStatus;
  if (documentType) where.documentType = documentType as VerificationDocumentType;
  if (search) {
    where.user = {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    };
  }

  const verifications = await prisma.verification.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      admin: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verification Center</h1>
        <p className="text-muted-foreground mt-1">Review student IDs and driver government documents to verify users.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters &amp; Search</CardTitle>
          <form method="GET" className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by user name or email..."
              className="flex-1 px-3 py-2 text-sm rounded-md border bg-background"
            />
            <select
              name="status"
              defaultValue={status}
              className="px-3 py-2 text-sm rounded-md border bg-background"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REUPLOAD_REQUIRED">Re-upload Required</option>
            </select>
            <select
              name="documentType"
              defaultValue={documentType}
              className="px-3 py-2 text-sm rounded-md border bg-background"
            >
              <option value="">All Document Types</option>
              <option value="STUDENT_ID">Student ID Card</option>
              <option value="DRIVING_LICENCE">Driving Licence</option>
              <option value="VEHICLE_RC">Vehicle RC</option>
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
                  <th className="p-3">User</th>
                  <th className="p-3">Document Type</th>
                  <th className="p-3">Submitted Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reviewed By</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {verifications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No verification requests found matching criteria.
                    </td>
                  </tr>
                ) : (
                  verifications.map((v) => (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{v.user.name}</div>
                        <div className="text-xs text-muted-foreground">{v.user.email}</div>
                      </td>
                      <td className="p-3 font-medium">
                        {v.documentType.replace('_', ' ')}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(v.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            v.status === "APPROVED"
                              ? "default"
                              : v.status === "PENDING"
                              ? "outline"
                              : v.status === "REUPLOAD_REQUIRED"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {v.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {v.admin?.name || "—"}
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/admin/verification/${v.id}`}
                          className="px-3 py-1.5 text-xs font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                        >
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
