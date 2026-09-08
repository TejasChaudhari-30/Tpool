import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, VerificationDocumentType, VerificationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const documentType = searchParams.get("documentType") || "";
    const search = searchParams.get("search") || "";

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
        admin: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(verifications);
  } catch (error) {
    console.error("Failed to fetch verifications:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
