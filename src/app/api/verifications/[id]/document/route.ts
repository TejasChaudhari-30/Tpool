import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "verifications");

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const verification = await prisma.verification.findUnique({
      where: { id: params.id },
    });

    if (!verification) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    // Security Authorization Guard:
    // Only the document owner or an authenticated ADMIN can view/download the document.
    const isOwner = verification.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: "Forbidden: You do not have permission to view this document." }, { status: 403 });
    }

    const fullPath = path.join(UPLOAD_DIR, verification.filePath);

    try {
      const fileBuffer = await fs.readFile(fullPath);
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": verification.fileType || "application/octet-stream",
          "Content-Disposition": `inline; filename="${encodeURIComponent(verification.fileName)}"`,
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      });
    } catch {
      return NextResponse.json({ message: "File not found on disk" }, { status: 404 });
    }
  } catch (error) {
    console.error("Document fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
