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
    const search = searchParams.get("search") || "";

    const where: Prisma.RideWhereInput = {};
    if (search) {
      where.OR = [
        { origin: { contains: search } },
        { destination: { contains: search } },
        { driver: { name: { contains: search } } },
      ];
    }

    const rides = await prisma.ride.findMany({
      where,
      orderBy: { departure: "desc" },
      include: {
        driver: { select: { id: true, name: true, email: true, driverVerificationStatus: true } },
        _count: { select: { bookings: true, messages: true } },
      },
    });

    return NextResponse.json(rides);
  } catch (error) {
    console.error("Failed to fetch admin rides:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
