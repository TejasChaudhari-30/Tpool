import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./UserActions";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      rides: { orderBy: { departure: "desc" } },
      bookings: { include: { ride: true }, orderBy: { createdAt: "desc" } },
      verifications: { orderBy: { submittedAt: "desc" } },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/users" className="text-xs text-muted-foreground hover:text-primary mb-2 inline-block">
          ← Back to Users
        </Link>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>{user.role}</Badge>
            <Badge variant={user.status === "ACTIVE" ? "default" : "destructive"}>{user.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 space-y-6 p-6">
          <h3 className="font-semibold text-lg border-b pb-2">User Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">Joined Date</span>
              <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Student Verification</span>
              <Badge variant={user.studentVerificationStatus === "APPROVED" ? "default" : "outline"} className="mt-1">
                {user.studentVerificationStatus}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Driver Verification</span>
              <Badge variant={user.driverVerificationStatus === "APPROVED" ? "default" : "outline"} className="mt-1">
                {user.driverVerificationStatus}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg border-b pb-2 mb-4">Admin Actions</h3>
          <UserActions userId={user.id} currentRole={user.role} currentStatus={user.status} />
        </Card>
      </div>

      {/* Verification Documents History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submitted Verifications ({user.verifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {user.verifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No verification documents submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {user.verifications.map((v) => (
                <div key={v.id} className="flex justify-between items-center p-3 border rounded-lg text-sm">
                  <div>
                    <span className="font-medium">{v.documentType.replace('_', ' ')}</span>
                    <span className="text-xs text-muted-foreground block">Submitted: {new Date(v.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={v.status === "APPROVED" ? "default" : v.status === "PENDING" ? "outline" : "secondary"}>
                      {v.status}
                    </Badge>
                    <Link href={`/admin/verification/${v.id}`} className="text-xs text-primary font-semibold hover:underline">
                      View Submission
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
