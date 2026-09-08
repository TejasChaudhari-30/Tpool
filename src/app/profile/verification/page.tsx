import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerificationUploadForm } from "./VerificationUploadForm";

export const dynamic = "force-dynamic";

export default async function UserVerificationPortal() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      verifications: { orderBy: { submittedAt: "desc" } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <Link href="/profile" className="text-xs text-muted-foreground hover:text-primary mb-2 inline-block">
          ← Back to Profile
        </Link>
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardHeader>
            <CardTitle className="text-xl text-amber-900 dark:text-amber-200">Admin Account Verification Notice</CardTitle>
            <CardDescription className="text-amber-800/80 dark:text-amber-300/80">
              Admin accounts do not submit personal verification documents. Review user submissions from the Admin Panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/verification"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Go to Admin Verification Center
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const studentDoc = user.verifications.find((v) => v.documentType === "STUDENT_ID");
  const licenceDoc = user.verifications.find((v) => v.documentType === "DRIVING_LICENCE");
  const rcDoc = user.verifications.find((v) => v.documentType === "VEHICLE_RC");

  const showStudentSection = user.userType === "PASSENGER" || user.userType === "BOTH";
  const showDriverSection = user.userType === "DRIVER" || user.userType === "BOTH";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <Link href="/profile" className="text-xs text-muted-foreground hover:text-primary mb-2 inline-block">
          ← Back to Profile
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Identity &amp; Eligibility Verification</h1>
        <p className="text-muted-foreground mt-1">
          Verify your student status and driving credentials to earn trust badges on Tpool.
        </p>
      </div>

      <div className={`grid grid-cols-1 ${showStudentSection && showDriverSection ? 'md:grid-cols-2' : ''} gap-6`}>
        
        {/* Student Verification Box */}
        {showStudentSection && (
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Student Identity Verification</CardTitle>
                  <CardDescription className="mt-1">
                    Upload your College / University Student ID card to earn the <span className="font-semibold text-foreground">Verified Student</span> badge.
                  </CardDescription>
                </div>
                <Badge variant={user.studentVerificationStatus === "APPROVED" ? "default" : "outline"}>
                  {user.studentVerificationStatus === "APPROVED" ? "Verified Student" : user.studentVerificationStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentDoc && studentDoc.rejectionReason && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-md text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-semibold block mb-0.5">Admin Note / Feedback:</span>
                  {studentDoc.rejectionReason}
                </div>
              )}

              <VerificationUploadForm
                documentType="STUDENT_ID"
                currentStatus={user.studentVerificationStatus}
                label="Student ID Card (JPG, PNG, or PDF)"
              />
            </CardContent>
          </Card>
        )}

        {/* Driver Verification Box */}
        {showDriverSection && (
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Driver Authorization</CardTitle>
                  <CardDescription className="mt-1">
                    Upload your Government-issued Driving Licence to earn the <span className="font-semibold text-foreground">Verified Driver</span> badge.
                  </CardDescription>
                </div>
                <Badge variant={user.driverVerificationStatus === "APPROVED" ? "default" : "outline"}>
                  {user.driverVerificationStatus === "APPROVED" ? "Verified Driver" : user.driverVerificationStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {licenceDoc && licenceDoc.rejectionReason && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-md text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-semibold block mb-0.5">Admin Note / Feedback:</span>
                  {licenceDoc.rejectionReason}
                </div>
              )}

              <VerificationUploadForm
                documentType="DRIVING_LICENCE"
                currentStatus={licenceDoc?.status || "NOT_SUBMITTED"}
                label="Driving Licence (Required)"
              />

              <div className="pt-4 border-t">
                {rcDoc && rcDoc.rejectionReason && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 mb-3 rounded-md text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-semibold block mb-0.5">Admin Note / Feedback (RC):</span>
                    {rcDoc.rejectionReason}
                  </div>
                )}
                <VerificationUploadForm
                  documentType="VEHICLE_RC"
                  currentStatus={rcDoc?.status || "NOT_SUBMITTED"}
                  label="Vehicle Registration Certificate (RC) (Recommended)"
                />
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
