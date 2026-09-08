import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";
import { VerificationDocumentType } from "@prisma/client";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "verifications");

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, userType: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (dbUser.role === "ADMIN") {
      return NextResponse.json({ message: "Admin accounts do not submit verification documents." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as VerificationDocumentType | null;

    if (!file || !documentType) {
      return NextResponse.json({ message: "File and documentType are required" }, { status: 400 });
    }

    const validTypes: VerificationDocumentType[] = ["STUDENT_ID", "DRIVING_LICENCE", "VEHICLE_RC"];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json({ message: "Invalid document type" }, { status: 400 });
    }

    // Role-based document type enforcement
    if (dbUser.userType === "PASSENGER" && documentType !== "STUDENT_ID") {
      return NextResponse.json({ message: "Passenger accounts can only submit Student ID Card verification." }, { status: 400 });
    }

    if (dbUser.userType === "DRIVER" && documentType === "STUDENT_ID") {
      return NextResponse.json({ message: "Driver accounts submit Driving Licence and Vehicle RC verification." }, { status: 400 });
    }

    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ message: "Only JPG, PNG, or PDF files are allowed" }, { status: 400 });
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: "File size must be under 10MB" }, { status: 400 });
    }

    // Read bytes for magic byte validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes to prevent spoofed/executable files
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF

    if (!isJpeg && !isPng && !isPdf) {
      return NextResponse.json({ message: "File validation failed: Corrupted or invalid file header signature." }, { status: 400 });
    }

    // Ensure uploads directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // Generate safe unique filename
    const ext = path.extname(file.name) || (isPdf ? ".pdf" : isPng ? ".png" : ".jpg");
    const uniqueFilename = `${session.user.id}_${documentType}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    // Save buffer to private uploads directory
    await fs.writeFile(filePath, buffer);

    // Transaction to create Verification record and update User verification status to PENDING
    const result = await prisma.$transaction(async (tx) => {
      const verification = await tx.verification.create({
        data: {
          userId: session.user.id,
          documentType,
          filePath: uniqueFilename,
          fileName: file.name,
          fileType: file.type,
          status: "PENDING",
        },
      });

      if (documentType === "STUDENT_ID") {
        await tx.user.update({
          where: { id: session.user.id },
          data: { studentVerificationStatus: "PENDING" },
        });
      } else if (documentType === "DRIVING_LICENCE" || documentType === "VEHICLE_RC") {
        await tx.user.update({
          where: { id: session.user.id },
          data: { driverVerificationStatus: "PENDING" },
        });
      }

      return verification;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Failed to upload document" }, { status: 500 });
  }
}
