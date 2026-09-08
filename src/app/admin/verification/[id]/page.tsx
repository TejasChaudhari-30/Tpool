import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerificationReviewForm } from "./VerificationReviewForm";

export const dynamic = "force-dynamic";

export default async function AdminVerificationDetailPage({ params }: { params: { id: string } }) {
  const verification = await prisma.verification.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      admin: { select: { name: true } },
    },
  });

  if (!verification) {
    notFound();
  }

  const documentUrl = `/api/verifications/${verification.id}/document`;
  const isPdf = verification.fileType === "application/pdf";

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/verification" className="text-xs text-muted-foreground hover:text-primary mb-2 inline-block">
          ← Back to Verification Center
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {verification.documentType.replace('_', ' ')} Review
            </h1>
            <p className="text-muted-foreground mt-1">Submitted by {verification.user.name} ({verification.user.email})</p>
          </div>
          <Badge
            variant={
              verification.status === "APPROVED"
                ? "default"
                : verification.status === "PENDING"
                ? "outline"
                : verification.status === "REUPLOAD_REQUIRED"
                ? "secondary"
                : "destructive"
            }
            className="text-sm py-1 px-3"
          >
            {verification.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User & Document Metadata */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">User &amp; Submission Details</h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">User Name</span>
              <span className="font-semibold">{verification.user.name}</span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">User Email</span>
              <span className="font-semibold">{verification.user.email}</span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">Account Created</span>
              <span>{new Date(verification.user.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="pt-2 border-t">
              <span className="text-xs text-muted-foreground block">Document Type</span>
              <span className="font-semibold">{verification.documentType.replace('_', ' ')}</span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">File Name</span>
              <span className="font-mono text-xs truncate block">{verification.fileName}</span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">Submitted Date</span>
              <span>{new Date(verification.submittedAt).toLocaleString()}</span>
            </div>

            {verification.reviewedAt && (
              <div className="pt-2 border-t">
                <span className="text-xs text-muted-foreground block">Last Reviewed</span>
                <span>{new Date(verification.reviewedAt).toLocaleString()} by {verification.admin?.name || "Admin"}</span>
              </div>
            )}

            {verification.rejectionReason && (
              <div className="pt-2 border-t">
                <span className="text-xs text-amber-600 font-semibold block">Review Reason / Note</span>
                <p className="text-xs bg-amber-500/10 p-2 rounded-md border border-amber-500/20 text-amber-900 dark:text-amber-200 mt-1">
                  {verification.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Secure Document Preview */}
        <Card className="md:col-span-2 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-semibold text-base">Secure Document Preview</h3>
              <a
                href={documentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary font-semibold hover:underline"
              >
                Open Full Screen ↗
              </a>
            </div>

            <div className="bg-muted/40 rounded-xl overflow-hidden border min-h-[350px] flex items-center justify-center relative">
              {isPdf ? (
                <iframe
                  src={documentUrl}
                  title="Secure Verification Document PDF"
                  className="w-full h-[400px] border-0"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={documentUrl}
                  alt="Secure Verification Document"
                  className="max-h-[400px] w-auto max-w-full object-contain rounded-md shadow-sm"
                />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Review Actions Form */}
      <VerificationReviewForm
        verificationId={verification.id}
        currentStatus={verification.status}
        currentReason={verification.rejectionReason}
      />
    </div>
  );
}
