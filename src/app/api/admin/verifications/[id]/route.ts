import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const verification = await prisma.verification.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, studentVerificationStatus: true, driverVerificationStatus: true } },
        admin: { select: { id: true, name: true } },
      },
    });

    if (!verification) {
      return NextResponse.json({ message: "Verification not found" }, { status: 404 });
    }

    return NextResponse.json(verification);
  } catch (error) {
    console.error("Failed to fetch verification detail:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action, rejectionReason } = body; // action: "APPROVE" | "REJECT" | "REUPLOAD_REQUIRED"

    if (!["APPROVE", "REJECT", "REUPLOAD_REQUIRED"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    if ((action === "REJECT" || action === "REUPLOAD_REQUIRED") && (!rejectionReason || !rejectionReason.trim())) {
      return NextResponse.json({ message: "A reason is required when rejecting or requesting re-upload" }, { status: 400 });
    }

    const verification = await prisma.verification.findUnique({
      where: { id: params.id },
    });

    if (!verification) {
      return NextResponse.json({ message: "Verification not found" }, { status: 404 });
    }

    let targetStatus: VerificationStatus = "PENDING";
    if (action === "APPROVE") targetStatus = "APPROVED";
    if (action === "REJECT") targetStatus = "REJECTED";
    if (action === "REUPLOAD_REQUIRED") targetStatus = "REUPLOAD_REQUIRED";

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update verification record
      const updatedVerification = await tx.verification.update({
        where: { id: params.id },
        data: {
          status: targetStatus,
          rejectionReason: (action === "REJECT" || action === "REUPLOAD_REQUIRED") ? rejectionReason.trim() : null,
          reviewedAt: new Date(),
          adminId: session.user.id,
        },
      });

      // 2. Sync User model status
      if (verification.documentType === "STUDENT_ID") {
        await tx.user.update({
          where: { id: verification.userId },
          data: { studentVerificationStatus: targetStatus },
        });
      } else if (verification.documentType === "DRIVING_LICENCE" || verification.documentType === "VEHICLE_RC") {
        await tx.user.update({
          where: { id: verification.userId },
          data: { driverVerificationStatus: targetStatus },
        });
      }

      return updatedVerification;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update verification:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
