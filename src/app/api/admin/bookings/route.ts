import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";

    const where: Prisma.BookingWhereInput = {};
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, studentVerificationStatus: true } },
        ride: {
          include: { driver: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Failed to fetch admin bookings:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
